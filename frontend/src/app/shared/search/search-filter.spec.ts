import { filtrarFilas, normalizarTexto } from './search-filter';

interface Fila {
  nombre: string;
  ciudad: string;
  saldo: number;
  activo: boolean | null;
}

const filas: Fila[] = [
  { nombre: 'José Lema', ciudad: 'Otavalo', saldo: 2000, activo: true },
  { nombre: 'Marianela Montalvo', ciudad: 'Quito', saldo: 700, activo: true },
  { nombre: 'Juan Osorio', ciudad: 'Cayambe', saldo: 150, activo: null },
];
const columnas = [
  (f: Fila) => f.nombre,
  (f: Fila) => f.ciudad,
  (f: Fila) => f.saldo,
  (f: Fila) => f.activo,
];

describe('normalizarTexto', () => {
  it('quita tildes, pasa a minúsculas y compacta espacios', () => {
    expect(normalizarTexto('  JOSÉ   Lémá ')).toBe('jose lema');
    expect(normalizarTexto('Ñandú')).toBe('nandu');
  });

  it('convierte valores no textuales y nulos', () => {
    expect(normalizarTexto(1425.5)).toBe('1425.5');
    expect(normalizarTexto(false)).toBe('false');
    expect(normalizarTexto(null)).toBe('');
    expect(normalizarTexto(undefined)).toBe('');
  });
});

describe('filtrarFilas', () => {
  it('devuelve una copia de todas las filas con término vacío', () => {
    const resultado = filtrarFilas(filas, '   ', columnas);
    expect(resultado).toEqual(filas);
    expect(resultado).not.toBe(filas);
  });

  it('ignora mayúsculas y tildes', () => {
    expect(filtrarFilas(filas, 'jose', columnas).map((f) => f.nombre)).toEqual(['José Lema']);
    expect(filtrarFilas(filas, 'MÁRIANELA', columnas).map((f) => f.nombre)).toEqual([
      'Marianela Montalvo',
    ]);
  });

  it('busca en todas las columnas, incluidas las numéricas', () => {
    expect(filtrarFilas(filas, 'cayambe', columnas)).toHaveLength(1);
    expect(filtrarFilas(filas, '700', columnas).map((f) => f.ciudad)).toEqual(['Quito']);
  });

  it('exige que coincidan todas las palabras, aunque estén en columnas distintas', () => {
    expect(filtrarFilas(filas, 'juan cayambe', columnas)).toHaveLength(1);
    expect(filtrarFilas(filas, 'juan quito', columnas)).toHaveLength(0);
  });

  it('devuelve vacío si nada coincide', () => {
    expect(filtrarFilas(filas, 'guayaquil', columnas)).toEqual([]);
  });
});
