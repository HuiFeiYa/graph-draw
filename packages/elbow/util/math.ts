import { ElbowPoint } from './common-type';
import { RectangleClient } from './rectangle-client';

// https://stackoverflow.com/a/6853926/232122
export function distanceBetweenPointAndSegment(x: number, y: number, x1: number, y1: number, x2: number, y2: number) {
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSquare = C * C + D * D;
    let param = -1;
    if (lenSquare !== 0) {
        // in case of 0 length line
        param = dot / lenSquare;
    }

    let xx, yy;
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.hypot(dx, dy);
}

export function getNearestPointBetweenPointAndSegment(point: ElbowPoint, linePoints: [ElbowPoint, ElbowPoint]) {
    const x = point[0],
        y = point[1],
        x1 = linePoints[0][0],
        y1 = linePoints[0][1],
        x2 = linePoints[1][0],
        y2 = linePoints[1][1];
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSquare = C * C + D * D;
    let param = -1;
    if (lenSquare !== 0) {
        // in case of 0 length line
        param = dot / lenSquare;
    }

    let xx, yy;
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    return [xx, yy] as ElbowPoint;
}

export function distanceBetweenPointAndSegments(points: ElbowPoint[], point: ElbowPoint) {
    const len = points.length;
    let distance = Infinity;
    for (let i = 0; i < len - 1; i++) {
        const p = points[i];
        const p2 = points[i + 1];
        const currentDistance = distanceBetweenPointAndSegment(point[0], point[1], p[0], p[1], p2[0], p2[1]);
        if (currentDistance < distance) {
            distance = currentDistance;
        }
    }
    return distance;
}

export function getNearestPointBetweenPointAndSegments(point: ElbowPoint, points: ElbowPoint[], isClose: Boolean = true) {
    const len = points.length;
    let distance = Infinity;
    let result: ElbowPoint = point;

    for (let i = 0; i < len; i++) {
        const p = points[i];
        if (i === len - 1 && !isClose) continue;
        const p2 = i === len - 1 ? points[0] : points[i + 1];
        const currentDistance = distanceBetweenPointAndSegment(point[0], point[1], p[0], p[1], p2[0], p2[1]);
        if (currentDistance < distance) {
            distance = currentDistance;
            result = getNearestPointBetweenPointAndSegment(point, [p, p2]);
        }
    }
    return result;
}

export function getNearestPointBetweenPointAndEllipse(point: ElbowPoint, center: ElbowPoint, rx: number, ry: number, rotation: number = 0): ElbowPoint {
    const rectangleClient = {
        x: center[0] - rx,
        y: center[1] - ry,
        height: ry * 2,
        width: rx * 2
    };
    // https://stackoverflow.com/a/46007540/232122
    const px = Math.abs(point[0] - rectangleClient.x - rectangleClient.width / 2);
    const py = Math.abs(point[1] - rectangleClient.y - rectangleClient.height / 2);

    let tx = 0.707;
    let ty = 0.707;

    const a = Math.abs(rectangleClient.width) / 2;
    const b = Math.abs(rectangleClient.height) / 2;

    [0, 1, 2, 3].forEach((x) => {
        const xx = a * tx;
        const yy = b * ty;

        const ex = ((a * a - b * b) * tx ** 3) / a;
        const ey = ((b * b - a * a) * ty ** 3) / b;

        const rx = xx - ex;
        const ry = yy - ey;

        const qx = px - ex;
        const qy = py - ey;

        const r = Math.hypot(ry, rx);
        const q = Math.hypot(qy, qx);

        tx = Math.min(1, Math.max(0, ((qx * r) / q + ex) / a));
        ty = Math.min(1, Math.max(0, ((qy * r) / q + ey) / b));
        const t = Math.hypot(ty, tx);
        tx /= t;
        ty /= t;
    });
    const signX = point[0] > center[0] ? 1 : -1;
    const signY = point[1] > center[1] ? 1 : -1;

    return [center[0] + a * tx * signX, center[1] + b * ty * signY];
}

export function rotate(x1: number, y1: number, x2: number, y2: number, angle: number) {
    // 𝑎′𝑥=(𝑎𝑥−𝑐𝑥)cos𝜃
    // 
    // −(𝑎𝑦−𝑐𝑦)sin𝜃+𝑐𝑥
    // 𝑎′𝑦=(𝑎𝑥−𝑐𝑥)sin𝜃+(𝑎𝑦−𝑐𝑦)cos𝜃+𝑐𝑦.
    // https://math.stackexchange.com/questions/2204520/how-do-i-rotate-a-line-segment-in-a-specific-point-on-the-line
    return [(x1 - x2) * Math.cos(angle) - (y1 - y2) * Math.sin(angle) + x2, (x1 - x2) * Math.sin(angle) + (y1 - y2) * Math.cos(angle) + y2];
}

