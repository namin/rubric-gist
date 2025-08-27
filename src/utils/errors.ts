/**
 * Pure utility functions for error handling and formatting
 * No side effects, deterministic outputs
 */

export class AppError extends Error {
  code: string;
  details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

export const ErrorCode = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  API_ERROR: 'API_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
} as const;

const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed',
  API_ERROR: 'Service temporarily unavailable',
  VALIDATION_ERROR: 'Invalid input provided',
  NOT_FOUND: 'Resource not found',
  RATE_LIMITED: 'Too many requests, please try again later',
};

/**
 * Formats any error into a user-friendly string
 * @param error - The error to format
 * @returns Formatted error message
 */
export function formatError(error: unknown): string {
  if (error instanceof AppError) {
    return createUserFriendlyMessage(error);
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Checks if an error is a network-related error
 * @param error - The error to check
 * @returns True if it's a network error
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof AppError && error.code === ErrorCode.NETWORK_ERROR;
}

/**
 * Checks if an error is an API-related error
 * @param error - The error to check
 * @returns True if it's an API error
 */
export function isApiError(error: unknown): boolean {
  return error instanceof AppError && error.code === ErrorCode.API_ERROR;
}

/**
 * Transforms API errors into AppError instances
 * @param apiError - Raw API error
 * @returns Transformed AppError
 */
export function transformApiError(apiError: any): AppError {
  if (apiError?.status === 404) {
    return new AppError('Resource not found', ErrorCode.NOT_FOUND, apiError);
  }
  
  if (apiError?.status === 403 && apiError?.message?.includes('rate limit')) {
    return new AppError('Rate limit exceeded', ErrorCode.RATE_LIMITED, apiError);
  }
  
  if (apiError?.status >= 500) {
    return new AppError('Server error', ErrorCode.API_ERROR, apiError);
  }
  
  return new AppError(
    apiError?.message || 'API request failed',
    ErrorCode.API_ERROR,
    apiError
  );
}

/**
 * Creates user-friendly error messages
 * @param error - AppError instance
 * @returns User-friendly message
 */
export function createUserFriendlyMessage(error: AppError): string {
  return ERROR_MESSAGES[error.code as keyof typeof ERROR_MESSAGES] || error.message;
}
