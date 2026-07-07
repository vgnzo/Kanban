package kanban.service;

import kanban.dto.UsuarioRequest;
import kanban.dto.UsuarioResponse;
import kanban.dto.UsuarioSimplesResponse;
import kanban.entity.Usuario;
import kanban.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UsuarioResponse criar(UsuarioRequest request) {
        if (usuarioRepository.findByEmail(request.email()).isPresent()) {
            throw new RuntimeException("Email já cadastrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNome(request.nome());
        usuario.setEmail(request.email());
        usuario.setSenhaHash(passwordEncoder.encode(request.senha()));
        usuario.setPerfil(Usuario.Perfil.USER);

        return toResponse(usuarioRepository.save(usuario));
    }

    public List<UsuarioSimplesResponse> listarSimples() {
    return usuarioRepository.findAll().stream()
            .map(u -> new UsuarioSimplesResponse(u.getId(), u.getNome()))
            .toList();
}

    public UsuarioResponse promoverAdmin(UUID id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        usuario.setPerfil(Usuario.Perfil.ADMIN);
        return toResponse(usuarioRepository.save(usuario));
    }

    public List<UsuarioResponse> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    private UsuarioResponse toResponse(Usuario u) {
        return new UsuarioResponse(u.getId(), u.getNome(), u.getEmail(), u.getPerfil().name());
    }

    public UsuarioResponse alterarPerfil(UUID id, Usuario.Perfil novoPerfil) {
    Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

    usuario.setPerfil(novoPerfil);
    return toResponse(usuarioRepository.save(usuario));
}
}