export function distanceBetweenPointAndPoint(x1: number, y1: number, x2: number, y2: number) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.hypot(dx, dy);
}

// https://stackoverflow.com/questions/5254838/calculating-distance-between-a-point-and-a-rectangular-box-nearest-point
export function distanceBetweenPointAndRectangle(x: number, y: number, rect: RectangleClient) {
    var dx = Math.max(rect.x - x, 0, x - (rect.x + rect.width));
    var dy = Math.max(rect.y - y, 0, y - (rect.y + rect.height));
    return Math.sqrt(dx * dx + dy * dy);
}

export const isLineHitLine = (a: ElbowPoint, b: ElbowPoint, c: ElbowPoint, d: ElbowPoint): boolean => {
    const crossProduct = (v1: ElbowPoint, v2: ElbowPoint) => v1[0] * v2[1] - v1[1] * v2[0];

    const ab: ElbowPoint = [b[0] - a[0], b[1] - a[1]];
    const ac: ElbowPoint = [c[0] - a[0], c[1] - a[1]];
    const ad: ElbowPoint = [d[0] - a[0], d[1] - a[1]];

    const ca: ElbowPoint = [a[0] - c[0], a[1] - c[1]];
    const cb: ElbowPoint = [b[0] - c[0], b[1] - c[1]];
    const cd: ElbowPoint = [d[0] - c[0], d[1] - c[1]];

    return crossProduct(ab, ac) * crossProduct(ab, ad) <= 0 && crossProduct(cd, ca) * crossProduct(cd, cb) <= 0;
};

export const isLineHitRectangle = (points: ElbowPoint[], rectangle: RectangleClient, isClose: boolean = true) => {
    const rectanglePoints = RectangleClient.getCornerPoints(rectangle);
    const len = points.length;
    for (let i = 0; i < len; i++) {
        if (i === len - 1 && !isClose) continue;
        const p1 = points[i];
        const p2 = points[(i + 1) % len];
        const isHit = isSingleLineHitRectangleEdge(p1, p2, rectangle);
        if (isHit || isPointInPolygon(p1, rectanglePoints) || isPointInPolygon(p2, rectanglePoints)) {
            return true;
        }
    }
    return false;
};

export const isLineHitRectangleEdge = (points: ElbowPoint[], rectangle: RectangleClient, isClose: boolean = true) => {
    const len = points.length;
    for (let i = 0; i < len; i++) {
        if (i === len - 1 && !isClose) continue;
        const p1 = points[i];
        const p2 = points[(i + 1) % len];
        const isHit = isSingleLineHitRectangleEdge(p1, p2, rectangle);
        if (isHit) {
            return true;
        }
    }
    return false;
};

export const isSingleLineHitRectangleEdge = (p1: ElbowPoint, p2: ElbowPoint, rectangle: RectangleClient) => {
    const rectanglePoints = RectangleClient.getCornerPoints(rectangle);
    return (
        isLineHitLine(p1, p2, rectanglePoints[0], rectanglePoints[1]) ||
        isLineHitLine(p1, p2, rectanglePoints[1], rectanglePoints[2]) ||
        isLineHitLine(p1, p2, rectanglePoints[2], rectanglePoints[3]) ||
        isLineHitLine(p1, p2, rectanglePoints[3], rectanglePoints[0])
    );
};

//https://stackoverflow.com/questions/22521982/check-if-point-is-inside-a-polygon
export const isPointInPolygon = (point: ElbowPoint, points: ElbowPoint[]) => {
    // ray-casting algorithm based on
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html

    const x = point[0],
        y = point[1];

    let inside = false;
    for (var i = 0, j = points.length - 1; i < points.length; j = i++) {
        let xi = points[i][0],
            yi = points[i][1];
        let xj = points[j][0],
            yj = points[j][1];

        let intersect = yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (intersect) inside = !inside;
    }
    return inside;
};

export const isPointInEllipse = (point: ElbowPoint, center: ElbowPoint, rx: number, ry: number, angle = 0) => {
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);
    const x1 = (point[0] - center[0]) * cosAngle + (point[1] - center[1]) * sinAngle;
    const y1 = (point[1] - center[1]) * cosAngle - (point[0] - center[0]) * sinAngle;

    return (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry) <= 1;
};

