import { filterBySweetness } from './message-filter';
import { Message } from '../models/types';

describe('filterBySweetness', () => {
  const mockMessages: Partial<Message>[] = [
    { id: '1', sweetnessScore: null, content: 'null score' },
    { id: '2', sweetnessScore: undefined, content: 'undefined score' },
    { id: '3', sweetnessScore: 0, content: 'score 0' },
    { id: '4', sweetnessScore: 1, content: 'score 1' },
    { id: '5', sweetnessScore: 3, content: 'score 3' },
    { id: '6', sweetnessScore: 5, content: 'score 5' },
  ];

  it('should return all messages when level is 0', () => {
    const result = filterBySweetness(mockMessages as Message[], 0);
    expect(result).toHaveLength(6);
  });

  it('should filter messages with sweetnessScore >= level when level > 0', () => {
    const result = filterBySweetness(mockMessages as Message[], 3);
    expect(result).toHaveLength(2);
    expect(result.map(m => m.id)).toEqual(['5', '6']);
  });

  it('should hide messages with null or undefined sweetnessScore when level > 0', () => {
    const result = filterBySweetness(mockMessages as Message[], 1);
    expect(result).toHaveLength(3);
    expect(result.find(m => m.sweetnessScore === null)).toBeUndefined();
    expect(result.find(m => m.sweetnessScore === undefined)).toBeUndefined();
  });

  it('should return an empty array if no messages match the level', () => {
    const result = filterBySweetness(mockMessages as Message[], 6);
    expect(result).toHaveLength(0);
  });
});
