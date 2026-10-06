package com.banco.api.movimiento.domain;

import static com.banco.api.support.Fixtures.dinero;
import static org.assertj.core.api.Assertions.assertThat;

import com.banco.api.cuenta.domain.Cuenta;
import com.banco.api.support.Fixtures;
import java.math.BigDecimal;
import java.time.Instant;
import org.junit.jupiter.api.Test;

class MovimientoTest {

    private final Cuenta cuenta = Fixtures.cuenta(Fixtures.cliente("mmontalvo", "Marianela Montalvo"), "225487", "100");

    @Test
    void registrarGuardaValorConSignoYSaldoResultante() {
        Movimiento deposito = Movimiento.registrar(cuenta, TipoMovimiento.DEPOSITO, dinero("600"), Instant.now());

        assertThat(deposito.getValor()).isEqualTo(dinero("600"));
        assertThat(deposito.getSaldo()).isEqualTo(dinero("700"));
        assertThat(deposito.saldoInicial()).isEqualTo(dinero("100"));
        assertThat(cuenta.getSaldoDisponible()).isEqualTo(dinero("700"));
    }

    @Test
    void corregirReemplazaTipoYValorSobreSaldoRevertido() {
        Movimiento movimiento = Movimiento.registrar(cuenta, TipoMovimiento.DEPOSITO, dinero("600"), Instant.now());
        cuenta.revertir(movimiento.getValor());

        movimiento.corregir(TipoMovimiento.RETIRO, new BigDecimal("-50.00"));

        assertThat(movimiento.getTipoMovimiento()).isEqualTo(TipoMovimiento.RETIRO);
        assertThat(movimiento.getSaldo()).isEqualTo(dinero("50"));
        assertThat(movimiento.monto()).isEqualTo(dinero("50"));
    }
}
