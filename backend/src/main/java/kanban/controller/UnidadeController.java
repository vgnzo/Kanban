package kanban.controller;

import kanban.dto.UnidadeRequest;
import kanban.dto.UnidadeResponse;
import kanban.entity.Unidade;
import kanban.repository.UnidadeRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/unidades")
public class UnidadeController {

    private final UnidadeRepository unidadeRepository;

    public UnidadeController(UnidadeRepository unidadeRepository) {
        this.unidadeRepository = unidadeRepository;
    }

    @GetMapping
    public ResponseEntity<List<UnidadeResponse>> listar() {
        return ResponseEntity.ok(
            unidadeRepository.findAll().stream()
                .map(u -> new UnidadeResponse(
                    u.getId(),
                    u.getNome(),
                    u.getCidade(),
                    u.getEstado()
                ))
                .toList()
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UnidadeResponse> criar(@RequestBody @Valid UnidadeRequest request) {
        Unidade unidade = new Unidade();
        unidade.setNome(request.nome());
        unidade.setCidade(request.cidade());
        unidade.setEstado(request.estado());

        Unidade salva = unidadeRepository.save(unidade);

        return ResponseEntity.ok(new UnidadeResponse(
            salva.getId(),
            salva.getNome(),
            salva.getCidade(),
            salva.getEstado()
        ));
    }
}