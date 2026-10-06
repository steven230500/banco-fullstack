package com.banco.api.movimiento.application.dto;

import com.banco.api.movimiento.domain.TipoMovimiento;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record MovimientoResponse(
        Long id,
        OffsetDateTime fecha,
        String numeroCuenta,
        TipoMovimiento tipoMovimiento,
        BigDecimal valor,
        BigDecimal saldoInicial,
        BigDecimal saldo,
        String clienteId,
        String clienteNombre) {
}
