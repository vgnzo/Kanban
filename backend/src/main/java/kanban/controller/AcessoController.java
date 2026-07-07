package kanban.controller;

import kanban.dto.AprovarAcessoRequest;
import kanban.dto.SolicitacaoResponse;
import kanban.dto.SolicitarAcessoRequest;
import kanban.service.AcessoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/acesso")
public class AcessoController {

    private final AcessoService acessoService;

    public AcessoController(AcessoService acessoService) {
        this.acessoService = acessoService;
    }

    // USER solicita acesso a um quadro
    @PostMapping("/solicitar")
    public ResponseEntity<Void> solicitar(
            @RequestBody @Valid SolicitarAcessoRequest request,
            @AuthenticationPrincipal String email) {
        acessoService.solicitarAcesso(email, request.boardId(), request.nomeSolicitante(), request.setor());
        return ResponseEntity.ok().build();
    }

    // Só o DONO do quadro lista as solicitações pendentes dele
    @GetMapping("/pendentes/{boardId}")
    public ResponseEntity<List<SolicitacaoResponse>> pendentes(
            @PathVariable UUID boardId,
            @AuthenticationPrincipal String email) {
        if (!acessoService.souDonoDoBoard(email, boardId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas o dono do quadro pode ver as solicitações");
        }
        return ResponseEntity.ok(acessoService.listarPendentes(boardId));
    }

    // Só o DONO do quadro aprova uma solicitação (definindo o nível)
    @PatchMapping("/aprovar/{solicitacaoId}")
    public ResponseEntity<Void> aprovar(
            @PathVariable UUID solicitacaoId,
            @RequestBody AprovarAcessoRequest request,
            @AuthenticationPrincipal String email) {
        if (!acessoService.souDonoPelaSolicitacao(email, solicitacaoId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas o dono do quadro pode aprovar solicitações");
        }
        acessoService.aprovarSolicitacao(solicitacaoId, request.nivel());
        return ResponseEntity.ok().build();
    }

    // Só o DONO do quadro recusa uma solicitação
    @PatchMapping("/recusar/{solicitacaoId}")
    public ResponseEntity<Void> recusar(
            @PathVariable UUID solicitacaoId,
            @AuthenticationPrincipal String email) {
        if (!acessoService.souDonoPelaSolicitacao(email, solicitacaoId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas o dono do quadro pode recusar solicitações");
        }
        acessoService.recusarSolicitacao(solicitacaoId);
        return ResponseEntity.ok().build();
    }
}