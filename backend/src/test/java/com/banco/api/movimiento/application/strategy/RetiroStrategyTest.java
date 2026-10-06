package com.banco.api.movimiento.application.strategy;

import static com.banco.api.support.Fixtures.dinero;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.banco.api.cuenta.domain.Cuenta;
import com.banco.api.movimiento.domain.MovimientoRepository;
import com.banco.api.movimiento.domain.TipoMovimiento;
import com.banco.api.shared.config.BancoProperties;
import com.banco.api.shared.exception.ReglaNegocioException;
import com.banco.api.support.Fixtures;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RetiroStrategyTest {

    private static final ZoneId GUAYAQUIL = ZoneId.of("America/Guayaquil");
    // 01:00 en Guayaquil (UTC-5).
    private static final Instant AHORA = Instant.parse("2026-10-06T06:00:00Z");

    @Mock
    private MovimientoRepository movimientoRepository;

    private RetiroStrategy estrategia;

    @BeforeEach
    void setUp() {
        var properties = new BancoProperties(GUAYAQUIL,
                new BancoProperties.Movimientos(new BigDecimal("1000")),
                new BancoProperties.Cors(List.of("http://localhost:4200")));
        estrategia = new RetiroStrategy(movimientoRepository, properties);
    }

    @Test
    void valorConSignoEsNegativo() {
        assertThat(estrategia.valorConSigno(new BigDecimal("575"))).isEqualTo(dinero("-575"));
        assertThat(estrategia.tipo()).isEqualTo(TipoMovimiento.RETIRO);
    }

    @Test
    void saldoCeroLanzaSaldoNoDisponibleSinConsultarCupo() {
        Cuenta cuenta = cuentaConSaldo("0");

        assertThatThrownBy(() -> estrategia.validar(ContextoMovimiento.nuevo(cuenta, new BigDecimal("10"), AHORA)))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessage("Saldo no disponible");
        verify(movimientoRepository, never()).totalPorTipoEntre(any(), any(), any(), any(), any());
    }

    @Test
    void superarCupoDiarioLanzaCupoDiarioExcedido() {
        Cuenta cuenta = cuentaConSaldo("5000");
        retiradoHoy("-600");

        assertThatThrownBy(() -> estrategia.validar(ContextoMovimiento.nuevo(cuenta, new BigDecimal("401"), AHORA)))
                .isInstanceOf(ReglaNegocioException.class)
                .hasMessage("Cupo diario Excedido");
    }

    @Test
    void retirarExactamenteElCupoRestanteEsValido() {
        Cuenta cuenta = cuentaConSaldo("5000");
        retiradoHoy("-600");

        assertThatCode(() -> estrategia.validar(ContextoMovimiento.nuevo(cuenta, new BigDecimal("400"), AHORA)))
                .doesNotThrowAnyException();
    }

    @Test
    void elDiaDelCupoSeCalculaEnLaZonaHorariaDelBanco() {
        Cuenta cuenta = cuentaConSaldo("5000");
        retiradoHoy("0");

        estrategia.validar(ContextoMovimiento.nuevo(cuenta, BigDecimal.ONE, AHORA));

        // Día local completo: 00:00 Guayaquil = 05:00 UTC.
        verify(movimientoRepository).totalPorTipoEntre(
                eq(cuenta.getId()), eq(TipoMovimiento.RETIRO),
                eq(Instant.parse("2026-10-06T05:00:00Z")), eq(Instant.parse("2026-10-07T05:00:00Z")),
                eq(Optional.empty()));
    }

    @Test
    void correccionExcluyeElMovimientoQueSeEstaEditando() {
        Cuenta cuenta = cuentaConSaldo("5000");
        retiradoHoy("0");

        estrategia.validar(ContextoMovimiento.correccion(cuenta, BigDecimal.ONE, AHORA, 99L));

        verify(movimientoRepository).totalPorTipoEntre(any(), any(), any(), any(), eq(Optional.of(99L)));
    }

    private Cuenta cuentaConSaldo(String saldo) {
        return Fixtures.cuenta(Fixtures.cliente("jlema", "Jose Lema"), "478758", saldo);
    }

    private void retiradoHoy(String total) {
        when(movimientoRepository.totalPorTipoEntre(any(), eq(TipoMovimiento.RETIRO), any(), any(), any()))
                .thenReturn(new BigDecimal(total));
    }
}
