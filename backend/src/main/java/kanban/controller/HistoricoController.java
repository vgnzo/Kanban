package kanban.controller;

import kanban.dto.HistoricoResponse;
import kanban.service.HistoricoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/historico")
public class HistoricoController {

    private final HistoricoService historicoService;

    public HistoricoController(HistoricoService historicoService) {
        this.historicoService = historicoService;
    }

    @GetMapping("/card/{cardId}")
    public ResponseEntity<List<HistoricoResponse>> listarPorCard(@PathVariable UUID cardId) {
        return ResponseEntity.ok(historicoService.listarPorCard(cardId));
    }
}