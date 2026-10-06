package com.banco.api.cuenta.application;

import com.banco.api.cuenta.application.dto.CuentaResponse;
import com.banco.api.cuenta.domain.Cuenta;

final class CuentaMapper {

    private CuentaMapper() {
    }

    static CuentaResponse toResponse(Cuenta cuenta) {
        return new CuentaResponse(
                cuenta.getNumeroCuenta(),
                cuenta.getTipoCuenta(),
                cuenta.getSaldoInicial(),
                cuenta.getSaldoDisponible(),
                cuenta.isEstado(),
                cuenta.getCliente().getClienteId(),
                cuenta.getCliente().getNombre());
    }
}
