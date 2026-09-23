/**
 * Error thrown by every IotApi implementation. `status` mirrors HTTP status
 * semantics (401 unauthenticated, 504 device timeout) so the FE reacts
 * uniformly regardless of adapter.
 */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
