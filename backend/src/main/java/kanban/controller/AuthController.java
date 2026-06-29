package kanban.controller;

import kanban.dto.LoginRequest;
import kanban.dto.LoginResponse;
import kanban.dto.UsuarioRequest;
import kanban.dto.UsuarioResponse;
import kanban.service.AuthService;
import kanban.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
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

    
}