package kanban.controller;

import kanban.dto.UsuarioRequest;
import kanban.dto.UsuarioResponse;
import kanban.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/usuarios")

public class UsuarioController {
    

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService ususarioService){
        this.usuarioService = ususarioService;
    }

    @PostMapping("/{id}/promover")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponse> promover(@PathVariable UUID id) {
        return ResponseEntity.ok(usuarioService.promoverAdmin(id));

    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponse> criar(@RequestBody @Valid UsuarioRequest request) {
        return ResponseEntity.ok(usuarioService.criar(request));
    }


    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UsuarioResponse>> listar() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }
}
