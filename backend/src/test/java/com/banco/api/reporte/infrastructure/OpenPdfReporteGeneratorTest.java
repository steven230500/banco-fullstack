package com.banco.api.reporte.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;

import com.banco.api.cuenta.domain.TipoCuenta;
import com.banco.api.reporte.application.dto.EstadoCuentaResponse;
import com.banco.api.reporte.application.dto.MovimientoReporteResponse;
import com.banco.api.reporte.application.dto.ResumenCuentaResponse;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;

class OpenPdfReporteGeneratorTest {

    private final OpenPdfReporteGenerator generator = new OpenPdfReporteGenerator();

    @Test
    void generaUnPdfValido() {
        var reporte = new EstadoCuentaResponse("mmontalvo", "Marianela Montalvo",
                LocalDate.of(2022, 2, 1), LocalDate.of(2022, 2, 10),
                new BigDecimal("600.00"), new BigDecimal("-540.00"),
                List.of(new ResumenCuentaResponse("225487", TipoCuenta.CORRIENTE, new BigDecimal("100.00"),
                        new BigDecimal("700.00"), true, new BigDecimal("600.00"), BigDecimal.ZERO)),
                List.of(new MovimientoReporteResponse(LocalDate.of(2022, 2, 10), "Marianela Montalvo", "225487",
                        TipoCuenta.CORRIENTE, new BigDecimal("100.00"), true, new BigDecimal("600.00"),
                        new BigDecimal("700.00"))));

        byte[] pdf = generator.generar(reporte);

        assertThat(new String(pdf, 0, 5, StandardCharsets.US_ASCII)).isEqualTo("%PDF-");
        assertThat(pdf.length).isGreaterThan(1000);
    }

    @Test
    void generaPdfAunSinMovimientos() {
        var reporte = new EstadoCuentaResponse("jlema", "Jose Lema", LocalDate.of(2022, 2, 1),
                LocalDate.of(2022, 2, 10), BigDecimal.ZERO, BigDecimal.ZERO, List.of(), List.of());

        assertThat(generator.generar(reporte)).startsWith("%PDF-".getBytes(StandardCharsets.US_ASCII));
    }
}
