package com.banco.api.reporte.application;

import com.banco.api.shared.exception.SolicitudInvalidaException;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Optional;

public record RangoFechas(LocalDate inicio, LocalDate fin) {

    public RangoFechas {
        if (inicio == null || fin == null) {
            throw new SolicitudInvalidaException("Debe indicar fechaInicio y fechaFin (o fecha=inicio,fin)");
        }
        if (inicio.isAfter(fin)) {
            throw new SolicitudInvalidaException("fechaInicio no puede ser posterior a fechaFin");
        }
    }

    public static RangoFechas de(Optional<LocalDate> inicio, Optional<LocalDate> fin, Optional<String> fecha) {
        if (inicio.isPresent() || fin.isPresent()) {
            return new RangoFechas(inicio.orElse(null), fin.orElse(null));
        }
        return fecha.map(RangoFechas::parsear)
                .orElseThrow(() -> new SolicitudInvalidaException(
                        "Debe indicar fechaInicio y fechaFin (o fecha=inicio,fin)"));
    }

    private static RangoFechas parsear(String rango) {
        String[] partes = rango.split(",");
        if (partes.length != 2) {
            throw new SolicitudInvalidaException("El parámetro fecha debe tener el formato yyyy-MM-dd,yyyy-MM-dd");
        }
        try {
            return new RangoFechas(LocalDate.parse(partes[0].strip()), LocalDate.parse(partes[1].strip()));
        } catch (DateTimeParseException e) {
            throw new SolicitudInvalidaException("El parámetro fecha debe tener el formato yyyy-MM-dd,yyyy-MM-dd");
        }
    }
}
