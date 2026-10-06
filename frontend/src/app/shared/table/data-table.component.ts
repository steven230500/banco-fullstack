import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef, input } from '@angular/core';
import { Columna } from './columna';

export interface AccionesContexto<T> {
  $implicit: T;
}

@Component({
  selector: 'app-data-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  template: `
    <div class="table-wrapper" [attr.data-testid]="testId()">
      <table class="table">
        <caption class="sr-only">
          {{
            titulo()
          }}
        </caption>
        <thead>
          <tr>
            @for (col of columnas(); track col.id) {
              <th scope="col" [class]="'align-' + (col.alinear ?? 'inicio')">
                {{ col.encabezado }}
              </th>
            }
            @if (acciones()) {
              <th scope="col" class="align-fin">Acciones</th>
            }
          </tr>
        </thead>
        <tbody>
          @for (fila of filas(); track clave()(fila)) {
            <tr data-testid="table-row" [attr.data-row-key]="clave()(fila)">
              @for (col of columnas(); track col.id) {
                <td
                  [class]="'align-' + (col.alinear ?? 'inicio') + ' ' + (col.clase?.(fila) ?? '')"
                  [attr.data-label]="col.encabezado"
                  [attr.data-testid]="'celda-' + col.id"
                >
                  @if (col.insignia) {
                    <span [class]="'badge badge--' + col.insignia(fila)">{{
                      col.valor(fila)
                    }}</span>
                  } @else {
                    {{ col.valor(fila) }}
                  }
                </td>
              }
              @if (acciones(); as plantilla) {
                <td class="align-fin table__actions" data-label="Acciones">
                  <ng-container *ngTemplateOutlet="plantilla; context: { $implicit: fila }" />
                </td>
              }
            </tr>
          } @empty {
            <tr>
              <td
                class="table__empty"
                [attr.colspan]="columnas().length + (acciones() ? 1 : 0)"
                data-testid="empty-state"
              >
                {{ cargando() ? 'Cargando…' : mensajeVacio() }}
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class DataTableComponent<T> {
  readonly titulo = input.required<string>();
  readonly columnas = input.required<readonly Columna<T>[]>();
  readonly filas = input.required<readonly T[]>();
  readonly clave = input.required<(fila: T) => string | number>();
  readonly acciones = input<TemplateRef<AccionesContexto<T>> | null>(null);
  readonly cargando = input(false);
  readonly mensajeVacio = input('No hay registros para mostrar.');
  readonly testId = input('data-table');
}
