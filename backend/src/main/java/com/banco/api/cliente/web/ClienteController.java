package com.banco.api.cliente.web;

import com.banco.api.cliente.application.ClienteService;
import com.banco.api.cliente.application.dto.ClienteCreateRequest;
import com.banco.api.cliente.application.dto.ClientePatchRequest;
import com.banco.api.cliente.application.dto.ClienteResponse;
import com.banco.api.cliente.application.dto.ClienteUpdateRequest;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Tag(name = "Clientes")
@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping
    public List<ClienteResponse> listar() {
        return clienteService.listar();
    }

    @GetMapping("/{clienteId}")
    public ClienteResponse obtener(@PathVariable String clienteId) {
        return clienteService.obtener(clienteId);
    }

    @PostMapping
    public ResponseEntity<ClienteResponse> crear(@Valid @RequestBody ClienteCreateRequest request) {
        ClienteResponse creado = clienteService.crear(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{clienteId}").buildAndExpand(creado.clienteId()).toUri();
        return ResponseEntity.created(location).body(creado);
    }

    @PutMapping("/{clienteId}")
    public ClienteResponse actualizar(@PathVariable String clienteId,
                                      @Valid @RequestBody ClienteUpdateRequest request) {
        return clienteService.actualizar(clienteId, request);
    }

    @PatchMapping("/{clienteId}")
    public ClienteResponse actualizarParcial(@PathVariable String clienteId,
                                             @Valid @RequestBody ClientePatchRequest request) {
        return clienteService.actualizarParcial(clienteId, request);
    }

    @DeleteMapping("/{clienteId}")
    public ResponseEntity<Void> eliminar(@PathVariable String clienteId) {
        clienteService.eliminar(clienteId);
        return ResponseEntity.noContent().build();
    }
}
