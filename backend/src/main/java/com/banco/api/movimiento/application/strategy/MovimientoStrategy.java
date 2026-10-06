package com.banco.api.movimiento.application.strategy;

import com.banco.api.movimiento.domain.TipoMovimiento;
import java.math.BigDecimal;

public interface MovimientoStrategy {

    TipoMovimiento tipo();

    BigDecimal valorConSigno(BigDecimal monto);

    void validar(ContextoMovimiento contexto);
}
