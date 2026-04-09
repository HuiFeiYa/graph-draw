import { ElbowPoint, Vector } from "./common-type";
import { RectangleClient } from "./rectangle-client";
import { getPointByVectorComponent } from "./vector";

export const createFakePoints = (startPoint: ElbowPoint, vector: Vector) => {
    const point = getPointByVectorComponent(startPoint, vector, -25);
    const points = RectangleClient.getPoints(RectangleClient.getRectangleByCenterPoint(point, 50, 50));
    return points;
};