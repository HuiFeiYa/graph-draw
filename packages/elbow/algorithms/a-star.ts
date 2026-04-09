import { ElbowPoint } from '../util/common-type'
import { PointGraph, PointNode } from './data-structures/graph';
import { PriorityQueue } from './data-structures/priority-queue';

export class AStar {
    cameFrom: Map<PointNode, PointNode>;

    constructor(private graph: PointGraph) {
        this.cameFrom = new Map<PointNode, PointNode>();
    }

    heuristic(a: ElbowPoint, b: ElbowPoint) {
        return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
    }

    search(start: ElbowPoint, end: ElbowPoint, previousStart: ElbowPoint) {
        const frontier = new PriorityQueue();
        const startNode = this.graph.get(start);
        const endNode = this.graph.get(end);
        
        // 验证起点和终点是否在图中存在
        if (!startNode) {
            throw new Error(`Start point [${start[0]}, ${start[1]}] not found in graph`);
        }
        if (!endNode) {
            throw new Error(`End point [${end[0]}, ${end[1]}] not found in graph`);
        }
        
        this.cameFrom = new Map<PointNode, PointNode>();
        const costSoFar = new Map<PointNode, number>();
        costSoFar.set(startNode, 0);
        frontier.enqueue({ node: startNode, priority: 0 });
        while (frontier.list.length > 0) {
            const current = frontier.dequeue();

            if (!current) {
                throw new Error(`can't find current`);
            }
            const currentPoint = current.node.data;
            if (currentPoint[0] === end[0] && currentPoint[1] === end[1]) {
                break;
            }
            current.node.adjacentNodes.forEach(next => {
                let newCost = costSoFar.get(current.node)! + this.heuristic(next.data, current.node.data);
                const previousNode = this.cameFrom.get(current.node);
                // Inflection point weight, if an inflection point occurs, cost + 1 to avoid the inflection point path
                // Three points on a line to determine whether there is an inflection point
                const previousPoint = previousNode ? previousNode.data : previousStart;
                const x = previousPoint[0] === current.node.data[0] && previousPoint[0] === next.data[0];
                const y = previousPoint[1] === current.node.data[1] && previousPoint[1] === next.data[1];
                if (!x && !y) {
                    newCost = newCost + 1;
                }
                if (!costSoFar.has(next) || (costSoFar.get(next) && newCost < costSoFar.get(next)!)) {
                    costSoFar.set(next, newCost);
                    const priority = newCost + this.heuristic(next.data, end);
                    frontier.enqueue({ node: next, priority });
                    this.cameFrom.set(next, current.node);
                }
            });
        }
    }

    getRoute(start: ElbowPoint, end: ElbowPoint) {
        const result = [];
        let temp = end;
        while (temp[0] !== start[0] || temp[1] !== start[1]) {
            const node = this.graph.get(temp);
            if (!node) {
                throw new Error(`Node not found for point [${temp[0]}, ${temp[1]}]`);
            }
            const preNode = this.cameFrom.get(node);
            if (!preNode) {
                throw new Error(`Previous node not found for point [${temp[0]}, ${temp[1]}]`);
            }
            result.unshift(preNode.data);
            temp = preNode.data;
        }
        return result;
    }
}
