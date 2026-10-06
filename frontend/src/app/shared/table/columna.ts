import { TextoColumna } from '../search/search-filter';

export type AlineacionColumna = 'inicio' | 'fin' | 'centro';
export type TonoInsignia = 'ok' | 'apagado' | 'credito' | 'debito';

export interface Columna<T> {
  id: string;
  encabezado: string;
  valor: (fila: T) => string;
  alinear?: AlineacionColumna;
  insignia?: (fila: T) => TonoInsignia;
  clase?: (fila: T) => string | null;
}

export function textosDeColumnas<T>(columnas: readonly Columna<T>[]): TextoColumna<T>[] {
  return columnas.map((c) => c.valor);
}

export function claseMonto(valor: number): string | null {
  if (valor > 0) {
    return 'monto monto--credito';
  }
  return valor < 0 ? 'monto monto--debito' : 'monto';
}
