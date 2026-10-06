import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { mensajeDeError } from '@core/http/api-error';
import { Cliente, EstadoCuenta, ReporteMovimiento, TIPO_CUENTA_ETIQUETAS } from '@core/models';
import { NotificationService } from '@core/notifications/notification.service';
import { AlertComponent } from '@shared/components/alert.component';
import { FieldErrorComponent } from '@shared/components/field-error.component';
import { PageHeaderComponent } from '@shared/components/page-header.component';
import { SearchBoxComponent } from '@shared/components/search-box.component';
import { descargarArchivoBase64 } from '@shared/download/download-file';
import { formatearEstado, formatearFecha, formatearMoneda } from '@shared/format/format';
import { EnvioFormulario } from '@shared/forms/form-feedback';
import { mensajeValidacion } from '@shared/forms/validation-messages';
import { filtrarFilas } from '@shared/search/search-filter';
import { Columna, claseMonto, textosDeColumnas } from '@shared/table/columna';
import { DataTableComponent } from '@shared/table/data-table.component';
import { finalize } from 'rxjs';
import { ClientesService } from '../../clientes/data-access/clientes.service';
import { ReportesService } from '../data-access/reportes.service';
import { ReporteResumenComponent } from '../reporte-resumen/reporte-resumen.component';
import { aReporteParams, crearFormularioReporte } from './reporte-filtro.model';

export const COLUMNAS_REPORTE: readonly Columna<ReporteMovimiento>[] = [
  { id: 'fecha', encabezado: 'Fecha', valor: (m) => formatearFecha(m.fecha) },
  { id: 'cliente', encabezado: 'Cliente', valor: (m) => m.cliente },
  { id: 'numeroCuenta', encabezado: 'Número cuenta', valor: (m) => m.numeroCuenta },
  { id: 'tipo', encabezado: 'Tipo', valor: (m) => TIPO_CUENTA_ETIQUETAS[m.tipo] },
  {
    id: 'saldoInicial',
    encabezado: 'Saldo inicial',
    valor: (m) => formatearMoneda(m.saldoInicial),
    alinear: 'fin',
  },
  {
    id: 'estado',
    encabezado: 'Estado',
    valor: (m) => formatearEstado(m.estado),
    insignia: (m) => (m.estado ? 'ok' : 'apagado'),
  },
  {
    id: 'movimiento',
    encabezado: 'Movimiento',
    valor: (m) => formatearMoneda(m.movimiento),
    alinear: 'fin',
    clase: (m) => claseMonto(m.movimiento),
  },
  {
    id: 'saldoDisponible',
    encabezado: 'Saldo disponible',
    valor: (m) => formatearMoneda(m.saldoDisponible),
    alinear: 'fin',
    clase: () => 'monto',
  },
];

@Component({
  selector: 'app-reporte-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    PageHeaderComponent,
    FieldErrorComponent,
    AlertComponent,
    SearchBoxComponent,
    DataTableComponent,
    ReporteResumenComponent,
  ],
  templateUrl: './reporte.page.html',
})
export class ReportePage implements OnInit {
  private readonly reportes = inject(ReportesService);
  private readonly clientesService = inject(ClientesService);
  private readonly notificaciones = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);

  protected readonly form = crearFormularioReporte(inject(NonNullableFormBuilder));
  protected readonly envio = new EnvioFormulario();
  protected readonly clientes = signal<readonly Cliente[]>([]);
  protected readonly reporte = signal<EstadoCuenta | null>(null);
  protected readonly descargando = signal(false);
  protected readonly termino = signal('');

  protected readonly columnas = COLUMNAS_REPORTE;
  protected readonly clave = (m: ReporteMovimiento) =>
    `${m.numeroCuenta}-${m.fecha}-${m.movimiento}-${m.saldoDisponible}`;
  protected readonly movimientosFiltrados = computed(() =>
    filtrarFilas(
      this.reporte()?.movimientos ?? [],
      this.termino(),
      textosDeColumnas(COLUMNAS_REPORTE),
    ),
  );

  ngOnInit(): void {
    this.clientesService
      .listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (clientes) => this.clientes.set(clientes),
        error: (error: unknown) => this.envio.mostrarError(null, error),
      });
  }

  protected errorRango(): string | null {
    const { fechaInicio, fechaFin } = this.form.controls;
    const tocado = fechaInicio.touched || fechaFin.touched;
    return tocado ? mensajeValidacion(this.form.errors) : null;
  }

  protected generar(): void {
    this.envio.enviar(this.form, {
      peticion: () => this.reportes.obtener(aReporteParams(this.form)),
      mensajeExito: 'Reporte generado',
      alGuardar: (reporte) => {
        this.termino.set('');
        this.reporte.set(reporte);
      },
    });
  }

  protected descargarPdf(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.descargando.set(true);
    this.reportes
      .obtenerPdf(aReporteParams(this.form))
      .pipe(
        finalize(() => this.descargando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (pdf) => {
          descargarArchivoBase64(pdf, this.document);
          this.notificaciones.exito(`PDF descargado: ${pdf.nombreArchivo}`);
        },
        error: (error: unknown) => this.notificaciones.error(mensajeDeError(error)),
      });
  }
}
