package com.banco.api.shared.exception;

public abstract class BusinessException extends RuntimeException {

    private final CodigoError codigo;

    protected BusinessException(CodigoError codigo, String mensaje) {
        super(mensaje);
        this.codigo = codigo;
    }

    public CodigoError codigo() {
        return codigo;
    }
}
