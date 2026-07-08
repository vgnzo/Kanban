package kanban.controller;

import kanban.dto.TrocarSenhaRequest;
import kanban.dto.UsuarioRequest;
import kanban.dto.UsuarioResponse;
import kanban.dto.UsuarioSimplesResponse;
import kanban.entity.Usuario;
import kanban.service.AuthService;
import kanban.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final AuthService authService;

    public UsuarioController(UsuarioService usuarioService, AuthService authService) {
        this.usuarioService = usuarioService;
        this.authService = authService;
    }

    @PatchMapping("/{id}/perfil")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponse> alterarPerfil(
            @PathVariable UUID id,
            @RequestBody AlterarPerfilRequest body) {
        return ResponseEntity.ok(usuarioService.alterarPerfil(id, body.perfil()));
    }

    public record AlterarPerfilRequest(Usuario.Perfil perfil) {}

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponse> criar(@RequestBody @Valid UsuarioRequest request) {
        return ResponseEntity.ok(usuarioService.criar(request));
    }

    @GetMapping("/lista-simples")
    public ResponseEntity<List<UsuarioSimplesResponse>> listarSimples() {
        return ResponseEntity.ok(usuarioService.listarSimples());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UsuarioResponse>> listar() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @PatchMapping("/trocar-senha")
    public ResponseEntity<Void> trocarSenha(
            @RequestBody @Valid TrocarSenhaRequest request,
            @AuthenticationPrincipal String email) {
        authService.trocarSenha(email, request.senhaAtual(), request.senhaNova());
        return ResponseEntity.ok().build();
    }
}