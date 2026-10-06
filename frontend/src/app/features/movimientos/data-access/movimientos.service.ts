import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '@core/api/api-base-url.token';
import {
  Movimiento,
  MovimientoFiltro,
  MovimientoRequest,
  MovimientoUpdateRequest,
} from '@core/models';
import { Observable } from 'rxjs';

export function paramsDeFiltro(filtro: MovimientoFiltro = {}): HttpParams {
  return Object.entries(filtro).reduce(
    (params, [clave, valor]) => (valor ? params.set(clave, valor) : params),
    new HttpParams(),
  );
}

@Injectable({ providedIn: 'root' })
export class MovimientosService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/movimientos`;

  listar(filtro?: MovimientoFiltro): Observable<Movimiento[]> {
    return this.http.get<Movimiento[]>(this.url, { params: paramsDeFiltro(filtro) });
  }

  obtener(id: number): Observable<Movimiento> {
    return this.http.get<Movimiento>(`${this.url}/${id}`);
  }

  crear(request: MovimientoRequest): Observable<Movimiento> {
    return this.http.post<Movimiento>(this.url, request);
  }

  actualizar(id: number, request: MovimientoUpdateRequest): Observable<Movimiento> {
    return this.http.put<Movimiento>(`${this.url}/${id}`, request);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
