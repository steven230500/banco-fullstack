package com.banco.api.cuenta.application.dto;

import com.banco.api.cuenta.domain.TipoCuenta;
import java.math.BigDecimal;

public record CuentaResponse(
        String numeroCuenta,
        TipoCuenta tipoCuenta,
        BigDecimal saldoInicial,
        BigDecimal saldoDisponible,
        boolean estado,
        String clienteId,
        String clienteNombre) {
}
