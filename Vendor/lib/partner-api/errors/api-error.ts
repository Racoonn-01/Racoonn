import { NextResponse } from 'next/server';
import { ApiResponse } from '../types';

export class ApiError extends Error {
  public statusCode: number;
  public code: string;
  public details?: unknown;

  constructor(code: string, message: string, statusCode: number = 400, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function createErrorResponse(
  code: string,
  message: string,
  statusCode: number = 400,
  details: unknown = null,
  headers: Record<string, string> = {}
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details: details || null,
      },
    },
    {
      status: statusCode,
      headers,
    }
  );
}

export function handleApiError(error: unknown, requestId?: string): NextResponse<ApiResponse> {
  const headers: Record<string, string> = {};
  if (requestId) {
    headers['X-Request-ID'] = requestId;
  }

  if (error instanceof ApiError) {
    return createErrorResponse(error.code, error.message, error.statusCode, error.details, headers);
  }

  // Handle standard errors safely without leaking internal stack traces
  console.error(`[Partner API Internal Error] [Req: ${requestId || 'unknown'}]:`, error);
  return createErrorResponse(
    'INTERNAL_SERVER_ERROR',
    'An unexpected error occurred while processing your request.',
    500,
    null,
    headers
  );
}
