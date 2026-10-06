import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '@core/api/api-base-url.token';
import { Cuenta, CuentaCreateRequest, CuentaUpdateRequest } from '@core/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CuentasService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/cuentas`;

  listar(clienteId?: string): Observable<Cuenta[]> {
    const params = clienteId ? new HttpParams().set('clienteId', clienteId) : undefined;
    return this.http.get<Cuenta[]>(this.url, { params });
  }

  obtener(numeroCuenta: string): Observable<Cuenta> {
    return this.http.get<Cuenta>(`${this.url}/${encodeURIComponent(numeroCuenta)}`);
  }

  crear(request: CuentaCreateRequest): Observable<Cuenta> {
    return this.http.post<Cuenta>(this.url, request);
  }

  actualizar(numeroCuenta: string, request: CuentaUpdateRequest): Observable<Cuenta> {
    return this.http.put<Cuenta>(`${this.url}/${encodeURIComponent(numeroCuenta)}`, request);
  }

  eliminar(numeroCuenta: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${encodeURIComponent(numeroCuenta)}`);
  }
}
