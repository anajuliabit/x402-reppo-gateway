import { ragQuerySchema } from '../../../src/routes/rag/types.js';
import { ZodError } from 'zod';

describe('ragQuerySchema', () => {
  describe('valid inputs', () => {
    it('should parse valid query with all parameters', () => {
      const input = {
        q: 'What is AI?',
        service: 'custom',
        maxResults: '10',
      };

      const result = ragQuerySchema.parse(input);

      expect(result.q).toBe('What is AI?');
      expect(result.service).toBe('custom');
      expect(result.maxResults).toBe(10);
    });

    it('should use default service when not provided', () => {
      const input = { q: 'Test query' };

      const result = ragQuerySchema.parse(input);

      expect(result.service).toBe('general');
    });

    it('should use default maxResults when not provided', () => {
      const input = { q: 'Test query' };

      const result = ragQuerySchema.parse(input);

      expect(result.maxResults).toBe(5);
    });

    it('should coerce string maxResults to number', () => {
      const input = { q: 'Test', maxResults: '7' };

      const result = ragQuerySchema.parse(input);

      expect(result.maxResults).toBe(7);
      expect(typeof result.maxResults).toBe('number');
    });

    it('should accept minimum valid query length', () => {
      const input = { q: 'a' };

      const result = ragQuerySchema.parse(input);

      expect(result.q).toBe('a');
    });

    it('should accept maximum valid query length', () => {
      const longQuery = 'a'.repeat(1000);
      const input = { q: longQuery };

      const result = ragQuerySchema.parse(input);

      expect(result.q).toBe(longQuery);
    });

    it('should accept minimum maxResults value', () => {
      const input = { q: 'Test', maxResults: '1' };

      const result = ragQuerySchema.parse(input);

      expect(result.maxResults).toBe(1);
    });

    it('should accept maximum maxResults value', () => {
      const input = { q: 'Test', maxResults: '20' };

      const result = ragQuerySchema.parse(input);

      expect(result.maxResults).toBe(20);
    });
  });

  describe('invalid inputs', () => {
    it('should reject empty query', () => {
      const input = { q: '' };

      expect(() => ragQuerySchema.parse(input)).toThrow(ZodError);
    });

    it('should reject missing query', () => {
      const input = { service: 'test' };

      expect(() => ragQuerySchema.parse(input)).toThrow(ZodError);
    });

    it('should reject query that is too long', () => {
      const input = { q: 'a'.repeat(1001) };

      expect(() => ragQuerySchema.parse(input)).toThrow(ZodError);
    });

    it('should reject maxResults below minimum', () => {
      const input = { q: 'Test', maxResults: '0' };

      expect(() => ragQuerySchema.parse(input)).toThrow(ZodError);
    });

    it('should reject maxResults above maximum', () => {
      const input = { q: 'Test', maxResults: '21' };

      expect(() => ragQuerySchema.parse(input)).toThrow(ZodError);
    });

    it('should reject negative maxResults', () => {
      const input = { q: 'Test', maxResults: '-1' };

      expect(() => ragQuerySchema.parse(input)).toThrow(ZodError);
    });
  });

  describe('error messages', () => {
    it('should provide meaningful error for empty query', () => {
      const input = { q: '' };

      try {
        ragQuerySchema.parse(input);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        expect(zodError.errors[0].message).toContain('Query is required');
      }
    });

    it('should provide meaningful error for long query', () => {
      const input = { q: 'a'.repeat(1001) };

      try {
        ragQuerySchema.parse(input);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        expect(zodError.errors[0].message).toContain('Query too long');
      }
    });
  });
});
