import { aFechaIso, formatearEstado, formatearFecha, formatearMoneda, inicioDeMes } from './format';
import { EstadoPipe, FechaPipe, MonedaPipe } from './format.pipes';

describe('formatearMoneda', () => {
  it('formatea con símbolo, separador de miles y 2 decimales', () => {
    expect(formatearMoneda(1425.5)).toBe('$1,425.50');
    expect(formatearMoneda(0)).toBe('$0.00');
    expect(formatearMoneda(-575)).toBe('-$575.00');
  });

  it('devuelve vacío para valores ausentes', () => {
    expect(formatearMoneda(null)).toBe('');
    expect(formatearMoneda(undefined)).toBe('');
    expect(formatearMoneda(Number.NaN)).toBe('');
  });
});

describe('formatearFecha', () => {
  it('formatea fecha-hora ISO sin convertir zona horaria', () => {
    expect(formatearFecha('2026-10-06T01:20:00-05:00')).toBe('06/10/2026 01:20');
    expect(formatearFecha('2026-10-06T23:59:00Z')).toBe('06/10/2026 23:59');
  });

  it('formatea fechas sin hora', () => {
    expect(formatearFecha('2022-02-10')).toBe('10/02/2022');
  });

  it('devuelve el texto original si no es ISO y vacío si no hay valor', () => {
    expect(formatearFecha('ayer')).toBe('ayer');
    expect(formatearFecha(null)).toBe('');
    expect(formatearFecha('')).toBe('');
  });
});

describe('formatearEstado y fechas de filtro', () => {
  it('traduce el estado booleano', () => {
    expect(formatearEstado(true)).toBe('Activo');
    expect(formatearEstado(false)).toBe('Inactivo');
  });

  it('genera fechas yyyy-MM-dd locales', () => {
    const fecha = new Date(2026, 0, 5);
    expect(aFechaIso(fecha)).toBe('2026-01-05');
    expect(inicioDeMes(new Date(2026, 9, 20))).toBe('2026-10-01');
  });
});

describe('pipes de formato', () => {
  it('delegan en las funciones puras', () => {
    expect(new MonedaPipe().transform(10)).toBe('$10.00');
    expect(new FechaPipe().transform('2022-02-10')).toBe('10/02/2022');
    expect(new EstadoPipe().transform(true)).toBe('Activo');
  });
});
