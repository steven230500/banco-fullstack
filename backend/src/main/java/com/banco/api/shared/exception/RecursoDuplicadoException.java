package com.banco.api.shared.exception;

public class RecursoDuplicadoException extends BusinessException {

    public RecursoDuplicadoException(String mensaje) {
        super(CodigoError.RECURSO_DUPLICADO, mensaje);
    }
}
