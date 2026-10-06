package com.banco.api.movimiento.application;

import com.banco.api.movimiento.application.dto.MovimientoResponse;
import com.banco.api.movimiento.domain.Movimiento;
import java.time.ZoneId;

final class MovimientoMapper {

    private MovimientoMapper() {
    }

    static MovimientoResponse toResponse(Movimiento movimiento, ZoneId zona) {
        var cuenta = movimiento.getCuenta();
        return new MovimientoResponse(
                movimiento.getId(),
                movimiento.getFecha().atZone(zona).toOffsetDateTime(),
                cuenta.getNumeroCuenta(),
                movimiento.getTipoMovimiento(),
                movimiento.getValor(),
                movimiento.saldoInicial(),
                movimiento.getSaldo(),
                cuenta.getCliente().getClienteId(),
                cuenta.getCliente().getNombre());
    }
}
