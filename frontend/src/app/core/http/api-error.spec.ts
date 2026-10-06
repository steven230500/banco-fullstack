import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import {
  ApiError,
  MENSAJE_ERROR_GENERICO,
  MENSAJE_SIN_CONEXION,
  isApiError,
  mensajeDeError,
  toApiError,
} from './api-error';

const problema = {
  type: 'https://banco.local/errores/validacion',
  title: 'Solicitud inválida',
  status: 400,
  detail: 'La solicitud tiene errores de validación',
  codigo: 'VALIDACION',
  requestId: 'abc-123',
  errores: [
    { campo: 'valor', mensaje: 'debe ser mayor que 0' },
    { campo: 1, mensaje: 'campo no textual se descarta' },
  ],
};

function respuesta(status: number, error: unknown): HttpErrorResponse {
  return new HttpErrorResponse({
    status,
    error,
    headers: new HttpHeaders({ 'Content-Type': 'application/problem+json' }),
  });
}

describe('toApiError', () => {
  it('normaliza un Problem Details con errores de campo', () => {
    const error = toApiError(respuesta(400, problema));

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(400);
    expect(error.detalle).toBe('La solicitud tiene errores de validación');
    expect(error.codigo).toBe('VALIDACION');
    expect(error.titulo).toBe('Solicitud inválida');
    expect(error.requestId).toBe('abc-123');
    expect(error.errores).toEqual([{ campo: 'valor', mensaje: 'debe ser mayor que 0' }]);
    expect(error.message).toBe(error.detalle);
  });

  it('interpreta un Problem Details recibido como texto JSON', () => {
    const cuerpo = JSON.stringify({
      status: 422,
      detail: 'Saldo no disponible',
      codigo: 'SALDO_NO_DISPONIBLE',
    });
    const error = toApiError(respuesta(422, cuerpo));

    expect(error.detalle).toBe('Saldo no disponible');
    expect(error.codigo).toBe('SALDO_NO_DISPONIBLE');
    expect(error.errores).toEqual([]);
  });

  it('usa title si no hay detail y el status HTTP si el cuerpo no lo trae', () => {
    const error = toApiError(respuesta(409, { title: 'Recurso duplicado' }));

    expect(error.status).toBe(409);
    expect(error.detalle).toBe('Recurso duplicado');
  });

  it('devuelve un mensaje de conexión cuando el status es 0', () => {
    const error = toApiError(respuesta(0, new ProgressEvent('error')));

    expect(error.status).toBe(0);
    expect(error.codigo).toBe('SIN_CONEXION');
    expect(error.detalle).toBe(MENSAJE_SIN_CONEXION);
  });

  it('usa el texto plano del cuerpo cuando no es JSON', () => {
    expect(toApiError(respuesta(502, 'Bad Gateway')).detalle).toBe('Bad Gateway');
  });

  it('usa un mensaje genérico con el status cuando no hay cuerpo', () => {
    expect(toApiError(respuesta(500, null)).detalle).toBe(`${MENSAJE_ERROR_GENERICO} (HTTP 500)`);
  });
});

describe('isApiError / mensajeDeError', () => {
  it('distingue ApiError de otros errores', () => {
    const apiError = new ApiError(404, 'Cliente no encontrado');

    expect(isApiError(apiError)).toBe(true);
    expect(isApiError(new Error('x'))).toBe(false);
    expect(mensajeDeError(apiError)).toBe('Cliente no encontrado');
    expect(mensajeDeError('otro')).toBe(MENSAJE_ERROR_GENERICO);
  });
});
