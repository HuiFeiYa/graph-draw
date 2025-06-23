import { getArrowLineHandleRefPair, getElbowLineRouteOptions } from "./arrow-line-common";
import { PlaitElement, ElbowPoint } from "./common-type";
import { generateElbowLineRoute } from "./elbow-line-route";
import { removeDuplicatePoints } from "./line-path";
export * from './PathBuilder'

export function getKeyPoints(rect1: ElbowPoint[], rect2: ElbowPoint[], element:PlaitElement) {
    const handleRefPair = getArrowLineHandleRefPair(rect1, rect2, element);
    const params = getElbowLineRouteOptions(rect1, rect2, element, handleRefPair);
    const route = generateElbowLineRoute(params);
    const keyPoints = removeDuplicatePoints(route);
    return keyPoints;
}
