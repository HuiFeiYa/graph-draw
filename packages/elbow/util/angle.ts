import { PlaitElement, ElbowPoint } from "./common-type";
import { rotate } from "./math";
import { RectangleClient } from "./rectangle-client";

export const hasValidAngle = (node: PlaitElement) => {
    return isValidAngle(node.angle);
};

export const isValidAngle = (angle: undefined | number) => {
    return angle && angle !== 0;
};

export const rotatePointsByElement = <T>(points: T, element: PlaitElement): T | null => {
    if (hasValidAngle(element)) {
        let rectangle = RectangleClient.getRectangleByPoints(element.points!);
        const centerPoint = RectangleClient.getCenterPoint(rectangle);
        return rotatePoints(points, centerPoint, element.angle);
    } else {
        return null;
    }
};


export const rotatePoints = <T>(points: T, centerPoint: ElbowPoint, angle?: number): T => {
    if (!angle) {
        angle = 0;
    }
    if (Array.isArray(points) && typeof points[0] === 'number') {
        return rotate(points[0], points[1], centerPoint[0], centerPoint[1], angle) as T;
    } else {
        return (points as ElbowPoint[]).map(point => {
            return rotate(point[0], point[1], centerPoint[0], centerPoint[1], angle || 0);
        }) as T;
    }
};