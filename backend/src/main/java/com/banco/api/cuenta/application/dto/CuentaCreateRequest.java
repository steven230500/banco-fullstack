package com.banco.api.cuenta.application.dto;

import com.banco.api.cuenta.domain.TipoCuenta;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public record CuentaCreateRequest(
        @NotBlank @Pattern(regexp = "^\\d{6,20}$", message = "debe tener entre 6 y 20 dígitos") String numeroCuenta,
        @NotNull TipoCuenta tipoCuenta,
        @NotNull @PositiveOrZero @Digits(integer = 17, fraction = 2) BigDecimal saldoInicial,
        @NotNull Boolean estado,
        @NotBlank String clienteId) {
}
