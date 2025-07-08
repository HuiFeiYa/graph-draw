import { EntityManager, getManager } from "typeorm";
import { ExtConnection, StepManager } from "./StepManager"
import { pcmm } from "./ConnectionManager";
import { WsMessageType } from "src/types/common";
import { StepType } from "@hfdraw/types";
import { HttpException, HttpStatus } from "@nestjs/common";
import { loggerUtils } from "./LoggerUtils";
import { LogData } from "src/types/common";

/**
 * 只有一个连接负责写,写的连接不能并发执行，必须等待上一次写的接口执行结束
 */
export const WRITE_CONNECTION_NAME = "WRITE_CONNECTION";

/**
 * 读的连接可以并发，如果在读的接口中进行写操作会导致数据库异常
 */
export const READ_CONNECTION_NAME = "READ_CONNECTION";

type TranOption = {
    /**
     * 项目id，如果没有项目id则不会锁住项目，不会生成step
     */
    projectId?: string,

    /**
     * 是否申请写入锁，sqlite限制，同时只能有一个线程进行写入，必须等上一个写入完成后再进行下一次写入， 有写操作的接口，lockProject应该设置为true
     */
    lockProject?: boolean,

    /**
     * 自动初始化StepManager，初始化后将自动获得一个新的step
     */
    initStep?: boolean
    /**
     * 调用指定的连接
     */
    useConnectionName?: string
}

/**
 * 启动一个事务
 *
 * @param tranOption 事务配置项
 * @param run 执行事务的方法，所有数据库操作必须使用StepManager里的manager
 * @returns
 */
export async function transaction<T>(tranOption: TranOption, run: (stepManager: StepManager) => Promise<T>): Promise<T> {
    const {
        projectId,
        lockProject = projectId ? true : false, // 有项目id则默认加锁
        initStep = projectId ? true : false,// 有项目id则默认初始化步骤
    } = tranOption;
    const conName = tranOption.useConnectionName || (lockProject ? WRITE_CONNECTION_NAME : READ_CONNECTION_NAME);
    
    // 记录事务开始
    loggerUtils.logToFile(new LogData(
        `事务开始 - 项目ID: ${projectId || '无'}, 连接: ${conName}, 锁定项目: ${lockProject}, 初始化步骤: ${initStep}`,
        'log'
    ));
    
    let manager: EntityManager;
    try {
        console.log('Getting manager for connection:', conName);
        manager = getManager(conName);
        loggerUtils.logToFile(new LogData(`成功获取数据库管理器: ${conName}`, 'log'));
    } catch (error:any) {
        const errorMsg = `获取数据库管理器失败: ${error.message}`;
        console.error('Failed to get manager:', error);
        loggerUtils.logToFile(new LogData(errorMsg, 'error', error.stack));
        throw new Error(`Failed to get database manager: ${error.message}`);
    }
    
    let projectManager: EntityManager;
    let conn: ExtConnection;
    
    if (projectId) {        
        const databaseName = `project_${projectId}`;
        loggerUtils.logToFile(new LogData(`正在获取项目数据库连接: ${databaseName}`, 'log'));
    
        // const conn = conManager.has(projectConName) && conManager.get(projectConName);
        if (conName === WRITE_CONNECTION_NAME) {
            conn = await pcmm.getWriteConn(databaseName);
            loggerUtils.logToFile(new LogData(`获取写连接成功: ${databaseName}`, 'log'));
        } else {
            conn = await pcmm.getReadConn(databaseName);
            loggerUtils.logToFile(new LogData(`获取读连接成功: ${databaseName}`, 'log'));
        }
        
        conn.inUse = true;
        try {
            if (!conn.isConnected) {
                loggerUtils.logToFile(new LogData(`连接项目数据库: ${databaseName}`, 'log'));
                await conn.connect();
                loggerUtils.logToFile(new LogData(`项目数据库连接成功: ${databaseName}`, 'log'));
            }
            projectManager = conn.manager;
        } catch (e) {
            conn.inUse = false;
            loggerUtils.logToFile(new LogData(`项目数据库连接失败: ${databaseName} - ${e.message}`, 'error', e.stack));
            throw e;
        }
    }

    try {
        loggerUtils.logToFile(new LogData('开始执行事务...', 'log'));
        
        return await (projectManager || manager).transaction(async m => {
            let stepManager = new StepManager(manager, m, projectId);
            try {
                if (initStep) {
                    loggerUtils.logToFile(new LogData('初始化步骤管理器...', 'log'));
                    await stepManager.init();
                    loggerUtils.logToFile(new LogData('步骤管理器初始化完成', 'log'));
                }
                
                const ret = await run(stepManager);
                // 业务方法结束，提交此过程的所有步骤
                loggerUtils.logToFile(new LogData('提交步骤...', 'log'));
                await stepManager.commitStep();
                loggerUtils.logToFile(new LogData('步骤提交完成', 'log'));
                
                return { ret, stepManager };
            } catch (error) {
                const errorMsg = `事务执行失败: ${error.message}`;
                console.error('Transaction failed:', error);
                loggerUtils.logToFile(new LogData(errorMsg, 'error', error.stack));
                throw new HttpException({
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: 'Transaction failed',
                    message: error.message,
                }, HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }).then((res) => {
            if (res.stepManager.step?.changes?.length) {
                loggerUtils.logToFile(new LogData(
                    `发送WebSocket消息 - 项目ID: ${projectId}, 变更数量: ${res.stepManager.step.changes.length}`,
                    'log'
                ));
                
                // todo 将信息发送给客户度
                res.stepManager.wsService.sendToSubscribedClient(projectId, {
                    type: WsMessageType.step,
                    data: {
                        projectId,
                        changes: res.stepManager.step?.changes,
                        stepType: StepType.edit
                    }
                });
            }

            loggerUtils.logToFile(new LogData('事务执行成功', 'log'));
            return res.ret;
        });
    } finally {
        // 确保连接始终被释放，防止连接泄漏
        if (conn && projectId) {
            conn.inUse = false;
            loggerUtils.logToFile(new LogData(`释放项目数据库连接: project_${projectId}`, 'log'));
        }
        loggerUtils.logToFile(new LogData('事务结束', 'log'));
    }
}