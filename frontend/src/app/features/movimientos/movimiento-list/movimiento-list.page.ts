import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Movimiento, TIPO_MOVIMIENTO_ETIQUETAS } from '@core/models';
import { AlertComponent } from '@shared/components/alert.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog.component';
import { ListToolbarComponent } from '@shared/components/list-toolbar.component';
import { PageHeaderComponent } from '@shared/components/page-header.component';
import { formatearFecha, formatearMoneda } from '@shared/format/format';
import { Columna, claseMonto } from '@shared/table/columna';
import { DataTableComponent } from '@shared/table/data-table.component';
import { ListaCrud } from '@shared/table/lista-crud';
import { MovimientosService } from '../data-access/movimientos.service';

export const COLUMNAS_MOVIMIENTOS: readonly Columna<Movimiento>[] = [
  { id: 'fecha', encabezado: 'Fecha', valor: (m) => formatearFecha(m.fecha) },
  { id: 'cliente', encabezado: 'Cliente', valor: (m) => m.clienteNombre },
  { id: 'numeroCuenta', encabezado: 'Número cuenta', valor: (m) => m.numeroCuenta },
  {
    id: 'tipoMovimiento',
    encabezado: 'Tipo',
    valor: (m) => TIPO_MOVIMIENTO_ETIQUETAS[m.tipoMovimiento],
    insignia: (m) => (m.tipoMovimiento === 'DEPOSITO' ? 'credito' : 'debito'),
  },
  {
    id: 'saldoInicial',
    encabezado: 'Saldo inicial',
    valor: (m) => formatearMoneda(m.saldoInicial),
    alinear: 'fin',
  },
  {
    id: 'valor',
    encabezado: 'Movimiento',
    valor: (m) => formatearMoneda(m.valor),
    alinear: 'fin',
    clase: (m) => claseMonto(m.valor),
  },
  {
    id: 'saldo',
    encabezado: 'Saldo disponible',
    valor: (m) => formatearMoneda(m.saldo),
    alinear: 'fin',
    clase: () => 'monto',
  },
];

@Component({
  selector: 'app-movimiento-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    ListToolbarComponent,
    DataTableComponent,
    ConfirmDialogComponent,
    AlertComponent,
    RouterLink,
  ],
  templateUrl: './movimiento-list.page.html',
})
export class MovimientoListPage implements OnInit {
  private readonly servicio = inject(MovimientosService);

  protected readonly columnas = COLUMNAS_MOVIMIENTOS;
  protected readonly clave = (m: Movimiento) => m.id;
  protected readonly lista = new ListaCrud<Movimiento>({
    columnas: COLUMNAS_MOVIMIENTOS,
    cargar: () => this.servicio.listar(),
    eliminar: (m) => this.servicio.eliminar(m.id),
    mensajeEliminado: (m) => `Movimiento de la cuenta ${m.numeroCuenta} eliminado`,
  });

  ngOnInit(): void {
    this.lista.cargar();
  }
}
