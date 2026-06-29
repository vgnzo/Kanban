package kanban.controller;

import kanban.dto.EquipamentoRequest;
import kanban.dto.EquipamentoResponse;
import kanban.entity.Equipamento;
import kanban.entity.Unidade;
import kanban.repository.EquipamentoRepository;
import kanban.repository.UnidadeRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipamentos")
public class EquipamentoController {

    private final EquipamentoRepository equipamentoRepository;
    private final UnidadeRepository unidadeRepository;

    public EquipamentoController(EquipamentoRepository equipamentoRepository,
                                 UnidadeRepository unidadeRepository) {
        this.equipamentoRepository = equipamentoRepository;
        this.unidadeRepository = unidadeRepository;
    }

    @GetMapping
    public ResponseEntity<List<EquipamentoResponse>> listar() {
        return ResponseEntity.ok(
            equipamentoRepository.findAll().stream()
                .map(e -> new EquipamentoResponse(
                    e.getId(),
                    e.getFrota(),
                    e.getModelo(),
                    e.getMarca(),
                    e.getHorimetro(),
                    e.getUnidade().getNome()
                ))
                .toList()
        );
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EquipamentoResponse> criar(@RequestBody @Valid EquipamentoRequest request) {
        Unidade unidade = unidadeRepository.findById(request.unidadeId())
            .orElseThrow(() -> new RuntimeException("Unidade não encontrada"));

        Equipamento equipamento = new Equipamento();
        equipamento.setFrota(request.frota());
        equipamento.setModelo(request.modelo());
        equipamento.setMarca(request.marca());
        equipamento.setHorimetro(request.horimetro());
        equipamento.setUnidade(unidade);

        Equipamento salvo = equipamentoRepository.save(equipamento);

        return ResponseEntity.ok(new EquipamentoResponse(
            salvo.getId(),
            salvo.getFrota(),
            salvo.getModelo(),
            salvo.getMarca(),
            salvo.getHorimetro(),
            salvo.getUnidade().getNome()
        ));
    }
}