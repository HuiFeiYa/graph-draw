"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVertexLineAB = exports.getB = exports.getPointDistance = void 0;
exports.getBoundsCenterPoint = getBoundsCenterPoint;
exports.getCloseSide = getCloseSide;
exports.int = int;
exports.float = float;
exports.getJoinPointBetweenLineAndBounds = getJoinPointBetweenLineAndBounds;
exports.getClosePoint = getClosePoint;
exports.getBoundsBorderCenterPoint = getBoundsBorderCenterPoint;
exports.getOutCenterRayLines = getOutCenterRayLines;
exports.getPointToBoundsJoinPoint = getPointToBoundsJoinPoint;
exports.getAreaOfBounds = getAreaOfBounds;
exports.getRightAngleWaypoint = getRightAngleWaypoint;
const Point_1 = require("@hfdraw/types/Point");
const constant_1 = require("./constant");
const Line_1 = require("./edgeUtil/Line");
function getBoundsCenterPoint(bounds) {
    const x = bounds.absX + bounds.width / 2;
    const y = bounds.absY + bounds.height / 2;
    return new Point_1.Point(x, y);
}
function getCloseSide(point, bounds) {
    const indexToArea = {
        0: constant_1.AreaType.top,
        1: constant_1.AreaType.right,
        2: constant_1.AreaType.bottom,
        3: constant_1.AreaType.left
    };
    const boundsLines = Line_1.Line.createBoundsSegmentLines(bounds);
    let index = 0;
    let distance = Infinity;
    boundsLines.forEach((line, i) => {
        const dis = line.getDistanceToPoint(point);
        if (dis < distance) {
            distance = dis;
            index = i;
        }
    });
    return indexToArea[index];
}
function int(num) {
    return Math.round(+num);
}
function float(num, precision = 2) {
    return parseFloat(num.toFixed(precision));
}
/**
* 获得线与bounds的交点
* @param line
* @param bounds
*/
function getJoinPointBetweenLineAndBounds(line, boundsLines, multiple = true, ctx) {
    let result = [];
    let index = 0;
    for (let line1 of boundsLines) {
        const joinPoint = line.getJoinPointWith(line1);
        if (joinPoint) {
            result.push(joinPoint);
            if (ctx) {
                ctx.indexs.push(index);
            }
            if (!multiple) {
                break;
            }
        }
        index++;
    }
    return result;
}
const getPointDistance = (p1, p2) => {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
};
exports.getPointDistance = getPointDistance;
function getClosePoint(sourcePoint, pts) {
    if (pts.length <= 1) {
        return pts[0];
    }
    let result = pts[0];
    let distance = Infinity;
    pts.forEach((pt) => {
        const dis = (0, exports.getPointDistance)(sourcePoint, pt);
        if (dis < distance) {
            result = pt;
            distance = dis;
        }
    });
    return result;
}
function getBoundsBorderCenterPoint(bounds) {
    let center = getBoundsCenterPoint(bounds);
    return {
        top: new Point_1.Point(center.x, bounds.absY),
        left: new Point_1.Point(bounds.absX, center.y),
        right: new Point_1.Point(bounds.absX + bounds.width, center.y),
        bottom: new Point_1.Point(center.x, bounds.absY + bounds.height),
    };
}
/**
* 获得bounds的外部中点的十字射线
* @param bounds
* @returns
*/
function getOutCenterRayLines(bounds) {
    const pts = getBoundsBorderCenterPoint(bounds);
    // const outCenterRayLines:{left:Line, right:Line, top:Line, bottom:Line} = {} as any;
    const top = Line_1.Line.createRayLine(pts.top, new Point_1.Point(pts.top.x, pts.top.y - 20));
    const bottom = Line_1.Line.createRayLine(pts.bottom, new Point_1.Point(pts.bottom.x, pts.bottom.y + 20));
    const right = Line_1.Line.createRayLine(pts.right, new Point_1.Point(pts.right.x + 20, pts.right.y));
    const left = Line_1.Line.createRayLine(pts.left, new Point_1.Point(pts.left.x - 20, pts.left.y));
    return [top, right, bottom, left];
}
/**
* 获得点做水平线或垂直线，到bounds的交点
* @param point
* @param bounds
* @returns
*/
function getPointToBoundsJoinPoint(point, bounds) {
    const area = getAreaOfBounds(bounds, point);
    let x = 0;
    let y = 0;
    switch (area) {
        case constant_1.AreaType.top:
            x = point.x;
            y = bounds.absY;
            break;
        case constant_1.AreaType.bottom:
            x = point.x;
            y = bounds.absY + bounds.height;
            break;
        case constant_1.AreaType.left:
            x = bounds.absX;
            y = point.y;
            break;
        case constant_1.AreaType.right:
            x = bounds.absX + bounds.width;
            y = point.y;
            break;
        default:
            return;
    }
    return new Point_1.Point(x, y);
}
/**
* 获得一个点在一个bounds的哪个区域
* @param bounds
* @param pt
*/
function getAreaOfBounds(bounds, pt) {
    if (pt.x < bounds.absX) {
        if (pt.y < bounds.absY) {
            return constant_1.AreaType.leftTop;
        }
        else if (pt.y > bounds.absY + bounds.height) {
            return constant_1.AreaType.leftBottom;
        }
        else {
            return constant_1.AreaType.left;
        }
    }
    else if (pt.x > bounds.absX + bounds.width) {
        if (pt.y < bounds.absY) {
            return constant_1.AreaType.rightTop;
        }
        else if (pt.y > bounds.absY + bounds.height) {
            return constant_1.AreaType.rightBottom;
        }
        else {
            return constant_1.AreaType.right;
        }
    }
    else {
        if (pt.y < bounds.absY) {
            return constant_1.AreaType.top;
        }
        else if (pt.y > bounds.absY + bounds.height) {
            return constant_1.AreaType.bottom;
        }
        else {
            return constant_1.AreaType.center;
        }
    }
}
/**
* 获得斜率
* @param p1 起点
* @param p2 终点
*/
const getB = (p1, p2) => {
    let b = (p2.y - p1.y) / (p2.x - p1.x);
    if (b === -Infinity) {
        b = Infinity;
    }
    return b;
};
exports.getB = getB;
// y = a*x +b ;根据一个点做此线的垂线，求垂线的a,b
// 垂线a = 1/a1
/**
 * y = 1/a * x +b
 * b = y - 1/a * x
 * b = y - a1 * x
 */
const getVertexLineAB = (a1, p) => {
    const a = 1 / a1;
    const b = p.y - a * p.x;
    return { a, b };
};
exports.getVertexLineAB = getVertexLineAB;
/**
* 从起点到终点走直角，获取其waypoint，
* @param startPoint
* @param endPoint
* @param startWithVertical 是否先走垂直
*/
function getRightAngleWaypoint(startPoint, endPoint, startWithVertical = false) {
    let centerPoint = new Point_1.Point();
    if (startWithVertical) {
        centerPoint.x = startPoint.x;
        centerPoint.y = endPoint.y;
    }
    else {
        centerPoint.x = endPoint.x;
        centerPoint.y = startPoint.y;
    }
    return [startPoint, centerPoint, endPoint];
}