export const isPointInRoundRectangle = (point: ElbowPoint, rectangle: RectangleClient, radius: number, angle = 0) => {
    const { x: rectX, y: rectY, width, height } = rectangle;
    const isInRectangle = point[0] >= rectX && point[0] <= rectX + width && point[1] >= rectY && point[1] <= rectY + height;
    const handleLeftTop =
        point[0] >= rectX &&
        point[0] <= rectX + radius &&
        point[1] >= rectY &&
        point[1] <= rectY + radius &&
        Math.hypot(point[0] - (rectX + radius), point[1] - (rectY + radius)) > radius;
    const handleLeftBottom =
        point[0] >= rectX &&
        point[0] <= rectX + radius &&
        point[1] >= rectY + height &&
        point[1] <= rectY + height - radius &&
        Math.hypot(point[0] - (rectX + radius), point[1] - (rectY + height - radius)) > radius;
    const handleRightTop =
        point[0] >= rectX + width - radius &&
        point[0] <= rectX + width &&
        point[1] >= rectY &&
        point[1] <= rectY + radius &&
        Math.hypot(point[0] - (rectX + width - radius), point[1] - (rectY + radius)) > radius;
    const handleRightBottom =
        point[0] >= rectX + width - radius &&
        point[0] <= rectX + width &&
        point[1] >= rectY + height - radius &&
        point[1] <= rectY + height &&
        Math.hypot(point[0] - (rectX + width - radius), point[1] - (rectY + height - radius)) > radius;
    const isInCorner = handleLeftTop || handleLeftBottom || handleRightTop || handleRightBottom;

    return isInRectangle && !isInCorner;
};

// https://gist.github.com/nicholaswmin/c2661eb11cad5671d816
export const catmullRomFitting = function (points: ElbowPoint[]) {
    const alpha = 0.5;
    let p0, p1, p2, p3, bp1, bp2, d1, d2, d3, A, B, N, M;
    var d3powA, d2powA, d3pow2A, d2pow2A, d1pow2A, d1powA;
    const result: ElbowPoint[] = [];
    result.push([Math.round(points[0][0]), Math.round(points[0][1])]);
    var length = points.length;
    for (var i = 0; i < length - 1; i++) {
        p0 = i == 0 ? points[0] : points[i - 1];
        p1 = points[i];
        p2 = points[i + 1];
        p3 = i + 2 < length ? points[i + 2] : p2;

        d1 = Math.sqrt(Math.pow(p0[0] - p1[0], 2) + Math.pow(p0[1] - p1[1], 2));
        d2 = Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
        d3 = Math.sqrt(Math.pow(p2[0] - p3[0], 2) + Math.pow(p2[1] - p3[1], 2));

        // Catmull-Rom to Cubic Bezier conversion matrix
        // A = 2d1^2a + 3d1^a * d2^a + d3^2a
        // B = 2d3^2a + 3d3^a * d2^a + d2^2a
        // [   0             1            0          0          ]
        // [   -d2^2a /N     A/N          d1^2a /N   0          ]
        // [   0             d3^2a /M     B/M        -d2^2a /M  ]
        // [   0             0            1          0          ]

        d3powA = Math.pow(d3, alpha);
        d3pow2A = Math.pow(d3, 2 * alpha);
        d2powA = Math.pow(d2, alpha);
        d2pow2A = Math.pow(d2, 2 * alpha);
        d1powA = Math.pow(d1, alpha);
        d1pow2A = Math.pow(d1, 2 * alpha);

        A = 2 * d1pow2A + 3 * d1powA * d2powA + d2pow2A;
        B = 2 * d3pow2A + 3 * d3powA * d2powA + d2pow2A;
        N = 3 * d1powA * (d1powA + d2powA);
        if (N > 0) {
            N = 1 / N;
        }
        M = 3 * d3powA * (d3powA + d2powA);
        if (M > 0) {
            M = 1 / M;
        }

        bp1 = [(-d2pow2A * p0[0] + A * p1[0] + d1pow2A * p2[0]) * N, (-d2pow2A * p0[1] + A * p1[1] + d1pow2A * p2[1]) * N];
        bp2 = [(d3pow2A * p1[0] + B * p2[0] - d2pow2A * p3[0]) * M, (d3pow2A * p1[1] + B * p2[1] - d2pow2A * p3[1]) * M];

        if (bp1[0] == 0 && bp1[1] == 0) {
            bp1 = p1;
        }
        if (bp2[0] == 0 && bp2[1] == 0) {
            bp2 = p2;
        }

        result.push(bp1 as ElbowPoint, bp2 as ElbowPoint, p2 as ElbowPoint);
    }

    return result;
};

