package com.banco.api.shared.exception;

public class SolicitudInvalidaException extends BusinessException {

    public SolicitudInvalidaException(String mensaje) {
        super(CodigoError.SOLICITUD_INVALIDA, mensaje);
    }
}
