package com.banco.api.cuenta.application.dto;

import com.banco.api.cuenta.domain.TipoCuenta;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public record CuentaUpdateRequest(
        @NotNull TipoCuenta tipoCuenta,
        @NotNull @PositiveOrZero @Digits(integer = 17, fraction = 2) BigDecimal saldoInicial,
        @NotNull Boolean estado) {
}
