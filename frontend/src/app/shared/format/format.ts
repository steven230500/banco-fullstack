const formatoMoneda = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatearMoneda(valor: number | null | undefined): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) {
    return '';
  }
  return formatoMoneda.format(valor);
}

const ISO_FECHA = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/;

// Sin new Date(): se muestra la hora tal como la registró el banco, sin convertir a la zona del navegador.
export function formatearFecha(valor: string | null | undefined): string {
  if (!valor) {
    return '';
  }
  const partes = ISO_FECHA.exec(valor);
  if (!partes) {
    return valor;
  }
  const [, anio, mes, dia, hora, minuto] = partes;
  const fecha = `${dia}/${mes}/${anio}`;
  return hora ? `${fecha} ${hora}:${minuto}` : fecha;
}

export function formatearEstado(estado: boolean): string {
  return estado ? 'Activo' : 'Inactivo';
}

export function aFechaIso(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

export function inicioDeMes(fecha: Date): string {
  return aFechaIso(new Date(fecha.getFullYear(), fecha.getMonth(), 1));
}
