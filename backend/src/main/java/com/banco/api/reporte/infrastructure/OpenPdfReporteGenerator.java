package com.banco.api.reporte.infrastructure;

import com.banco.api.reporte.application.ReportePdfGenerator;
import com.banco.api.reporte.application.dto.EstadoCuentaResponse;
import com.banco.api.reporte.application.dto.MovimientoReporteResponse;
import com.banco.api.reporte.application.dto.ResumenCuentaResponse;
import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.function.Function;
import org.openpdf.text.Document;
import org.openpdf.text.Element;
import org.openpdf.text.Font;
import org.openpdf.text.FontFactory;
import org.openpdf.text.PageSize;
import org.openpdf.text.Paragraph;
import org.openpdf.text.Phrase;
import org.openpdf.text.pdf.PdfPCell;
import org.openpdf.text.pdf.PdfPTable;
import org.openpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Component;

@Component
public class OpenPdfReporteGenerator implements ReportePdfGenerator {

    private static final DateTimeFormatter FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final Color ENCABEZADO = new Color(0x1F, 0x3A, 0x5F);
    private static final Font TITULO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
    private static final Font SUBTITULO = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
    private static final Font NORMAL = FontFactory.getFont(FontFactory.HELVETICA, 9);
    private static final Font CABECERA = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.WHITE);

    @Override
    public byte[] generar(EstadoCuentaResponse reporte) {
        var salida = new ByteArrayOutputStream();
        var documento = new Document(PageSize.A4.rotate(), 36, 36, 36, 36);
        PdfWriter.getInstance(documento, salida);
        documento.open();
        try {
            documento.add(new Paragraph("Estado de cuenta", TITULO));
            documento.add(new Paragraph("Cliente: %s (%s)".formatted(reporte.cliente(), reporte.clienteId()), NORMAL));
            documento.add(new Paragraph("Período: %s - %s".formatted(
                    FECHA.format(reporte.fechaInicio()), FECHA.format(reporte.fechaFin())), NORMAL));
            documento.add(new Paragraph("Total créditos: %s    Total débitos: %s".formatted(
                    dinero(reporte.totalCreditos()), dinero(reporte.totalDebitos())), NORMAL));

            documento.add(espacio());
            documento.add(new Paragraph("Cuentas", SUBTITULO));
            documento.add(tabla(
                    List.of("Número cuenta", "Tipo", "Saldo inicial", "Saldo disponible", "Estado",
                            "Total créditos", "Total débitos"),
                    reporte.cuentas(),
                    this::filaCuenta));

            documento.add(espacio());
            documento.add(new Paragraph("Movimientos", SUBTITULO));
            documento.add(tabla(
                    List.of("Fecha", "Cliente", "Número cuenta", "Tipo", "Saldo inicial", "Estado",
                            "Movimiento", "Saldo disponible"),
                    reporte.movimientos(),
                    this::filaMovimiento));
        } finally {
            documento.close();
        }
        return salida.toByteArray();
    }

    private List<String> filaCuenta(ResumenCuentaResponse cuenta) {
        return List.of(cuenta.numeroCuenta(), cuenta.tipoCuenta().name(), dinero(cuenta.saldoInicial()),
                dinero(cuenta.saldoDisponible()), estado(cuenta.estado()), dinero(cuenta.totalCreditos()),
                dinero(cuenta.totalDebitos()));
    }

    private List<String> filaMovimiento(MovimientoReporteResponse fila) {
        return List.of(FECHA.format(fila.fecha()), fila.cliente(), fila.numeroCuenta(), fila.tipo().name(),
                dinero(fila.saldoInicial()), estado(fila.estado()), dinero(fila.movimiento()),
                dinero(fila.saldoDisponible()));
    }

    private static <T> PdfPTable tabla(List<String> columnas, List<T> filas, Function<T, List<String>> aCeldas) {
        var tabla = new PdfPTable(columnas.size());
        tabla.setWidthPercentage(100);
        tabla.setSpacingBefore(6);
        tabla.setHeaderRows(1);
        columnas.forEach(columna -> {
            var celda = new PdfPCell(new Phrase(columna, CABECERA));
            celda.setBackgroundColor(ENCABEZADO);
            celda.setPadding(5);
            tabla.addCell(celda);
        });
        if (filas.isEmpty()) {
            var vacia = new PdfPCell(new Phrase("Sin registros en el período", NORMAL));
            vacia.setColspan(columnas.size());
            vacia.setHorizontalAlignment(Element.ALIGN_CENTER);
            vacia.setPadding(5);
            tabla.addCell(vacia);
        }
        filas.stream().map(aCeldas).flatMap(List::stream).forEach(texto -> {
            var celda = new PdfPCell(new Phrase(texto, NORMAL));
            celda.setPadding(4);
            tabla.addCell(celda);
        });
        return tabla;
    }

    private static Paragraph espacio() {
        return new Paragraph(" ", NORMAL);
    }

    private static String estado(boolean activo) {
        return activo ? "Activa" : "Inactiva";
    }

    private static String dinero(BigDecimal valor) {
        // DecimalFormat no es thread-safe.
        var formato = new DecimalFormat("#,##0.00", DecimalFormatSymbols.getInstance(Locale.US));
        return formato.format(valor);
    }
}
