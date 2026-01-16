import { jest } from '@jest/globals';
import { Request, Response } from 'express';
import { ZodError, ZodIssue } from 'zod';
import { errorHandler } from '../../../src/middleware/error.js';
import { AppError, ValidationError, NotFoundError } from '../../../src/utils/errors.js';

type MockFn = jest.Mock<(...args: unknown[]) => unknown>;

describe('errorHandler middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: MockFn;
  let jsonMock: MockFn;
  let statusMock: MockFn;

  beforeEach(() => {
    jsonMock = jest.fn() as MockFn;
    statusMock = jest.fn().mockReturnValue({ json: jsonMock }) as MockFn;
    mockRequest = {};
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
    mockNext = jest.fn() as MockFn;
  });

  describe('ZodError handling', () => {
    it('should return 400 for ZodError', () => {
      const zodIssues: ZodIssue[] = [
        {
          code: 'too_small',
          minimum: 1,
          type: 'string',
          inclusive: true,
          exact: false,
          message: 'Query is required',
          path: ['q'],
        },
      ];
      const error = new ZodError(zodIssues);

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Validation Error',
        details: [
          {
            field: 'q',
            message: 'Query is required',
          },
        ],
      });
    });

    it('should handle nested path in ZodError', () => {
      const zodIssues: ZodIssue[] = [
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          message: 'Expected string',
          path: ['user', 'name'],
        },
      ];
      const error = new ZodError(zodIssues);

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Validation Error',
        details: [
          {
            field: 'user.name',
            message: 'Expected string',
          },
        ],
      });
    });

    it('should handle multiple validation errors', () => {
      const zodIssues: ZodIssue[] = [
        {
          code: 'too_small',
          minimum: 1,
          type: 'string',
          inclusive: true,
          exact: false,
          message: 'Query is required',
          path: ['q'],
        },
        {
          code: 'too_big',
          maximum: 20,
          type: 'number',
          inclusive: true,
          exact: false,
          message: 'Max results exceeded',
          path: ['maxResults'],
        },
      ];
      const error = new ZodError(zodIssues);

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Validation Error',
        details: [
          { field: 'q', message: 'Query is required' },
          { field: 'maxResults', message: 'Max results exceeded' },
        ],
      });
    });
  });

  describe('AppError handling', () => {
    it('should return appropriate status for AppError', () => {
      const error = new AppError('Custom error', 418);

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(418);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Custom error',
      });
    });

    it('should handle ValidationError (400)', () => {
      const error = new ValidationError('Invalid input');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Invalid input',
      });
    });

    it('should handle NotFoundError (404)', () => {
      const error = new NotFoundError('User not found');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'User not found',
      });
    });
  });

  describe('generic Error handling', () => {
    it('should return 500 for unknown errors', () => {
      const error = new Error('Something went wrong');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Internal Server Error',
      });
    });

    it('should not expose internal error message', () => {
      const error = new Error('Database connection failed');

      errorHandler(
        error,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(jsonMock).not.toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Database connection failed',
        })
      );
    });
  });
});
