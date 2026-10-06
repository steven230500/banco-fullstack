package com.banco.api.movimiento.application.dto;

import com.banco.api.movimiento.domain.TipoMovimiento;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record MovimientoRequest(
        @NotBlank String numeroCuenta,
        @NotNull TipoMovimiento tipoMovimiento,
        @NotNull @Positive @Digits(integer = 17, fraction = 2) BigDecimal valor) {
}
