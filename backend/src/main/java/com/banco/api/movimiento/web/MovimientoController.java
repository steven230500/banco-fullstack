package com.banco.api.movimiento.web;

import com.banco.api.movimiento.application.MovimientoService;
import com.banco.api.movimiento.application.dto.MovimientoFiltro;
import com.banco.api.movimiento.application.dto.MovimientoPatchRequest;
import com.banco.api.movimiento.application.dto.MovimientoRequest;
import com.banco.api.movimiento.application.dto.MovimientoResponse;
import com.banco.api.movimiento.application.dto.MovimientoUpdateRequest;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Tag(name = "Movimientos")
@RestController
@RequestMapping("/api/movimientos")
public class MovimientoController {

    private final MovimientoService movimientoService;

    public MovimientoController(MovimientoService movimientoService) {
        this.movimientoService = movimientoService;
    }

    @GetMapping
    public List<MovimientoResponse> listar(
            @RequestParam Optional<String> numeroCuenta,
            @RequestParam Optional<String> clienteId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Optional<LocalDate> fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Optional<LocalDate> fechaFin) {
        return movimientoService.listar(new MovimientoFiltro(numeroCuenta, clienteId, fechaInicio, fechaFin));
    }

    @GetMapping("/{id}")
    public MovimientoResponse obtener(@PathVariable Long id) {
        return movimientoService.obtener(id);
    }

    @PostMapping
    public ResponseEntity<MovimientoResponse> registrar(@Valid @RequestBody MovimientoRequest request) {
        MovimientoResponse creado = movimientoService.registrar(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(creado.id()).toUri();
        return ResponseEntity.created(location).body(creado);
    }

    @PutMapping("/{id}")
    public MovimientoResponse actualizar(@PathVariable Long id, @Valid @RequestBody MovimientoUpdateRequest request) {
        return movimientoService.actualizar(id, request);
    }

    @PatchMapping("/{id}")
    public MovimientoResponse actualizarParcial(@PathVariable Long id,
                                                @Valid @RequestBody MovimientoPatchRequest request) {
        return movimientoService.actualizarParcial(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        movimientoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
