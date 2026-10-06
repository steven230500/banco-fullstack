import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '@core/api/api-base-url.token';
import { Cliente, ClienteCreateRequest, ClienteUpdateRequest } from '@core/models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/clientes`;

  listar(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.url);
  }

  obtener(clienteId: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.url}/${encodeURIComponent(clienteId)}`);
  }

  crear(request: ClienteCreateRequest): Observable<Cliente> {
    return this.http.post<Cliente>(this.url, request);
  }

  actualizar(clienteId: string, request: ClienteUpdateRequest): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.url}/${encodeURIComponent(clienteId)}`, request);
  }

  eliminar(clienteId: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${encodeURIComponent(clienteId)}`);
  }
}
