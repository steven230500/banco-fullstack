package com.banco.api.reporte.application.dto;

public record ReportePdfResponse(String nombreArchivo, String contentType, String contenidoBase64) {
}
