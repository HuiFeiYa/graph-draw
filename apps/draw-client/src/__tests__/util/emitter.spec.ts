import { describe, it, expect, vi } from 'vitest';
import { Emitter } from '@/util/Emitter';

describe('util/Emitter', () => {
  it('on and emit call listeners', () => {
    const emitter = new Emitter();
    const fn = vi.fn();
    emitter.on('evt', fn);
    emitter.emit('evt', 1, 2);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(1, 2);
  });

  it('once only triggers a single time', () => {
    const emitter = new Emitter();
    const fn = vi.fn();
    emitter.once('evt', fn);
    emitter.emit('evt');
    emitter.emit('evt');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('off removes specific listener', () => {
    const emitter = new Emitter();
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    emitter.on('evt', fn1);
    emitter.on('evt', fn2);
    emitter.off('evt', fn1);
    emitter.emit('evt');
    expect(fn1).toHaveBeenCalledTimes(0);
    expect(fn2).toHaveBeenCalledTimes(1);
  });
});