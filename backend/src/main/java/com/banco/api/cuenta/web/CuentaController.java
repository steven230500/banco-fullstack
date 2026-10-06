package com.banco.api.cuenta.web;

import com.banco.api.cuenta.application.CuentaService;
import com.banco.api.cuenta.application.dto.CuentaCreateRequest;
import com.banco.api.cuenta.application.dto.CuentaPatchRequest;
import com.banco.api.cuenta.application.dto.CuentaResponse;
import com.banco.api.cuenta.application.dto.CuentaUpdateRequest;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.Optional;
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

@Tag(name = "Cuentas")
@RestController
@RequestMapping("/api/cuentas")
public class CuentaController {

    private final CuentaService cuentaService;

    public CuentaController(CuentaService cuentaService) {
        this.cuentaService = cuentaService;
    }

    @GetMapping
    public List<CuentaResponse> listar(@RequestParam Optional<String> clienteId) {
        return cuentaService.listar(clienteId);
    }

    @GetMapping("/{numeroCuenta}")
    public CuentaResponse obtener(@PathVariable String numeroCuenta) {
        return cuentaService.obtener(numeroCuenta);
    }

    @PostMapping
    public ResponseEntity<CuentaResponse> crear(@Valid @RequestBody CuentaCreateRequest request) {
        CuentaResponse creada = cuentaService.crear(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{numeroCuenta}").buildAndExpand(creada.numeroCuenta()).toUri();
        return ResponseEntity.created(location).body(creada);
    }

    @PutMapping("/{numeroCuenta}")
    public CuentaResponse actualizar(@PathVariable String numeroCuenta,
                                     @Valid @RequestBody CuentaUpdateRequest request) {
        return cuentaService.actualizar(numeroCuenta, request);
    }

    @PatchMapping("/{numeroCuenta}")
    public CuentaResponse actualizarParcial(@PathVariable String numeroCuenta,
                                            @Valid @RequestBody CuentaPatchRequest request) {
        return cuentaService.actualizarParcial(numeroCuenta, request);
    }

    @DeleteMapping("/{numeroCuenta}")
    public ResponseEntity<Void> eliminar(@PathVariable String numeroCuenta) {
        cuentaService.eliminar(numeroCuenta);
        return ResponseEntity.noContent().build();
    }
}
