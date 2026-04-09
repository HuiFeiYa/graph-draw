import { ElbowPoint } from "./common-type";
import { PointUtil } from "./point";

export const removeDuplicatePoints = (points: ElbowPoint[]) => {
    const newArray: ElbowPoint[] = [];
    points.forEach(point => {
        const index = newArray.findIndex(otherPoint => {
            return PointUtil.isEquals(point, otherPoint);
        });
        if (index === -1) newArray.push(point);
    });
    return newArray;
};

export function simplifyOrthogonalPoints(points: ElbowPoint[]) {
    if (points.length <= 2) return points;
    let simplifiedPoints: ElbowPoint[] = [points[0]];
    for (let i = 1; i < points.length - 1; i++) {
        const previous = points[i - 1];
        const current = points[i];
        const next = points[i + 1];
        const isTurn = !(PointUtil.isOverHorizontal([previous, current, next]) || PointUtil.isOverVertical([previous, current, next]));
        if (isTurn) {
            simplifiedPoints.push(current);
        }
    }
    simplifiedPoints.push(points[points.length - 1]);
    return simplifiedPoints;
}