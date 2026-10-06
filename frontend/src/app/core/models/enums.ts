export type Genero = 'MASCULINO' | 'FEMENINO' | 'OTRO';
export type TipoCuenta = 'AHORROS' | 'CORRIENTE';
export type TipoMovimiento = 'DEPOSITO' | 'RETIRO';

export const GENEROS: readonly Genero[] = ['MASCULINO', 'FEMENINO', 'OTRO'];
export const TIPOS_CUENTA: readonly TipoCuenta[] = ['AHORROS', 'CORRIENTE'];
export const TIPOS_MOVIMIENTO: readonly TipoMovimiento[] = ['DEPOSITO', 'RETIRO'];

export const GENERO_ETIQUETAS: Readonly<Record<Genero, string>> = {
  MASCULINO: 'Masculino',
  FEMENINO: 'Femenino',
  OTRO: 'Otro',
};

export const TIPO_CUENTA_ETIQUETAS: Readonly<Record<TipoCuenta, string>> = {
  AHORROS: 'Ahorros',
  CORRIENTE: 'Corriente',
};

export const TIPO_MOVIMIENTO_ETIQUETAS: Readonly<Record<TipoMovimiento, string>> = {
  DEPOSITO: 'Depósito',
  RETIRO: 'Retiro',
};
