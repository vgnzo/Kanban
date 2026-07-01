package kanban.controller;

import kanban.dto.ColunaRequest;
import kanban.entity.Coluna;
import kanban.service.ColunaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/colunas")
public class ColunaController {

    private final ColunaService colunaService;

    public ColunaController(ColunaService colunaService){
        this.colunaService = colunaService;
    }

    @GetMapping
    public ResponseEntity<List<Coluna>> listar(){
        return ResponseEntity.ok(colunaService.listarColunas());
    }

    @GetMapping("/board/{boardId}")
    public ResponseEntity<List<Coluna>> listarPorBoard(@PathVariable UUID boardId) {
        return ResponseEntity.ok(colunaService.listarPorBoard(boardId));
    }

    @PostMapping("/board/{boardId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Coluna> adicionar(
            @PathVariable UUID boardId,
            @RequestBody @Valid ColunaRequest request) {
        return ResponseEntity.ok(colunaService.adicionarColuna(boardId, request.nome(), request.cor()));
    }

    @PatchMapping("/{colunaId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Coluna> renomear(
            @PathVariable UUID colunaId,
            @RequestBody @Valid ColunaRequest request) {
        return ResponseEntity.ok(colunaService.renomearColuna(colunaId, request.nome()));
    }
    @DeleteMapping("/{colunaId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> remover(@PathVariable UUID colunaId) {
        colunaService.removerColuna(colunaId);
        return ResponseEntity.noContent().build();
    }
}