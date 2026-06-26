package kanban.controller;



import kanban.dto.CardRequest;
import kanban.dto.CardResponse;
import kanban.service.CardService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
}
