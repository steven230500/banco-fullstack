package com.banco.api.reporte.application;

import com.banco.api.reporte.application.dto.EstadoCuentaResponse;

public interface ReportePdfGenerator {

    byte[] generar(EstadoCuentaResponse reporte);
}
