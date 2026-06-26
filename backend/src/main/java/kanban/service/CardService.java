package kanban.service;

import kanban.dto.CardRequest;
import kanban.dto.CardResponse;
import kanban.entity.Card;
import kanban.entity.Coluna;
import kanban.entity.Equipamento;
import kanban.entity.HistoricoCard;
import kanban.entity.Usuario;
import kanban.repository.CardRepository;
import kanban.repository.ColunaRepository;
import kanban.repository.EquipamentoRepository;
import kanban.repository.HistoricoCardRepository;
import kanban.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CardService {

    private final CardRepository cardRepository;
    private final ColunaRepository colunaRepository;
    private final EquipamentoRepository equipamentoRepository;
    private final UsuarioRepository usuarioRepository;
    private final HistoricoCardRepository historicoCardRepository;

    public CardService(CardRepository cardRepository,
                       ColunaRepository colunaRepository,
                       EquipamentoRepository equipamentoRepository,
                       UsuarioRepository usuarioRepository,
                       HistoricoCardRepository historicoCardRepository) {
        this.cardRepository = cardRepository;
        this.colunaRepository = colunaRepository;
        this.equipamentoRepository = equipamentoRepository;
        this.usuarioRepository = usuarioRepository;
        this.historicoCardRepository = historicoCardRepository;
    }

   public List<CardResponse> listarTodos() {
    return cardRepository.findByArquivadoEmIsNull().stream()
            .map(this::toResponse)
            .toList();
}

    public List<CardResponse> listarPorColuna(UUID colunaId) {
        return cardRepository.findByColunaId(colunaId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CardResponse criar(CardRequest request, String emailUsuario) {
        Equipamento equipamento = equipamentoRepository.findById(request.equipamentoId())
                .orElseThrow(() -> new RuntimeException("Equipamento não encontrado"));

        Coluna coluna = colunaRepository.findById(request.colunaId())
                .orElseThrow(() -> new RuntimeException("Coluna não encontrada"));

        Card card = new Card();
        card.setEquipamento(equipamento);
        card.setColuna(coluna);
        card.setTitulo(request.titulo());
        card.setDescricao(request.descricao());
        card.setPrevisaoLiberacao(request.previsaoLiberacao());

        if (request.reservaId() != null) {
            equipamentoRepository.findById(request.reservaId())
                    .ifPresent(card::setReserva);
        }

        if (request.responsavelId() != null) {
            usuarioRepository.findById(request.responsavelId())
                    .ifPresent(card::setResponsavel);
        }

        Card salvo = cardRepository.save(card);

        registrarHistorico(salvo, null, coluna, emailUsuario, "Card criado");

        return toResponse(salvo);
    }

    @Transactional
    public CardResponse moverCard(UUID cardId, UUID novaColunaId, String emailUsuario) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card não encontrado"));

        Coluna colunaOrigem = card.getColuna();
        Coluna colunaDestino = colunaRepository.findById(novaColunaId)
                .orElseThrow(() -> new RuntimeException("Coluna não encontrada"));

        card.setColuna(colunaDestino);
        card.setAtualizadoEm(LocalDateTime.now());

        Card salvo = cardRepository.save(card);

        registrarHistorico(salvo, colunaOrigem, colunaDestino, emailUsuario,
                "Movido de " + colunaOrigem.getNome() + " para " + colunaDestino.getNome());

        return toResponse(salvo);
    }

    private void registrarHistorico(Card card, Coluna origem, Coluna destino,
                                     String emailUsuario, String observacao) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario).orElse(null);

        HistoricoCard historico = new HistoricoCard();
        historico.setCard(card);
        historico.setUsuario(usuario);
        historico.setColunaOrigem(origem);
        historico.setColunaDestino(destino);
        historico.setObservacao(observacao);

        historicoCardRepository.save(historico);
    }

    private CardResponse toResponse(Card card) {
        return new CardResponse(
                card.getId(),
                card.getTitulo(),
                card.getDescricao(),
                card.getEquipamento().getFrota(),
                card.getEquipamento().getModelo(),
                card.getEquipamento().getUnidade().getNome(),
                card.getReserva() != null ? card.getReserva().getFrota() : null,
                card.getColuna().getId(),
                card.getColuna().getNome(),
                card.getColuna().getCor(),
                card.getResponsavel() != null ? card.getResponsavel().getId() : null,
                card.getResponsavel() != null ? card.getResponsavel().getNome() : null,
                card.getPrevisaoLiberacao(),
                card.getCriadoEm(),
                card.getAtualizadoEm()
        );
    }

    @Transactional
public CardResponse arquivar(UUID cardId, String emailUsuario) {
    Card card = cardRepository.findById(cardId)
            .orElseThrow(() -> new RuntimeException("Card não encontrado"));

    card.setArquivadoEm(LocalDateTime.now());

    Card salvo = cardRepository.save(card);

    registrarHistorico(salvo, card.getColuna(), card.getColuna(), emailUsuario, "Card arquivado");

    return toResponse(salvo);
}

public List<CardResponse> listarArquivados() {
    return cardRepository.findByArquivadoEmIsNotNull().stream()
            .map(this::toResponse)
            .toList();
}
}