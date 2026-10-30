export type ApiOk<T> = { ok: true; data: T; meta?: { page?: number; total?: number; totalPages?: number } };
export type ApiErr = { ok: false; error: { code: string; message: string; details?: unknown } };
export type ApiResponse<T> = ApiOk<T> | ApiErr;
