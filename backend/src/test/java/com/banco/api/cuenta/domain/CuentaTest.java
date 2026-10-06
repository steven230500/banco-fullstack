package com.banco.api.cuenta.domain;

import static com.banco.api.support.Fixtures.dinero;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.banco.api.cliente.domain.Cliente;
import com.banco.api.shared.exception.CodigoError;
import com.banco.api.shared.exception.OperacionNoPermitidaException;
import com.banco.api.shared.exception.ReglaNegocioException;
import com.banco.api.support.Fixtures;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class CuentaTest {

    private final Cliente cliente = Fixtures.cliente("jlema", "Jose Lema");

    @Test
    void abrirCuentaIniciaSaldoDisponibleConSaldoInicial() {
        Cuenta cuenta = Cuenta.abrir("478758", TipoCuenta.AHORROS, new BigDecimal("2000"), true, cliente);

        assertThat(cuenta.getSaldoInicial()).isEqualTo(dinero("2000"));
        assertThat(cuenta.getSaldoDisponible()).isEqualTo(dinero("2000"));
    }

    @Test
    void noSePuedeAbrirCuentaParaClienteInactivo() {
        cliente.cambiarEstado(false);

        assertThatThrownBy(() -> Cuenta.abrir("478758", TipoCuenta.AHORROS, BigDecimal.TEN, true, cliente))
                .isInstanceOf(ReglaNegocioException.class)
                .extracting("codigo").isEqualTo(CodigoError.CLIENTE_INACTIVO);
    }

    @Test
    void aplicarCreditoYDebitoActualizaSaldo() {
        Cuenta cuenta = Fixtures.cuenta(cliente, "478758", "2000");

        assertThat(cuenta.aplicar(new BigDecimal("-575"))).isEqualTo(dinero("1425"));
        assertThat(cuenta.aplicar(new BigDecimal("75"))).isEqualTo(dinero("1500"));
    }

    @Test
    void debitoQueDejaSaldoNegativoLanzaSaldoNoDisponible() {
        Cuenta cuenta = Fixtures.cuenta(cliente, "495878", "0");

        assertThatThrownBy(() -> cuenta.aplicar(new BigDecimal("-1")))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessage("Saldo no disponible");
        assertThat(cuenta.getSaldoDisponible()).isEqualTo(dinero("0"));
    }

    @Test
    void revertirDeshaceElMovimiento() {
        Cuenta cuenta = Fixtures.cuenta(cliente, "478758", "100");
        cuenta.aplicar(new BigDecimal("-40"));

        cuenta.revertir(new BigDecimal("-40"));

        assertThat(cuenta.getSaldoDisponible()).isEqualTo(dinero("100"));
    }

    @Test
    void revertirNoPuedeDejarSaldoNegativo() {
        Cuenta cuenta = Fixtures.cuenta(cliente, "478758", "10");

        assertThatThrownBy(() -> cuenta.revertir(new BigDecimal("50")))
                .isInstanceOf(OperacionNoPermitidaException.class);
    }

    @Test
    void cuentaInactivaNoEsOperable() {
        Cuenta cuenta = Fixtures.cuenta(cliente, "478758", "10");
        cuenta.cambiarEstado(false);

        assertThatThrownBy(cuenta::verificarOperable)
                .isInstanceOf(ReglaNegocioException.class)
                .extracting("codigo").isEqualTo(CodigoError.CUENTA_INACTIVA);
    }

    @Test
    void tieneSaldoParaComparaConSaldoDisponible() {
        Cuenta cuenta = Fixtures.cuenta(cliente, "478758", "100");

        assertThat(cuenta.tieneSaldoPara(new BigDecimal("100"))).isTrue();
        assertThat(cuenta.tieneSaldoPara(new BigDecimal("100.01"))).isFalse();
    }
}
