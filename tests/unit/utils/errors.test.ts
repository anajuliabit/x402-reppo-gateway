import {
  AppError,
  ValidationError,
  NotFoundError,
  PaymentError,
  ReppoServiceError,
} from '../../../src/utils/errors.js';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create error with default values', () => {
      const error = new AppError('Test error');

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('Error');
    });

    it('should create error with custom status code', () => {
      const error = new AppError('Custom error', 418);

      expect(error.statusCode).toBe(418);
    });

    it('should create error with custom isOperational flag', () => {
      const error = new AppError('Fatal error', 500, false);

      expect(error.isOperational).toBe(false);
    });

    it('should capture stack trace', () => {
      const error = new AppError('Stack trace test');

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('Stack trace test');
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with 400 status', () => {
      const error = new ValidationError('Invalid input');

      expect(error.message).toBe('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with default message', () => {
      const error = new NotFoundError();

      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
    });

    it('should create not found error with custom message', () => {
      const error = new NotFoundError('User not found');

      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('PaymentError', () => {
    it('should create payment error with 402 status', () => {
      const error = new PaymentError('Payment required');

      expect(error.message).toBe('Payment required');
      expect(error.statusCode).toBe(402);
    });
  });

  describe('ReppoServiceError', () => {
    it('should create service error with 503 status', () => {
      const error = new ReppoServiceError('Service unavailable');

      expect(error.message).toBe('Service unavailable');
      expect(error.statusCode).toBe(503);
    });
  });
});
