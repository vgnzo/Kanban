package kanban.controller;

import kanban.dto.BoardRequest;
import kanban.dto.BoardResponse;
import kanban.service.BoardService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
        public ResponseEntity<List<BoardResponse>> listar(){
            return ResponseEntity.ok(boardService.listarTodos());
        }

        @GetMapping("/{id}")
        public ResponseEntity<BoardResponse> buscar(@PathVariable UUID id){
            return ResponseEntity.ok(boardService.buscarPorId(id));
        }


        @PostMapping
        @PreAuthorize("hasRole ('ADMIN')")
        public ResponseEntity<BoardResponse> criar(@RequestBody @Valid BoardRequest request){
            return ResponseEntity.ok(boardService.criar(request));
        }

        @DeleteMapping("/{id}")
        @PreAuthorize("hasRole ('ADMIN')")
        public ResponseEntity<Void> deletar(@PathVariable UUID id){
            boardService.deletar(id);
            return ResponseEntity.noContent().build();
        }
    }

