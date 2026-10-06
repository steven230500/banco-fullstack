import { Cliente, Cuenta, EstadoCuenta, Movimiento, ReportePdf } from '@core/models';

export const CLIENTE_JLEMA: Cliente = {
  id: 1,
  clienteId: 'jlema',
  nombre: 'Jose Lema',
  genero: 'MASCULINO',
  edad: 35,
  identificacion: '1712345678',
  direccion: 'Otavalo sn y principal',
  telefono: '098254785',
  estado: true,
};

export const CLIENTE_MMONTALVO: Cliente = {
  id: 2,
  clienteId: 'mmontalvo',
  nombre: 'Marianela Montalvo',
  genero: 'FEMENINO',
  edad: 28,
  identificacion: '1723456789',
  direccion: 'Amazonas y NNUU',
  telefono: '097548965',
  estado: true,
};

export const CLIENTE_JOSORIO: Cliente = {
  id: 3,
  clienteId: 'josorio',
  nombre: 'Juan Osorio',
  genero: 'MASCULINO',
  edad: 40,
  identificacion: '1734567890',
  direccion: '13 junio y Equinoccial',
  telefono: '098874587',
  estado: false,
};

export const CLIENTES: Cliente[] = [CLIENTE_JLEMA, CLIENTE_JOSORIO, CLIENTE_MMONTALVO];

export const CUENTA_478758: Cuenta = {
  numeroCuenta: '478758',
  tipoCuenta: 'AHORROS',
  saldoInicial: 2000,
  saldoDisponible: 1425,
  estado: true,
  clienteId: 'jlema',
  clienteNombre: 'Jose Lema',
};

export const CUENTA_225487: Cuenta = {
  numeroCuenta: '225487',
  tipoCuenta: 'CORRIENTE',
  saldoInicial: 100,
  saldoDisponible: 700,
  estado: true,
  clienteId: 'mmontalvo',
  clienteNombre: 'Marianela Montalvo',
};

export const CUENTA_INACTIVA: Cuenta = {
  numeroCuenta: '495878',
  tipoCuenta: 'AHORROS',
  saldoInicial: 0,
  saldoDisponible: 0,
  estado: false,
  clienteId: 'josorio',
  clienteNombre: 'Juan Osorio',
};

export const CUENTAS: Cuenta[] = [CUENTA_225487, CUENTA_478758, CUENTA_INACTIVA];

export const MOVIMIENTO_RETIRO: Movimiento = {
  id: 10,
  fecha: '2026-10-06T01:20:00-05:00',
  numeroCuenta: '478758',
  tipoMovimiento: 'RETIRO',
  valor: -575,
  saldoInicial: 2000,
  saldo: 1425,
  clienteId: 'jlema',
  clienteNombre: 'Jose Lema',
};

export const MOVIMIENTO_DEPOSITO: Movimiento = {
  id: 11,
  fecha: '2026-10-05T09:00:00-05:00',
  numeroCuenta: '225487',
  tipoMovimiento: 'DEPOSITO',
  valor: 600,
  saldoInicial: 100,
  saldo: 700,
  clienteId: 'mmontalvo',
  clienteNombre: 'Marianela Montalvo',
};

export const MOVIMIENTOS: Movimiento[] = [MOVIMIENTO_RETIRO, MOVIMIENTO_DEPOSITO];

export const ESTADO_CUENTA: EstadoCuenta = {
  clienteId: 'mmontalvo',
  cliente: 'Marianela Montalvo',
  fechaInicio: '2022-02-01',
  fechaFin: '2022-02-10',
  totalCreditos: 600,
  totalDebitos: -540,
  cuentas: [
    {
      numeroCuenta: '225487',
      tipoCuenta: 'CORRIENTE',
      saldoInicial: 100,
      saldoDisponible: 700,
      estado: true,
      totalCreditos: 600,
      totalDebitos: 0,
    },
    {
      numeroCuenta: '496825',
      tipoCuenta: 'AHORROS',
      saldoInicial: 540,
      saldoDisponible: 0,
      estado: true,
      totalCreditos: 0,
      totalDebitos: -540,
    },
  ],
  movimientos: [
    {
      fecha: '2022-02-10',
      cliente: 'Marianela Montalvo',
      numeroCuenta: '225487',
      tipo: 'CORRIENTE',
      saldoInicial: 100,
      estado: true,
      movimiento: 600,
      saldoDisponible: 700,
    },
    {
      fecha: '2022-02-08',
      cliente: 'Marianela Montalvo',
      numeroCuenta: '496825',
      tipo: 'AHORROS',
      saldoInicial: 540,
      estado: true,
      movimiento: -540,
      saldoDisponible: 0,
    },
  ],
};

export const REPORTE_PDF: ReportePdf = {
  nombreArchivo: 'estado-cuenta-mmontalvo-2022-02-01-2022-02-10.pdf',
  contentType: 'application/pdf',
  contenidoBase64: 'JVBERi0xLjQ=',
};
