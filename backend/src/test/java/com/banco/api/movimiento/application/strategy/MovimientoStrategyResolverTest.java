package com.banco.api.movimiento.application.strategy;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.banco.api.movimiento.domain.TipoMovimiento;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;

class MovimientoStrategyResolverTest {

    @Test
    void resuelveLaEstrategiaPorTipo() {
        var deposito = new DepositoStrategy();
        var retiro = mock(RetiroStrategy.class);
        when(retiro.tipo()).thenReturn(TipoMovimiento.RETIRO);

        var resolver = new MovimientoStrategyResolver(List.of(deposito, retiro));

        assertThat(resolver.resolver(TipoMovimiento.DEPOSITO)).isSameAs(deposito);
        assertThat(resolver.resolver(TipoMovimiento.RETIRO)).isSameAs(retiro);
        assertThat(deposito.valorConSigno(new BigDecimal("-5"))).isEqualByComparingTo("5");
    }

    @Test
    void fallaAlArrancarSiFaltaUnaEstrategia() {
        assertThatThrownBy(() -> new MovimientoStrategyResolver(List.of(new DepositoStrategy())))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("RETIRO");
    }

    @Test
    void fallaSiHayEstrategiasDuplicadas() {
        assertThatThrownBy(() -> new MovimientoStrategyResolver(List.of(new DepositoStrategy(), new DepositoStrategy())))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("duplicada");
    }
}
