import { HttpErrorResponse } from '@angular/common/http';

export interface CampoError {
  campo: string;
  mensaje: string;
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  codigo?: string;
  timestamp?: string;
  requestId?: string;
  errores?: CampoError[];
}

export const MENSAJE_SIN_CONEXION = 'No se pudo conectar con el servidor. Intente nuevamente.';
export const MENSAJE_ERROR_GENERICO = 'Ocurrió un error inesperado.';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly detalle: string,
    readonly codigo: string | null = null,
    readonly titulo: string | null = null,
    readonly errores: readonly CampoError[] = [],
    readonly requestId: string | null = null,
  ) {
    super(detalle);
    this.name = 'ApiError';
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

export function mensajeDeError(error: unknown): string {
  return isApiError(error) ? error.detalle : MENSAJE_ERROR_GENERICO;
}

function parseBody(body: unknown): unknown {
  if (typeof body !== 'string') {
    return body;
  }
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

function isProblemDetails(body: unknown): body is ProblemDetails {
  return (
    typeof body === 'object' &&
    body !== null &&
    ('detail' in body || 'title' in body || 'codigo' in body)
  );
}

function sanitizeErrores(errores: unknown): CampoError[] {
  if (!Array.isArray(errores)) {
    return [];
  }
  return errores.filter(
    (e): e is CampoError =>
      typeof e === 'object' &&
      e !== null &&
      typeof e.campo === 'string' &&
      typeof e.mensaje === 'string',
  );
}

export function toApiError(response: HttpErrorResponse): ApiError {
  if (response.status === 0) {
    return new ApiError(0, MENSAJE_SIN_CONEXION, 'SIN_CONEXION');
  }
  const body = parseBody(response.error);
  if (isProblemDetails(body)) {
    return new ApiError(
      body.status ?? response.status,
      body.detail ?? body.title ?? MENSAJE_ERROR_GENERICO,
      body.codigo ?? null,
      body.title ?? null,
      sanitizeErrores(body.errores),
      body.requestId ?? null,
    );
  }
  const texto = typeof body === 'string' && body.trim() ? body.trim() : null;
  return new ApiError(
    response.status,
    texto ?? `${MENSAJE_ERROR_GENERICO} (HTTP ${response.status})`,
  );
}
