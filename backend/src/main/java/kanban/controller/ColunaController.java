package kanban.controller;

import kanban.dto.ColunaRequest;
import kanban.entity.Coluna;
import kanban.service.AcessoService;
import kanban.service.ColunaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/colunas")
public class ColunaController {

    private final ColunaService colunaService;
    private final AcessoService acessoService;

    public ColunaController(ColunaService colunaService, AcessoService acessoService){
        this.colunaService = colunaService;
        this.acessoService = acessoService;
    }

    @GetMapping
    public ResponseEntity<List<Coluna>> listar(){
        return ResponseEntity.ok(colunaService.listarColunas());
    }

    @GetMapping("/board/{boardId}")
    public ResponseEntity<List<Coluna>> listarPorBoard(@PathVariable UUID boardId) {
        return ResponseEntity.ok(colunaService.listarPorBoard(boardId));
    }

    // adicionar coluna: só quem pode editar ESTE board
    @PostMapping("/board/{boardId}")
    public ResponseEntity<Coluna> adicionar(
            @PathVariable UUID boardId,
            @RequestBody @Valid ColunaRequest request,
            @AuthenticationPrincipal String email) {
        if (!acessoService.podeEditar(email, boardId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para editar este quadro");
        }
        return ResponseEntity.ok(colunaService.adicionarColuna(boardId, request.nome(), request.cor()));
    }

    // renomear coluna: só quem pode editar o board DESTA coluna
    @PatchMapping("/{colunaId}")
    public ResponseEntity<Coluna> renomear(
            @PathVariable UUID colunaId,
            @RequestBody @Valid ColunaRequest request,
            @AuthenticationPrincipal String email) {
        if (!acessoService.podeEditarPelaColuna(email, colunaId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para editar este quadro");
        }
        return ResponseEntity.ok(colunaService.renomearColuna(colunaId, request.nome()));
    }

    // remover coluna: só quem pode editar o board DESTA coluna
    @DeleteMapping("/{colunaId}")
    public ResponseEntity<Void> remover(
            @PathVariable UUID colunaId,
            @AuthenticationPrincipal String email) {
        if (!acessoService.podeEditarPelaColuna(email, colunaId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para editar este quadro");
        }
        colunaService.removerColuna(colunaId);
        return ResponseEntity.noContent().build();
    }
}