package kanban.controller;

import kanban.dto.EquipamentoResponse;
import kanban.repository.EquipamentoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipamentos")
public class EquipamentoController {

    private final EquipamentoRepository equipamentoRepository;

    public EquipamentoController(EquipamentoRepository equipamentoRepository) {
        this.equipamentoRepository = equipamentoRepository;
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
}