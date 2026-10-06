package com.banco.api.movimiento.application.strategy;

import com.banco.api.movimiento.domain.TipoMovimiento;
import java.math.BigDecimal;
import org.springframework.stereotype.Component;

@Component
public class DepositoStrategy implements MovimientoStrategy {

    @Override
    public TipoMovimiento tipo() {
        return TipoMovimiento.DEPOSITO;
    }

    @Override
    public BigDecimal valorConSigno(BigDecimal monto) {
        return monto.abs().setScale(2);
    }

    @Override
    public void validar(ContextoMovimiento contexto) {
    }
}
