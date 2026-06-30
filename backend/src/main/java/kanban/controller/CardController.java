package kanban.controller;



import kanban.dto.CardGenericoRequest;
import kanban.dto.CardGenericoUpdateRequest;
import kanban.dto.CardRequest;
import kanban.dto.CardResponse;
import kanban.dto.CardUpdateRequest;
import kanban.service.CardService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import kanban.dto.CardUpdateRequest;
import kanban.dto.CardGenericoUpdateRequest;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/cards")    
public class CardController {

private final CardService cardService;

public CardController(CardService cardService) {
    this.cardService = cardService;
}


@GetMapping
public ResponseEntity<List<CardResponse>> listarTodos(){
    return ResponseEntity.ok(cardService.listarTodos());
}

@GetMapping("/coluna/{colunaId}")
public ResponseEntity<List<CardResponse>> listarPorColuna(@PathVariable UUID colunaId) {
    return ResponseEntity.ok(cardService.listarPorColuna(colunaId));

}


@PostMapping
public ResponseEntity<CardResponse> criar(
    @RequestBody @Valid CardRequest request,
    @AuthenticationPrincipal String email){
        return ResponseEntity.ok(cardService.criar(request, email));
    }

    @PatchMapping("/{cardId}/mover/{colunaId}")
    public ResponseEntity<CardResponse> mover(
        @PathVariable UUID cardId,
        @PathVariable UUID colunaId,
        @AuthenticationPrincipal String email) {
            return ResponseEntity.ok(cardService.moverCard(cardId, colunaId, email));
        }
    
        @PatchMapping("/{cardId}/arquivar")
    public ResponseEntity<CardResponse> arquivar(
        @PathVariable UUID cardId,
        @AuthenticationPrincipal String email) {
            return ResponseEntity.ok(cardService.arquivar(cardId, email));
        }

    @GetMapping("/arquivados")
    public ResponseEntity<List<CardResponse>> listarArquivados() {
        return ResponseEntity.ok(cardService.listarArquivados());
    }

    @PutMapping("/generico/{cardId}")
    public ResponseEntity<CardResponse> editarGenerico(
        @PathVariable UUID cardId,
        @RequestBody @Valid CardGenericoUpdateRequest request,
        @AuthenticationPrincipal String email) {
            return ResponseEntity.ok(cardService.editarGenerico(cardId, request, email));
    }

    @PutMapping("/{cardId}")
    public ResponseEntity<CardResponse> editar(
        @PathVariable UUID cardId,
        @RequestBody @Valid CardUpdateRequest request,
        @AuthenticationPrincipal String email) {
            return ResponseEntity.ok(cardService.editar(cardId, request, email));
        }


        @GetMapping("/board/{boardId}")
    public ResponseEntity<List<CardResponse>> listarPorBoard(@PathVariable UUID boardId) {
        return ResponseEntity.ok(cardService.listarPorBoard(boardId));
    }

    @PostMapping("/generico")
    public ResponseEntity<CardResponse> criarGenerico(
        @RequestBody @Valid CardGenericoRequest request,
        @AuthenticationPrincipal String email) {
            return ResponseEntity.ok(cardService.criarGenerico(request, email));
    }
}
