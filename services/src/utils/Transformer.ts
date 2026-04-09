import { Bounds } from "src/types/Bounds";
import { loggerUtils } from './LoggerUtils';

export class BoundsTransformer {
    from(nums:number[]):Bounds {
      loggerUtils.logToFile({ message: `from: ${JSON.stringify(nums)}` });
      if (!nums) return null;
  
      if (Array.isArray(nums)) {
        return new Bounds(nums[0], nums[1], nums[2], nums[3], nums[4], nums[5]);
  
      } else {
        return nums as any as Bounds;
      }
  
    }
    to(bounds:Bounds):number[] {
      loggerUtils.logToFile({ message: `to: ${JSON.stringify(bounds)}` });
      if (!bounds) return null;
      if (Array.isArray(bounds)) {
        return bounds as any as number[];
      } else {
        return [bounds.x, bounds.y, bounds.width, bounds.height, bounds.absX, bounds.absY];
      }
    }
  }

