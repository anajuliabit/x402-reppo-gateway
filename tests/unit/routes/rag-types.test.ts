import { ragQuerySchema } from '../../../src/routes/rag/types.js';
import { ZodError } from 'zod';

describe('ragQuerySchema', () => {
  describe('valid inputs', () => {
    it('should parse valid query with all parameters', () => {
      const input = {
        q: 'What is AI?',
        service: 'scientific',
        maxResults: '10',
      };

      const result = ragQuerySchema.parse(input);

      expect(result.q).toBe('What is AI?');
      expect(result.service).toBe('scientific');
      expect(result.maxResults).toBe(10);
    });

    it('should use default maxResults when not provided', () => {
      const input = { q: 'Test query', service: 'general' };

      const result = ragQuerySchema.parse(input);

      expect(result.maxResults).toBe(5);
    });

    it('should coerce string maxResults to number', () => {
      const input = { q: 'Test', service: 'general', maxResults: '7' };

      const result = ragQuerySchema.parse(input);

      expect(result.maxResults).toBe(7);
      expect(typeof result.maxResults).toBe('number');
    });

    it('should accept minimum valid query length', () => {
      const input = { q: 'a', service: 'general' };

      const result = ragQuerySchema.parse(input);

      expect(result.q).toBe('a');
    });

    it('should accept maximum valid query length', () => {
      const longQuery = 'a'.repeat(1000);
      const input = { q: longQuery, service: 'general' };

      const result = ragQuerySchema.parse(input);

      expect(result.q).toBe(longQuery);
    });

    it('should accept minimum maxResults value', () => {
      const input = { q: 'Test', service: 'general', maxResults: '1' };

      const result = ragQuerySchema.parse(input);

      expect(result.maxResults).toBe(1);
    });

    it('should accept maximum maxResults value', () => {
      const input = { q: 'Test', service: 'general', maxResults: '20' };

      const result = ragQuerySchema.parse(input);

      expect(result.maxResults).toBe(20);
    });
  });

  describe('invalid inputs', () => {
    it('should reject empty query', () => {
      const input = { q: '', service: 'general' };

      expect(() => ragQuerySchema.parse(input)).toThrow(ZodError);
    });

    it('should reject missing query', () => {
      const input = { service: 'general' };

      expect(() => ragQuerySchema.parse(input)).toThrow(ZodError);
    });

    it('should reject missing service', () => {
      const input = { q: 'Test query' };

      expect(() => ragQuerySchema.parse(input)).toThrow(ZodError);
    });

    it('should reject empty service', () => {
      const input = { q: 'Test query', service: '' };

      expect(() => ragQuerySchema.parse(input)).toThrow(ZodError);
    });

    it('should reject query that is too long', () => {
      const input = { q: 'a'.repeat(1001), service: 'general' };

      expect(() => ragQuerySchema.parse(input)).toThrow(ZodError);
    });

    it('should reject maxResults below minimum', () => {
      const input = { q: 'Test', service: 'general', maxResults: '0' };

      expect(() => ragQuerySchema.parse(input)).toThrow(ZodError);
    });

    it('should reject maxResults above maximum', () => {
      const input = { q: 'Test', service: 'general', maxResults: '21' };

      expect(() => ragQuerySchema.parse(input)).toThrow(ZodError);
    });

    it('should reject negative maxResults', () => {
      const input = { q: 'Test', service: 'general', maxResults: '-1' };

      expect(() => ragQuerySchema.parse(input)).toThrow(ZodError);
    });
  });

  describe('error messages', () => {
    it('should provide meaningful error for empty query', () => {
      const input = { q: '', service: 'general' };

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
      const input = { q: 'a'.repeat(1001), service: 'general' };

      try {
        ragQuerySchema.parse(input);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        expect(zodError.errors[0].message).toContain('Query too long');
      }
    });

    it('should provide meaningful error for missing service', () => {
      const input = { q: 'Test' };

      try {
        ragQuerySchema.parse(input);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ZodError);
        const zodError = error as ZodError;
        expect(zodError.errors.some((e) => e.path.includes('service'))).toBe(
          true
        );
      }
    });
  });
});
