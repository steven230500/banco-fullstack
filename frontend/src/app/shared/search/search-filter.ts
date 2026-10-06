export type TextoColumna<T> = (fila: T) => string | number | boolean | null | undefined;

export function normalizarTexto(valor: unknown): string {
  if (valor === null || valor === undefined) {
    return '';
  }
  return String(valor)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function filtrarFilas<T>(
  filas: readonly T[],
  termino: string,
  columnas: readonly TextoColumna<T>[],
): T[] {
  const terminos = normalizarTexto(termino).split(' ').filter(Boolean);
  if (terminos.length === 0) {
    return [...filas];
  }
  return filas.filter((fila) => {
    const texto = columnas.map((columna) => normalizarTexto(columna(fila))).join(' | ');
    return terminos.every((t) => texto.includes(t));
  });
}
