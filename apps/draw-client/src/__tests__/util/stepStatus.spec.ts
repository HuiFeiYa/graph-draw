import { describe, it, expect, vi } from 'vitest';
import { StepStatus, stepStatusReactive } from '@/util/StepStatus';
import { shapeService } from '@/util/ShapeService';

describe('util/StepStatus', () => {
  it('fresh sets status from service and clears when no data', async () => {
    const spy = vi.spyOn(shapeService, 'getStepStatus');
    const s = new StepStatus();

    spy.mockResolvedValueOnce({ currentStepId: 's1', hasPreStep: true, hasNextStep: false });
    await s.fresh('pid');
    expect(s.isFresh).toBe(false);
    expect(s.currentStepId).toBe('s1');
    expect(s.hasPreStep).toBe(true);
    expect(s.hasNextStep).toBe(false);

    spy.mockResolvedValueOnce(undefined as any);
    await s.fresh('pid');
    expect(s.currentStepId).toBeUndefined();
    expect(s.hasPreStep).toBe(false);
    expect(s.hasNextStep).toBe(false);
  });

  it('clear resets flags and update merges partial state', () => {
    const s = new StepStatus();
    s.update({ currentStepId: 'x', hasNextStep: true, hasPreStep: true });
    expect(s.currentStepId).toBe('x');
    expect(s.hasNextStep).toBe(true);
    expect(s.hasPreStep).toBe(true);

    s.clear();
    expect(s.currentStepId).toBeUndefined();
    expect(s.hasNextStep).toBe(false);
    expect(s.hasPreStep).toBe(false);
    expect(s.isFresh).toBe(false);
  });

  it('reactive instance behaves like class', async () => {
    const spy = vi.spyOn(shapeService, 'getStepStatus').mockResolvedValueOnce({ currentStepId: 'r1', hasPreStep: false, hasNextStep: true });
    await stepStatusReactive.fresh('pid');
    expect(stepStatusReactive.currentStepId).toBe('r1');
    expect(stepStatusReactive.hasPreStep).toBe(false);
    expect(stepStatusReactive.hasNextStep).toBe(true);
  });
});