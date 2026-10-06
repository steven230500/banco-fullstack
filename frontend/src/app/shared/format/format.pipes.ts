import { Pipe, PipeTransform } from '@angular/core';
import { formatearEstado, formatearFecha, formatearMoneda } from './format';

@Pipe({ name: 'moneda' })
export class MonedaPipe implements PipeTransform {
  transform(valor: number | null | undefined): string {
    return formatearMoneda(valor);
  }
}

@Pipe({ name: 'fecha' })
export class FechaPipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    return formatearFecha(valor);
  }
}

@Pipe({ name: 'estado' })
export class EstadoPipe implements PipeTransform {
  transform(valor: boolean): string {
    return formatearEstado(valor);
  }
}
