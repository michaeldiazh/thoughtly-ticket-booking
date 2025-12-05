/**
 * Tests for query parameter normalization utility
 */

import { stringifyQueryParams } from '../../../src/api/utils/query-param.util';

type TestCase = {
  description: string;
  input: Record<string, unknown>;
  output: Record<string, string | undefined>;
};

const testCases: TestCase[] = [
  {
    description: 'should stringify string values',
    input: {
      name: 'John',
      age: '25',
      active: 'true',
    },
    output: {
      name: 'John',
      age: '25',
      active: 'true',
    },
  },
  {
    description: 'should join array values with commas',
    input: {
      ids: ['1', '2', '3'],
      tags: ['tag1', 'tag2'],
    },
    output: {
      ids: '1,2,3',
      tags: 'tag1,tag2',
    },
  },
  {
    description: 'should handle undefined values',
    input: {
      name: 'John',
      age: undefined,
      city: null,
    },
    output: {
      name: 'John',
      age: undefined,
      city: undefined,
    },
  },
  {
    description: 'should handle mixed types',
    input: {
      name: 'John',
      ids: ['1', '2'],
      active: true,
      count: 42,
      empty: null,
    },
    output: {
      name: 'John',
      ids: '1,2',
      active: 'true',
      count: '42',
      empty: undefined,
    },
  },
  {
    description: 'should handle empty object',
    input: {},
    output: {},
  },
  {
    description: 'should convert numbers to strings',
    input: {
      id: 123,
      price: 99.99,
    },
    output: {
      id: '123',
      price: '99.99',
    },
  },
  {
    description: 'should convert booleans to strings',
    input: {
      active: true,
      deleted: false,
    },
    output: {
      active: 'true',
      deleted: 'false',
    },
  },
  {
    description: 'should handle empty arrays',
    input: {
      tags: [],
      ids: [],
    },
    output: {
      tags: '',
      ids: '',
    },
  },
  {
    description: 'should handle complex Express query object',
    input: {
      ticketIds: '1,2,3',
      tierCodes: ['GA', 'VIP'],
      eventName: 'Concert',
      limit: '10',
      offset: '0',
      active: undefined,
    },
    output: {
      ticketIds: '1,2,3',
      tierCodes: 'GA,VIP',
      eventName: 'Concert',
      limit: '10',
      offset: '0',
      active: undefined,
    },
  },
];

describe('stringifyQueryParams', () => {
  testCases.forEach(({ description, input, output }) => {
    it(description, () => {
      const result = stringifyQueryParams(input);
      expect(result).toEqual(output);
    });
  });
});