/**
 * the result of slope is based on Cartesian coordinate system
 * x, y are based on the position in the Cartesian coordinate system
 */
export function getEllipseTangentSlope(x: number, y: number, a: number, b: number) {
    if (Math.abs(y) === 0) {
        return x > 0 ? -Infinity : Infinity;
    }
    const k = (-b * b * x) / (a * a * y);
    return k;
}

/**
 * x, y are based on the position in the Cartesian coordinate system
 */
export function getVectorFromPointAndSlope(x: number, y: number, slope: number) {
    if (slope === Infinity) {
        return [0, -1] as ElbowPoint;
    } else if (slope === -Infinity) {
        return [0, 1] as ElbowPoint;
    }
    let vector = [1, -slope] as ElbowPoint;
    if (y < 0) {
        vector = [-vector[0], -vector[1]];
    }
    return vector as ElbowPoint;
}

/**
 * The DOM likes values to be fixed to 3 decimal places
 */
export function toDomPrecision(v: number) {
    return +v.toFixed(4);
}

export function toFixed(v: number) {
    return +v.toFixed(2);
}

export function ceilToDecimal(value: number, decimalPlaces: number) {
    const factor = Math.pow(10, decimalPlaces);
    return Math.ceil(value * factor) / factor;
}

/**
 * Whether two numbers numbers a and b are approximately equal.
 *
 * @param a - The first point.
 * @param b - The second point.
 * @public
 */
export function approximately(a: number, b: number, precision = 0.000001) {
    return Math.abs(a - b) <= precision;
}

// https://medium.com/@steveruiz/find-the-points-where-a-line-segment-intercepts-an-angled-ellipse-in-javascript-typescript-e451524beece
export function getCrossingPointsBetweenEllipseAndSegment(
    startPoint: ElbowPoint,
    endPoint: ElbowPoint,
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    segment_only = true
) {
    // If the ellipse or line segment are empty, return no tValues.
    if (rx === 0 || ry === 0 || (startPoint[0] === endPoint[0] && startPoint[1] === endPoint[1])) {
        return [];
    }

    rx = rx < 0 ? rx : -rx;
    ry = ry < 0 ? ry : -ry;

    startPoint[0] -= cx;
    startPoint[1] -= cy;
    endPoint[0] -= cx;
    endPoint[1] -= cy;

    // Calculate the quadratic parameters.
    var A =
        ((endPoint[0] - startPoint[0]) * (endPoint[0] - startPoint[0])) / rx / rx +
        ((endPoint[1] - startPoint[1]) * (endPoint[1] - startPoint[1])) / ry / ry;
    var B = (2 * startPoint[0] * (endPoint[0] - startPoint[0])) / rx / rx + (2 * startPoint[1] * (endPoint[1] - startPoint[1])) / ry / ry;
    var C = (startPoint[0] * startPoint[0]) / rx / rx + (startPoint[1] * startPoint[1]) / ry / ry - 1;

    // Make a list of t values (normalized points on the line where intersections occur).
    var tValues: number[] = [];

    // Calculate the discriminant.
    var discriminant = B * B - 4 * A * C;

    if (discriminant === 0) {
        // One real solution.
        tValues.push(-B / 2 / A);
    } else if (discriminant > 0) {
        // Two real solutions.
        tValues.push((-B + Math.sqrt(discriminant)) / 2 / A);
        tValues.push((-B - Math.sqrt(discriminant)) / 2 / A);
    }
    return (
        tValues
            // Filter to only points that are on the segment.
            .filter((t) => !segment_only || (t >= 0 && t <= 1))
            // Solve for points.
            .map((t) => [startPoint[0] + (endPoint[0] - startPoint[0]) * t + cx, startPoint[1] + (endPoint[1] - startPoint[1]) * t + cy])
    );
}

/**
 * Get a point between two points.
 * @param x0 The x-axis coordinate of the first point.
 * @param y0 The y-axis coordinate of the first point.
 * @param x1 The x-axis coordinate of the second point.
 * @param y1 The y-axis coordinate of the second point.
 * @param d Normalized
 */
export function getPointBetween(x0: number, y0: number, x1: number, y1: number, d = 0.5) {
    return [x0 + (x1 - x0) * d, y0 + (y1 - y0) * d];
}

