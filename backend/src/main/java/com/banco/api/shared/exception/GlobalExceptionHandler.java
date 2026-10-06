package com.banco.api.shared.exception;

import com.banco.api.shared.web.RequestIdFilter;
import jakarta.validation.ConstraintViolationException;
import java.net.URI;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import org.jspecify.annotations.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final String TYPE_BASE = "https://banco.local/errores/";

    @ExceptionHandler(BusinessException.class)
    ProblemDetail handleBusiness(BusinessException ex) {
        log.info("Regla de negocio: {} - {}", ex.codigo(), ex.getMessage());
        return problema(ex.codigo(), ex.getMessage(), List.of());
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ProblemDetail handleConstraintViolation(ConstraintViolationException ex) {
        List<ErrorCampo> errores = ex.getConstraintViolations().stream()
                .map(v -> new ErrorCampo(v.getPropertyPath().toString(), v.getMessage()))
                .sorted(Comparator.comparing(ErrorCampo::campo))
                .toList();
        return problema(CodigoError.VALIDACION, "Uno o más campos son inválidos", errores);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    ProblemDetail handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return problema(CodigoError.SOLICITUD_INVALIDA,
                "El parámetro '%s' tiene un formato inválido".formatted(ex.getName()), List.of());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ProblemDetail handleDataIntegrity(DataIntegrityViolationException ex) {
        log.warn("Violación de integridad de datos", ex);
        return problema(CodigoError.RECURSO_DUPLICADO,
                "La operación viola una restricción de integridad de datos", List.of());
    }

    @ExceptionHandler(OptimisticLockingFailureException.class)
    ProblemDetail handleOptimisticLock(OptimisticLockingFailureException ex) {
        return problema(CodigoError.CONFLICTO_CONCURRENCIA,
                "El registro fue modificado por otra operación, intente nuevamente", List.of());
    }

    @ExceptionHandler(Exception.class)
    ProblemDetail handleUnexpected(Exception ex) {
        log.error("Error no controlado", ex);
        return problema(CodigoError.ERROR_INTERNO, "Ocurrió un error inesperado", List.of());
    }

    @Override
    protected @Nullable ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        List<ErrorCampo> errores = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> new ErrorCampo(error.getField(), error.getDefaultMessage()))
                .sorted(Comparator.comparing(ErrorCampo::campo))
                .toList();
        return respuesta(problema(CodigoError.VALIDACION, "Uno o más campos son inválidos", errores));
    }

    @Override
    protected @Nullable ResponseEntity<Object> handleHandlerMethodValidationException(
            HandlerMethodValidationException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        List<ErrorCampo> errores = ex.getParameterValidationResults().stream()
                .flatMap(resultado -> resultado.getResolvableErrors().stream()
                        .map(error -> new ErrorCampo(resultado.getMethodParameter().getParameterName(),
                                error.getDefaultMessage())))
                .toList();
        return respuesta(problema(CodigoError.VALIDACION, "Uno o más parámetros son inválidos", errores));
    }

    @Override
    protected @Nullable ResponseEntity<Object> handleHttpMessageNotReadable(
            HttpMessageNotReadableException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        return respuesta(problema(CodigoError.SOLICITUD_INVALIDA,
                "El cuerpo de la petición es inválido o tiene un formato incorrecto", List.of()));
    }

    @Override
    protected ResponseEntity<Object> createResponseEntity(
            @Nullable Object body, HttpHeaders headers, HttpStatusCode statusCode, WebRequest request) {
        if (body instanceof ProblemDetail detail && detail.getProperties() == null) {
            CodigoError codigo = statusCode.value() == 404 ? CodigoError.RECURSO_NO_ENCONTRADO
                    : statusCode.is4xxClientError() ? CodigoError.SOLICITUD_INVALIDA
                    : CodigoError.ERROR_INTERNO;
            detail.setProperty("codigo", codigo.name());
            if (statusCode.value() == 404) {
                detail.setDetail("La ruta solicitada no existe");
            }
            completar(detail);
        }
        return super.createResponseEntity(body, headers, statusCode, request);
    }

    private static ResponseEntity<Object> respuesta(ProblemDetail detail) {
        return ResponseEntity.status(detail.getStatus()).body(detail);
    }

    private static ProblemDetail problema(CodigoError codigo, String detalle, List<ErrorCampo> errores) {
        ProblemDetail detail = ProblemDetail.forStatusAndDetail(codigo.status(), detalle);
        detail.setTitle(codigo.titulo());
        detail.setType(URI.create(TYPE_BASE + codigo.name().toLowerCase().replace('_', '-')));
        detail.setProperty("codigo", codigo.name());
        if (!errores.isEmpty()) {
            detail.setProperty("errores", errores);
        }
        return completar(detail);
    }

    private static ProblemDetail completar(ProblemDetail detail) {
        detail.setProperty("timestamp", Instant.now());
        String requestId = MDC.get(RequestIdFilter.MDC_KEY);
        if (requestId != null) {
            detail.setProperty("requestId", requestId);
        }
        return detail;
    }
}
