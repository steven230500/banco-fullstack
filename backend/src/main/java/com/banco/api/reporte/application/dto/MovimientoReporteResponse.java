package com.banco.api.reporte.application.dto;

import com.banco.api.cuenta.domain.TipoCuenta;
import java.math.BigDecimal;
import java.time.LocalDate;

public record MovimientoReporteResponse(
        LocalDate fecha,
        String cliente,
        String numeroCuenta,
        TipoCuenta tipo,
        BigDecimal saldoInicial,
        boolean estado,
        BigDecimal movimiento,
        BigDecimal saldoDisponible) {
}
