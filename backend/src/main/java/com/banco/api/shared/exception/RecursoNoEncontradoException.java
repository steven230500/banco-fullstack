package com.banco.api.shared.exception;

public class RecursoNoEncontradoException extends BusinessException {

    public RecursoNoEncontradoException(String recurso, Object identificador) {
        super(CodigoError.RECURSO_NO_ENCONTRADO, "%s '%s' no existe".formatted(recurso, identificador));
    }
}
