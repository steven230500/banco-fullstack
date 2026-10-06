import { TipoMovimiento } from './enums';

export interface Movimiento {
  id: number;
  fecha: string;
  numeroCuenta: string;
  tipoMovimiento: TipoMovimiento;
  valor: number;
  saldoInicial: number;
  saldo: number;
  clienteId: string;
  clienteNombre: string;
}

export interface MovimientoRequest {
  numeroCuenta: string;
  tipoMovimiento: TipoMovimiento;
  valor: number;
}

export interface MovimientoUpdateRequest {
  tipoMovimiento: TipoMovimiento;
  valor: number;
}

export interface MovimientoFiltro {
  numeroCuenta?: string;
  clienteId?: string;
  fechaInicio?: string;
  fechaFin?: string;
}
