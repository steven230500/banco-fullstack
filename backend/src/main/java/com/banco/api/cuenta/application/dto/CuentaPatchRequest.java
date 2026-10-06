package com.banco.api.cuenta.application.dto;

import com.banco.api.cuenta.domain.TipoCuenta;

public record CuentaPatchRequest(TipoCuenta tipoCuenta, Boolean estado) {
}
