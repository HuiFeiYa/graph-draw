import { ElbowPoint } from "./common-type";

export interface XYPosition {
    x: number;
    y: number;
}

export const PointUtil = {
    isEquals(point?: ElbowPoint, otherPoint?: ElbowPoint) {
        return point && otherPoint && point[0] === otherPoint[0] && point[1] === otherPoint[1];
    },
    isHorizontal(point?: ElbowPoint, otherPoint?: ElbowPoint, tolerance = 0) {
        return point && otherPoint && PointUtil.isOverHorizontal([point, otherPoint], tolerance);
    },
    isOverHorizontal(points: ElbowPoint[], tolerance: number = 0) {
        return points.every(point => Math.abs(point[1] - points[0][1]) <= tolerance);
    },
    isVertical(point?: ElbowPoint, otherPoint?: ElbowPoint, tolerance = 0) {
        return point && otherPoint && PointUtil.isOverVertical([point, otherPoint], tolerance);
    },
    isOverVertical(points: ElbowPoint[], tolerance: number = 0) {
        return points.every(point => Math.abs(point[0] - points[0][0]) <= tolerance);
    },
    isAlign(points: ElbowPoint[], tolerance: number = 0) {
        return PointUtil.isOverHorizontal(points, tolerance) || PointUtil.isOverVertical(points, tolerance);
    },
    getOffsetX(point1: ElbowPoint, point2: ElbowPoint) {
        return point2[0] - point1[0];
    },
    getOffsetY(point1: ElbowPoint, point2: ElbowPoint) {
        return point2[1] - point1[1];
    }
};
