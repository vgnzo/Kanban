package kanban.service;

import kanban.dto.HistoricoResponse;
import kanban.entity.HistoricoCard;
import kanban.repository.HistoricoCardRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;


@Service
public class HistoricoService {

    private final HistoricoCardRepository historicoCardRepository;


    public HistoricoService(HistoricoCardRepository historicoCardRepository){
        this.historicoCardRepository = historicoCardRepository;
    }

    public List<HistoricoResponse> listarPorCard(UUID cardId) {
        return historicoCardRepository.findByCardIdOrderByCriadoEmAsc(cardId)
            .stream()
            .map(this::toResponse)
            .toList();
    }

    private HistoricoResponse toResponse(HistoricoCard h) {
    UUID id = h.getId();
    String usuario = h.getUsuario() != null ? h.getUsuario().getNome() : "Sistema";
    String origem = h.getColunaOrigem() != null ? h.getColunaOrigem().getNome() : null;
    String destino = h.getColunaDestino() != null ? h.getColunaDestino().getNome() : null;
    String obs = h.getObservacao();
    LocalDateTime criado = h.getCriadoEm();

    return new HistoricoResponse(id, usuario, origem, destino, obs, criado);
}
}
