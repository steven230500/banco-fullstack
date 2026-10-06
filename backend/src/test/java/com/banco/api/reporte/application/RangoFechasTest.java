package com.banco.api.reporte.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.banco.api.shared.exception.SolicitudInvalidaException;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.api.Test;

class RangoFechasTest {

    @Test
    void aceptaFechaInicioYFechaFin() {
        var rango = RangoFechas.de(Optional.of(LocalDate.of(2022, 2, 1)), Optional.of(LocalDate.of(2022, 2, 10)),
                Optional.empty());

        assertThat(rango.inicio()).isEqualTo(LocalDate.of(2022, 2, 1));
        assertThat(rango.fin()).isEqualTo(LocalDate.of(2022, 2, 10));
    }

    @Test
    void aceptaElAliasFechaConRango() {
        var rango = RangoFechas.de(Optional.empty(), Optional.empty(), Optional.of("2022-02-01, 2022-02-10"));

        assertThat(rango).isEqualTo(new RangoFechas(LocalDate.of(2022, 2, 1), LocalDate.of(2022, 2, 10)));
    }

    @Test
    void rechazaInicioPosteriorAlFin() {
        assertThatThrownBy(() -> new RangoFechas(LocalDate.of(2022, 2, 10), LocalDate.of(2022, 2, 1)))
                .isInstanceOf(SolicitudInvalidaException.class);
    }

    @Test
    void exigeAmbosExtremos() {
        assertThatThrownBy(() -> RangoFechas.de(Optional.of(LocalDate.now()), Optional.empty(), Optional.empty()))
                .isInstanceOf(SolicitudInvalidaException.class);
        assertThatThrownBy(() -> RangoFechas.de(Optional.empty(), Optional.empty(), Optional.empty()))
                .isInstanceOf(SolicitudInvalidaException.class);
    }

    @ParameterizedTest
    @ValueSource(strings = {"2022-02-01", "2022-02-01,2022-02-10,2022-03-01", "ayer,hoy"})
    void rechazaAliasMalFormado(String valor) {
        assertThatThrownBy(() -> RangoFechas.de(Optional.empty(), Optional.empty(), Optional.of(valor)))
                .isInstanceOf(SolicitudInvalidaException.class);
    }
}
