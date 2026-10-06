import { TipoCuenta } from './enums';

export interface ReporteParams {
  clienteId: string;
  fechaInicio: string;
  fechaFin: string;
}

export interface ReporteCuenta {
  numeroCuenta: string;
  tipoCuenta: TipoCuenta;
  saldoInicial: number;
  saldoDisponible: number;
  estado: boolean;
  totalCreditos: number;
  totalDebitos: number;
}

export interface ReporteMovimiento {
  fecha: string;
  cliente: string;
  numeroCuenta: string;
  tipo: TipoCuenta;
  saldoInicial: number;
  estado: boolean;
  movimiento: number;
  saldoDisponible: number;
}

export interface EstadoCuenta {
  clienteId: string;
  cliente: string;
  fechaInicio: string;
  fechaFin: string;
  totalCreditos: number;
  totalDebitos: number;
  cuentas: ReporteCuenta[];
  movimientos: ReporteMovimiento[];
}

export interface ReportePdf {
  nombreArchivo: string;
  contentType: string;
  contenidoBase64: string;
}
