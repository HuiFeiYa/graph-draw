import { Point, Vector } from "./common-type";
import { RectangleClient } from "./rectangle-client";
import { getPointByVectorComponent } from "./vector";

export const createFakePoints = (startPoint: Point, vector: Vector) => {
    const point = getPointByVectorComponent(startPoint, vector, -25);
    const points = RectangleClient.getPoints(RectangleClient.getRectangleByCenterPoint(point, 50, 50));
    return points;
};