/**
 * 根据给定坐标点自动确定矩形的最佳连接点
 * @param pointX 目标点的X坐标
 * @param pointY 目标点的Y坐标
 * @param rectX 矩形的X坐标
 * @param rectY 矩形的Y坐标
 * @param rectWidth 矩形的宽度
 * @param rectHeight 矩形的高度
 * @param threshold 距离阈值，默认为20像素
 * @returns 连接点坐标 [x, y]，范围为 [0,1]
 */
export function getOptimalConnectionPoint(
    pointX: number,
    pointY: number,
    rectX: number,
    rectY: number,
    rectWidth: number,
    rectHeight: number,
    threshold: number = 20
): [number, number] {
    // 定义矩形边界上的关键连接点
    const connectionPoints = [
        // 上边：左上角、上边中点、右上角
        { connection: [0, 0], x: rectX, y: rectY },
        { connection: [0.5, 0], x: rectX + rectWidth / 2, y: rectY },
        { connection: [1, 0], x: rectX + rectWidth, y: rectY },
        
        // 右边：右上角、右边中点、右下角
        { connection: [1, 0], x: rectX + rectWidth, y: rectY },
        { connection: [1, 0.5], x: rectX + rectWidth, y: rectY + rectHeight / 2 },
        { connection: [1, 1], x: rectX + rectWidth, y: rectY + rectHeight },
        
        // 下边：右下角、下边中点、左下角
        { connection: [1, 1], x: rectX + rectWidth, y: rectY + rectHeight },
        { connection: [0.5, 1], x: rectX + rectWidth / 2, y: rectY + rectHeight },
        { connection: [0, 1], x: rectX, y: rectY + rectHeight },
        
        // 左边：左下角、左边中点、左上角
        { connection: [0, 1], x: rectX, y: rectY + rectHeight },
        { connection: [0, 0.5], x: rectX, y: rectY + rectHeight / 2 },
        { connection: [0, 0], x: rectX, y: rectY }
    ];
    
    // 去重，避免角点重复
    const uniquePoints = connectionPoints.filter((point, index, arr) => {
        return index === arr.findIndex(p => 
            p.connection[0] === point.connection[0] && 
            p.connection[1] === point.connection[1]
        );
    });
    
    // 找到距离目标点最近的连接点
    let minDistance = Infinity;
    let bestConnection: [number, number] = [0.5, 0.5]; // 默认中心点
    
    for (const point of uniquePoints) {
        const distance = distanceBetweenPointAndPoint(pointX, pointY, point.x, point.y);
        if (distance < minDistance) {
            minDistance = distance;
            bestConnection = point.connection as [number, number];
        }
    }
    
    // 如果最近距离超过阈值，则使用智能边缘检测
    if (minDistance > threshold) {
        bestConnection = getSmartEdgeConnection(pointX, pointY, rectX, rectY, rectWidth, rectHeight);
    }
    
    return bestConnection;
}

/**
 * 智能边缘连接点检测
 * 根据目标点相对于矩形的位置，选择最合适的边缘连接点
 */
function getSmartEdgeConnection(
    pointX: number,
    pointY: number,
    rectX: number,
    rectY: number,
    rectWidth: number,
    rectHeight: number
): [number, number] {
    const centerX = rectX + rectWidth / 2;
    const centerY = rectY + rectHeight / 2;
    
    // 计算目标点相对于矩形中心的方向
    const deltaX = pointX - centerX;
    const deltaY = pointY - centerY;
    
    // 计算角度（以弧度为单位）
    const angle = Math.atan2(deltaY, deltaX);
    
    // 将角度转换为度数并标准化到 [0, 360)
    let degrees = (angle * 180 / Math.PI + 360) % 360;
    
    // 根据角度范围确定最佳连接边
    if (degrees >= 315 || degrees < 45) {
        // 右边
        return [1, 0.5];
    } else if (degrees >= 45 && degrees < 135) {
        // 下边
        return [0.5, 1];
    } else if (degrees >= 135 && degrees < 225) {
        // 左边
        return [0, 0.5];
    } else {
        // 上边
        return [0.5, 0];
    }
}

/**
 * 获取矩形指定连接点的实际坐标
 * @param rectX 矩形X坐标
 * @param rectY 矩形Y坐标
 * @param rectWidth 矩形宽度
 * @param rectHeight 矩形高度
 * @param connection 连接点 [x, y]，范围 [0,1]
 * @returns 实际坐标点 [x, y]
 */
export function getConnectionPointCoordinates(
    rectX: number,
    rectY: number,
    rectWidth: number,
    rectHeight: number,
    connection: [number, number]
): [number, number] {
    return [
        rectX + rectWidth * connection[0],
        rectY + rectHeight * connection[1]
    ];
}
