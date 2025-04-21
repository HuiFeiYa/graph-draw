import { EntityManager, getManager } from "typeorm";
import { ExtConnection, StepManager } from "./StepManager"
import { pcmm } from "./ConnectionManager";
import { WsMessageType } from "src/types/common";
import { StepType } from "@hfdraw/types";
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
        initStep = projectId ? true : false// 有项目id则默认初始化步骤
    } = tranOption;
    const conName = tranOption.useConnectionName || (lockProject ? WRITE_CONNECTION_NAME : READ_CONNECTION_NAME);
    let manager: EntityManager;
    try {
        console.log('Getting manager for connection:', conName);
        manager = getManager(conName);
    } catch (error) {
        console.error('Failed to get manager:', error);
        throw new Error(`Failed to get database manager: ${error.message}`);
    }
    let projectManager: EntityManager;
    const databaseName = `project_${projectId}`;
    let conn: ExtConnection;

    // const conn = conManager.has(projectConName) && conManager.get(projectConName);
    if (conName === WRITE_CONNECTION_NAME) {
        conn = await pcmm.getWriteConn(databaseName);

    } else {
        conn = await pcmm.getReadConn(databaseName);

    }
    conn.inUse = true;

    try {
        if (!conn.isConnected) {
            await conn.connect();
        }
        projectManager = conn.manager;
    } catch (e) {
        conn.inUse = false;
        throw e;
    }
    return projectManager.transaction(async m => {
        let stepManager = new StepManager(manager, m, projectId);
        try {

            if (initStep) await stepManager.init();
            const ret = await run(stepManager);
            // 业务方法结束，提交此过程的所有步骤
            await stepManager.commitStep();
            return { ret, stepManager };
        } catch (error) {
            throw error;
        }
    }).then((res) => {
        if (res.stepManager.step?.changes?.length) {
            //     await stepManager.wsService.
            res.stepManager.wsService.sendToSubscribedClient(projectId, {
                type: WsMessageType.step,
                data: {
                    projectId,
                    changes: res.stepManager.step?.changes,
                    stepType: StepType.edit
                }
            });

        }

        return res.ret;
    })

}