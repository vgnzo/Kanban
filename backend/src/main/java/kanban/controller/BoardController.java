package kanban.controller;

import kanban.dto.BoardConfiguracaoRequest;
import kanban.dto.BoardRequest;
import kanban.dto.BoardResponse;
import kanban.service.BoardService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/boards")
public class BoardController {

    private final BoardService boardService;

    public BoardController(BoardService boardService){
        this.boardService = boardService;
    }

    @GetMapping
    public ResponseEntity<List<BoardResponse>> listar(@AuthenticationPrincipal String email){
        return ResponseEntity.ok(boardService.listarTodos(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BoardResponse> buscar(
            @PathVariable UUID id,
            @AuthenticationPrincipal String email){
        return ResponseEntity.ok(boardService.buscarPorId(id, email));
    }

    @PostMapping
    public ResponseEntity<BoardResponse> criar(
            @RequestBody @Valid BoardRequest request,
            @AuthenticationPrincipal String email){
        return ResponseEntity.ok(boardService.criar(request, email));
    }

    @PatchMapping("/{id}/configuracao")
public ResponseEntity<BoardResponse> atualizarConfiguracao(
        @PathVariable UUID id,
        @RequestBody BoardConfiguracaoRequest request,
        @AuthenticationPrincipal String email) {
    return ResponseEntity.ok(boardService.atualizarConfiguracao(id, request, email));
}

@DeleteMapping("/{id}")
public ResponseEntity<Void> deletar(
        @PathVariable UUID id,
        @AuthenticationPrincipal String email){
    boardService.deletar(id, email);
    return ResponseEntity.noContent().build();
}
}