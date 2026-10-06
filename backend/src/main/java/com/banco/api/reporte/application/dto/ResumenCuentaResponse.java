package com.banco.api.reporte.application.dto;

import com.banco.api.cuenta.domain.TipoCuenta;
import java.math.BigDecimal;

public record ResumenCuentaResponse(
        String numeroCuenta,
        TipoCuenta tipoCuenta,
        BigDecimal saldoInicial,
        BigDecimal saldoDisponible,
        boolean estado,
        BigDecimal totalCreditos,
        BigDecimal totalDebitos) {
}
