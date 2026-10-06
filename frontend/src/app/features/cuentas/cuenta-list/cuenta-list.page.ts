import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Cuenta, TIPO_CUENTA_ETIQUETAS } from '@core/models';
import { AlertComponent } from '@shared/components/alert.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog.component';
import { ListToolbarComponent } from '@shared/components/list-toolbar.component';
import { PageHeaderComponent } from '@shared/components/page-header.component';
import { formatearEstado, formatearMoneda } from '@shared/format/format';
import { Columna } from '@shared/table/columna';
import { DataTableComponent } from '@shared/table/data-table.component';
import { ListaCrud } from '@shared/table/lista-crud';
import { CuentasService } from '../data-access/cuentas.service';

export const COLUMNAS_CUENTAS: readonly Columna<Cuenta>[] = [
  { id: 'numeroCuenta', encabezado: 'Número cuenta', valor: (c) => c.numeroCuenta },
  { id: 'tipoCuenta', encabezado: 'Tipo', valor: (c) => TIPO_CUENTA_ETIQUETAS[c.tipoCuenta] },
  { id: 'cliente', encabezado: 'Cliente', valor: (c) => c.clienteNombre },
  {
    id: 'saldoInicial',
    encabezado: 'Saldo inicial',
    valor: (c) => formatearMoneda(c.saldoInicial),
    alinear: 'fin',
  },
  {
    id: 'saldoDisponible',
    encabezado: 'Saldo disponible',
    valor: (c) => formatearMoneda(c.saldoDisponible),
    alinear: 'fin',
    clase: () => 'monto',
  },
  {
    id: 'estado',
    encabezado: 'Estado',
    valor: (c) => formatearEstado(c.estado),
    insignia: (c) => (c.estado ? 'ok' : 'apagado'),
  },
];

@Component({
  selector: 'app-cuenta-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    ListToolbarComponent,
    DataTableComponent,
    ConfirmDialogComponent,
    AlertComponent,
    RouterLink,
  ],
  templateUrl: './cuenta-list.page.html',
})
export class CuentaListPage implements OnInit {
  private readonly servicio = inject(CuentasService);

  protected readonly columnas = COLUMNAS_CUENTAS;
  protected readonly clave = (c: Cuenta) => c.numeroCuenta;
  protected readonly lista = new ListaCrud<Cuenta>({
    columnas: COLUMNAS_CUENTAS,
    cargar: () => this.servicio.listar(),
    eliminar: (c) => this.servicio.eliminar(c.numeroCuenta),
    mensajeEliminado: (c) => `Cuenta ${c.numeroCuenta} eliminada`,
  });

  ngOnInit(): void {
    this.lista.cargar();
  }
}
