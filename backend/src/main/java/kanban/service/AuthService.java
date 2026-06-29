package kanban.service;

import kanban.dto.LoginRequest;
import kanban.dto.LoginResponse;
import kanban.dto.UsuarioRequest;
import kanban.entity.Usuario;
import kanban.repository.UsuarioRepository;
import kanban.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UsuarioRepository usuarioRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (!passwordEncoder.matches(request.senha(), usuario.getSenhaHash())) {
            throw new RuntimeException("Senha incorreta");
        }

        String token = jwtUtil.gerarToken(usuario.getEmail(), usuario.getPerfil().name());

        return new LoginResponse(
                token,
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil().name()
        );
    }

    public LoginResponse registrar(UsuarioRequest request) {
        if (usuarioRepository.findByEmail(request.email()).isPresent()) {
            throw new RuntimeException("Email já cadastrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(request.nome());
        usuario.setEmail(request.email());
        usuario.setSenhaHash(passwordEncoder.encode(request.senha()));
        usuario.setPerfil(Usuario.Perfil.USER);

        Usuario salvo = usuarioRepository.save(usuario);

        String token = jwtUtil.gerarToken(salvo.getEmail(), salvo.getPerfil().name());

        return new LoginResponse(
                token,
                salvo.getNome(),
                salvo.getEmail(),
                salvo.getPerfil().name()
        );
    }
}