import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { allByTestId, byTestId, estabilizar } from '@testing/dom';
import { Columna, claseMonto, textosDeColumnas } from './columna';
import { DataTableComponent } from './data-table.component';

interface Fila {
  id: number;
  nombre: string;
  saldo: number;
  activo: boolean;
}

const COLUMNAS: Columna<Fila>[] = [
  { id: 'nombre', encabezado: 'Nombre', valor: (f) => f.nombre },
  {
    id: 'saldo',
    encabezado: 'Saldo',
    valor: (f) => f.saldo.toFixed(2),
    alinear: 'fin',
    clase: (f) => claseMonto(f.saldo),
  },
  {
    id: 'estado',
    encabezado: 'Estado',
    valor: (f) => (f.activo ? 'Activo' : 'Inactivo'),
    insignia: (f) => (f.activo ? 'ok' : 'apagado'),
  },
];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DataTableComponent],
  template: `
    <app-data-table
      titulo="Prueba"
      [columnas]="columnas"
      [filas]="filas()"
      [clave]="clave"
      [cargando]="cargando()"
      [acciones]="conAcciones() ? acciones : null"
    />
    <ng-template #acciones let-fila
      ><button type="button" data-testid="accion">{{ fila.nombre }}</button></ng-template
    >
  `,
})
class HostComponent {
  readonly columnas = COLUMNAS;
  readonly clave = (f: Fila) => f.id;
  readonly filas = signal<Fila[]>([
    { id: 1, nombre: 'Ana', saldo: 100, activo: true },
    { id: 2, nombre: 'Luis', saldo: -50, activo: false },
  ]);
  readonly cargando = signal(false);
  readonly conAcciones = signal(true);
}

describe('DataTableComponent', () => {
  async function crear() {
    const fixture = TestBed.createComponent(HostComponent);
    await estabilizar(fixture);
    return fixture;
  }

  it('renderiza encabezados, filas, insignias, clases y acciones', async () => {
    const fixture = await crear();
    const encabezados = Array.from(fixture.nativeElement.querySelectorAll('th')).map((th) =>
      (th as HTMLElement).textContent?.trim(),
    );
    expect(encabezados).toEqual(['Nombre', 'Saldo', 'Estado', 'Acciones']);

    const filas = allByTestId(fixture, 'table-row');
    expect(filas).toHaveLength(2);
    expect(filas[0].getAttribute('data-row-key')).toBe('1');
    expect(filas[1].querySelector('.badge--apagado')?.textContent?.trim()).toBe('Inactivo');
    expect(filas[1].querySelector('[data-testid="celda-saldo"]')?.className).toContain(
      'monto--debito',
    );
    expect(allByTestId(fixture, 'accion').map((b) => b.textContent)).toEqual(['Ana', 'Luis']);
  });

  it('muestra estado vacío o de carga y omite la columna de acciones', async () => {
    const fixture = await crear();
    fixture.componentInstance.filas.set([]);
    fixture.componentInstance.conAcciones.set(false);
    fixture.componentInstance.cargando.set(true);
    await estabilizar(fixture);

    expect(byTestId(fixture, 'empty-state')?.textContent?.trim()).toBe('Cargando…');
    expect(byTestId(fixture, 'empty-state')?.getAttribute('colspan')).toBe('3');

    fixture.componentInstance.cargando.set(false);
    await estabilizar(fixture);
    expect(byTestId(fixture, 'empty-state')?.textContent?.trim()).toBe(
      'No hay registros para mostrar.',
    );
  });
});

describe('utilidades de columna', () => {
  it('extrae los textos para la búsqueda y clasifica montos', () => {
    const fila = { id: 1, nombre: 'Ana', saldo: 0, activo: true };
    expect(textosDeColumnas(COLUMNAS).map((f) => f(fila))).toEqual(['Ana', '0.00', 'Activo']);
    expect(claseMonto(0)).toBe('monto');
    expect(claseMonto(5)).toContain('credito');
  });
});
