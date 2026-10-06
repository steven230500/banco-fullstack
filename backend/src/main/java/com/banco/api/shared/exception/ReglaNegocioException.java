package com.banco.api.shared.exception;

public class ReglaNegocioException extends BusinessException {

    public ReglaNegocioException(CodigoError codigo) {
        super(codigo, codigo.titulo());
    }

    public ReglaNegocioException(CodigoError codigo, String mensaje) {
        super(codigo, mensaje);
    }

    public static ReglaNegocioException saldoNoDisponible() {
        return new ReglaNegocioException(CodigoError.SALDO_NO_DISPONIBLE);
    }

    public static ReglaNegocioException cupoDiarioExcedido() {
        return new ReglaNegocioException(CodigoError.CUPO_DIARIO_EXCEDIDO);
    }
}
