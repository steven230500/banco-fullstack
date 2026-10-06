import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_BASE_URL } from '@core/api/api-base-url.token';
import { EstadoCuenta, ReporteParams, ReportePdf } from '@core/models';
import { Observable } from 'rxjs';

function aParams({ clienteId, fechaInicio, fechaFin }: ReporteParams): HttpParams {
  return new HttpParams()
    .set('clienteId', clienteId)
    .set('fechaInicio', fechaInicio)
    .set('fechaFin', fechaFin);
}

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly http = inject(HttpClient);
  private readonly url = `${inject(API_BASE_URL)}/reportes`;

  obtener(params: ReporteParams): Observable<EstadoCuenta> {
    return this.http.get<EstadoCuenta>(this.url, { params: aParams(params) });
  }

  obtenerPdf(params: ReporteParams): Observable<ReportePdf> {
    return this.http.get<ReportePdf>(`${this.url}/pdf`, { params: aParams(params) });
  }
}
