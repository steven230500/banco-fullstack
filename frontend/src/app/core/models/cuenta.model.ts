import { TipoCuenta } from './enums';

export interface Cuenta {
  numeroCuenta: string;
  tipoCuenta: TipoCuenta;
  saldoInicial: number;
  saldoDisponible: number;
  estado: boolean;
  clienteId: string;
  clienteNombre: string;
}

export interface CuentaCreateRequest {
  numeroCuenta: string;
  tipoCuenta: TipoCuenta;
  saldoInicial: number;
  estado: boolean;
  clienteId: string;
}

export interface CuentaUpdateRequest {
  tipoCuenta: TipoCuenta;
  saldoInicial: number;
  estado: boolean;
}
