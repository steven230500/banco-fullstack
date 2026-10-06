package com.banco.api.shared.exception;

public class OperacionNoPermitidaException extends BusinessException {

    public OperacionNoPermitidaException(String mensaje) {
        super(CodigoError.OPERACION_NO_PERMITIDA, mensaje);
    }
}
