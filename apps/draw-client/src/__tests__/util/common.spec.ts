import { describe, it, expect } from 'vitest';
import { generateRandomNumber, formatDate, ResData } from '@/util/common';
import { ApiCode } from '@hfdraw/types';

describe('util/common', () => {
  it('generateRandomNumber returns fixed-length string', () => {
    const r5 = generateRandomNumber(5);
    expect(r5).toMatch(/^\d{5}$/);
    const r2 = generateRandomNumber(2);
    expect(r2).toMatch(/^\d{2}$/);
    const r10 = generateRandomNumber(10);
    expect(r10).toMatch(/^\d{10}$/);
  });

  it('formatDate formats proper date parts', () => {
    const ts = new Date('2024-08-09T14:03:07Z').getTime();
    const str = formatDate(ts, 'yyyy-MM-dd HH:mm');
    expect(str).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  });

  it('ResData sets defaults and fields', () => {
    const res = new ResData<string>(ApiCode.SUCCESS, 'ok');
    expect(res.code).toBe(ApiCode.SUCCESS);
    expect(res.data).toBe('ok');
    expect(res.message).toBeTypeOf('string');
  });
});