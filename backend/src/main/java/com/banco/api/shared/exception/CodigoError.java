package com.banco.api.shared.exception;

import org.springframework.http.HttpStatus;

public enum CodigoError {
    SOLICITUD_INVALIDA(HttpStatus.BAD_REQUEST, "Solicitud inválida"),
    VALIDACION(HttpStatus.BAD_REQUEST, "Error de validación"),
    RECURSO_NO_ENCONTRADO(HttpStatus.NOT_FOUND, "Recurso no encontrado"),
    RECURSO_DUPLICADO(HttpStatus.CONFLICT, "Recurso duplicado"),
    OPERACION_NO_PERMITIDA(HttpStatus.CONFLICT, "Operación no permitida"),
    CONFLICTO_CONCURRENCIA(HttpStatus.CONFLICT, "Conflicto de concurrencia"),
    SALDO_NO_DISPONIBLE(HttpStatus.UNPROCESSABLE_CONTENT, "Saldo no disponible"),
    CUPO_DIARIO_EXCEDIDO(HttpStatus.UNPROCESSABLE_CONTENT, "Cupo diario Excedido"),
    CUENTA_INACTIVA(HttpStatus.UNPROCESSABLE_CONTENT, "Cuenta inactiva"),
    CLIENTE_INACTIVO(HttpStatus.UNPROCESSABLE_CONTENT, "Cliente inactivo"),
    ERROR_INTERNO(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno");

    private final HttpStatus status;
    private final String titulo;

    CodigoError(HttpStatus status, String titulo) {
        this.status = status;
        this.titulo = titulo;
    }

    public HttpStatus status() {
        return status;
    }

    public String titulo() {
        return titulo;
    }
}
