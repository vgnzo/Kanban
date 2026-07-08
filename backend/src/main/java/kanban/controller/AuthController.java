package kanban.controller;

import kanban.dto.LoginRequest;
import kanban.dto.LoginResponse;
import kanban.dto.TrocarSenhaRequest;
import kanban.dto.UsuarioRequest;
import kanban.service.AuthService;
import kanban.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UsuarioService usuarioService;

    public AuthController(AuthService authService, UsuarioService usuarioService) {
        this.authService = authService;
        this.usuarioService = usuarioService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

   @PostMapping("/registrar")
    public ResponseEntity<LoginResponse> registrar(@RequestBody @Valid UsuarioRequest request) {
        return ResponseEntity.ok(authService.registrar(request));
    }

    @PatchMapping("/trocar-senha")
    public ResponseEntity<Void> trocarSenha(
        @RequestBody @Valid TrocarSenhaRequest request,
        @AuthenticationPrincipal String email) {
            authService.trocarSenha(email, request.senhaAtual(), request.senhaNova());
            return ResponseEntity.ok().build();
        }

        
    @PatchMapping("/avatar")
public ResponseEntity<Void> salvarAvatar(
    @RequestBody AvatarRequest request,
    @AuthenticationPrincipal String email) {
    authService.salvarAvatar(email, request.avatar());
    return ResponseEntity.ok().build();
}

public record AvatarRequest(String avatar) {}

    
}