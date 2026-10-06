package com.banco.api.movimiento.application.strategy;

import com.banco.api.cuenta.domain.Cuenta;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

public record ContextoMovimiento(Cuenta cuenta, BigDecimal monto, Instant fecha, Optional<Long> movimientoExcluidoId) {

    public static ContextoMovimiento nuevo(Cuenta cuenta, BigDecimal monto, Instant fecha) {
        return new ContextoMovimiento(cuenta, monto, fecha, Optional.empty());
    }

    public static ContextoMovimiento correccion(Cuenta cuenta, BigDecimal monto, Instant fecha, Long movimientoId) {
        return new ContextoMovimiento(cuenta, monto, fecha, Optional.of(movimientoId));
    }
}
