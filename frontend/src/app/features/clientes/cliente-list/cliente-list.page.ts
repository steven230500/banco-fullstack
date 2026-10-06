import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Cliente, GENERO_ETIQUETAS } from '@core/models';
import { AlertComponent } from '@shared/components/alert.component';
import { ConfirmDialogComponent } from '@shared/components/confirm-dialog.component';
import { ListToolbarComponent } from '@shared/components/list-toolbar.component';
import { PageHeaderComponent } from '@shared/components/page-header.component';
import { formatearEstado } from '@shared/format/format';
import { Columna } from '@shared/table/columna';
import { DataTableComponent } from '@shared/table/data-table.component';
import { ListaCrud } from '@shared/table/lista-crud';
import { ClientesService } from '../data-access/clientes.service';

export const COLUMNAS_CLIENTES: readonly Columna<Cliente>[] = [
  { id: 'clienteId', encabezado: 'Usuario', valor: (c) => c.clienteId },
  { id: 'nombre', encabezado: 'Nombre', valor: (c) => c.nombre },
  { id: 'identificacion', encabezado: 'Identificación', valor: (c) => c.identificacion },
  { id: 'genero', encabezado: 'Género', valor: (c) => GENERO_ETIQUETAS[c.genero] },
  { id: 'edad', encabezado: 'Edad', valor: (c) => String(c.edad), alinear: 'fin' },
  { id: 'direccion', encabezado: 'Dirección', valor: (c) => c.direccion },
  { id: 'telefono', encabezado: 'Teléfono', valor: (c) => c.telefono },
  {
    id: 'estado',
    encabezado: 'Estado',
    valor: (c) => formatearEstado(c.estado),
    insignia: (c) => (c.estado ? 'ok' : 'apagado'),
  },
];

@Component({
  selector: 'app-cliente-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    ListToolbarComponent,
    DataTableComponent,
    ConfirmDialogComponent,
    AlertComponent,
    RouterLink,
  ],
  templateUrl: './cliente-list.page.html',
})
export class ClienteListPage implements OnInit {
  private readonly servicio = inject(ClientesService);

  protected readonly columnas = COLUMNAS_CLIENTES;
  protected readonly clave = (c: Cliente) => c.clienteId;
  protected readonly lista = new ListaCrud<Cliente>({
    columnas: COLUMNAS_CLIENTES,
    cargar: () => this.servicio.listar(),
    eliminar: (c) => this.servicio.eliminar(c.clienteId),
    mensajeEliminado: (c) => `Cliente ${c.nombre} eliminado`,
  });

  ngOnInit(): void {
    this.lista.cargar();
  }
}
