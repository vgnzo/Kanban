package kanban.service;

import kanban.dto.CardGenericoRequest;
import kanban.dto.CardGenericoUpdateRequest;
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
import org.springframework.web.server.ResponseStatusException;

import kanban.dto.CardUpdateRequest;
import kanban.dto.CardGenericoRequest;
import java.time.LocalDateTime;
import java.util.List;
import kanban.dto.CardGenericoUpdateRequest;
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
        Equipamento eq = card.getEquipamento();
        return new CardResponse(
                card.getId(),
                card.getTitulo(),
                card.getDescricao(),
                eq != null ? eq.getFrota() : null,
                eq != null ? eq.getModelo() : null,
                eq != null && eq.getUnidade() != null ? eq.getUnidade().getNome() : null,
                card.getReserva() != null ? card.getReserva().getFrota() : null,
                card.getColuna().getId(),
                card.getColuna().getNome(),
                card.getColuna().getCor(),
                card.getResponsavel() != null ? card.getResponsavel().getId() : null,
                card.getResponsavel() != null ? card.getResponsavel().getNome() : null,
                card.getPrevisaoLiberacao(),
                card.getCriadoEm(),
                card.getAtualizadoEm(),
                card.getValorExtra1(),
                card.getValorExtra2(),
                card.getValorExtra3()
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

    @Transactional
public CardResponse desarquivar(UUID cardId, String emailUsuario) {
    Card card = cardRepository.findById(cardId)
            .orElseThrow(() -> new RuntimeException("Card não encontrado"));

    card.setArquivadoEm(null);   // 👈 null, pra DESarquivar

    Card salvo = cardRepository.save(card);
    registrarHistorico(salvo, card.getColuna(), card.getColuna(), emailUsuario, "Card desarquivado");
    return toResponse(salvo);
}

public List<CardResponse> listarArquivados() {
    return cardRepository.findByArquivadoEmIsNotNull().stream()
            .map(this::toResponse)
            .toList();
}

public List<CardResponse> listarArquivadosPorBoard(UUID boardId) {
    return cardRepository.findByColunaBoardIdAndArquivadoEmIsNotNull(boardId).stream()
            .map(this::toResponse)
            .toList();
}

@Transactional
public CardResponse editar(UUID cardId, CardUpdateRequest request, String emailUsuario) {
    Card card = cardRepository.findById(cardId)
            .orElseThrow(() -> new RuntimeException("Card não encontrado"));

    // ----- TÍTULO -----
    if (!java.util.Objects.equals(card.getTitulo(), request.titulo())) {
        registrarHistorico(card, null, null, emailUsuario,
                "Título: \"" + card.getTitulo() + "\" → \"" + request.titulo() + "\"");
        card.setTitulo(request.titulo());
    }

    // ----- DESCRIÇÃO -----
    if (!java.util.Objects.equals(card.getDescricao(), request.descricao())) {
        registrarHistorico(card, null, null, emailUsuario, "Descrição atualizada");
        card.setDescricao(request.descricao());
    }

    // ----- PREVISÃO DE LIBERAÇÃO -----
    if (!java.util.Objects.equals(card.getPrevisaoLiberacao(), request.previsaoLiberacao())) {
        registrarHistorico(card, null, null, emailUsuario,
                "Previsão de liberação: " + card.getPrevisaoLiberacao() + " → " + request.previsaoLiberacao());
        card.setPrevisaoLiberacao(request.previsaoLiberacao());
    }

    // ----- RESPONSÁVEL -----
    UUID respAtualId = card.getResponsavel() != null ? card.getResponsavel().getId() : null;
    if (!java.util.Objects.equals(respAtualId, request.responsavelId())) {
        String nomeAntigo = card.getResponsavel() != null ? card.getResponsavel().getNome() : "ninguém";
        Usuario novoResp = request.responsavelId() != null
                ? usuarioRepository.findById(request.responsavelId()).orElse(null)
                : null;
        String nomeNovo = novoResp != null ? novoResp.getNome() : "ninguém";
        registrarHistorico(card, null, null, emailUsuario,
                "Responsável: " + nomeAntigo + " → " + nomeNovo);
        card.setResponsavel(novoResp);
    }

    // ----- FROTA RESERVA -----
    UUID reservaAtualId = card.getReserva() != null ? card.getReserva().getId() : null;
    if (!java.util.Objects.equals(reservaAtualId, request.reservaId())) {
        String reservaAntiga = card.getReserva() != null ? card.getReserva().getFrota() : "nenhuma";
        Equipamento novaReserva = request.reservaId() != null
                ? equipamentoRepository.findById(request.reservaId()).orElse(null)
                : null;
        String reservaNova = novaReserva != null ? novaReserva.getFrota() : "nenhuma";
        registrarHistorico(card, null, null, emailUsuario,
                "Frota reserva: " + reservaAntiga + " → " + reservaNova);
        card.setReserva(novaReserva);
    }

    card.setAtualizadoEm(LocalDateTime.now());
    Card salvo = cardRepository.save(card);

    return toResponse(salvo);
}

public List<CardResponse> listarPorBoard(UUID boardId) {
        return cardRepository.findByColunaBoardIdAndArquivadoEmIsNull(boardId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
public CardResponse criarGenerico(CardGenericoRequest request, String emailUsuario) {
    Coluna coluna = colunaRepository.findById(request.colunaId())
            .orElseThrow(() -> new RuntimeException("Coluna não encontrada"));

    Card card = new Card();
    // SEM equipamento — esse é o ponto que diferencia do criar normal
    card.setColuna(coluna);
    card.setTitulo(request.titulo());
    card.setDescricao(request.descricao());
    card.setValorExtra1(request.valorExtra1());
    card.setValorExtra2(request.valorExtra2());
    card.setValorExtra3(request.valorExtra3());

    if (request.responsavelId() != null) {
        usuarioRepository.findById(request.responsavelId())
                .ifPresent(card::setResponsavel);
    }

    Card salvo = cardRepository.save(card);

    registrarHistorico(salvo, null, coluna, emailUsuario, "Card criado");

    return toResponse(salvo);
}

@Transactional
public CardResponse editarGenerico(UUID cardId, CardGenericoUpdateRequest request, String emailUsuario) {
    Card card = cardRepository.findById(cardId)
            .orElseThrow(() -> new RuntimeException("Card não encontrado"));

    // ----- TÍTULO -----
    if (!java.util.Objects.equals(card.getTitulo(), request.titulo())) {
        registrarHistorico(card, null, null, emailUsuario,
                "Título: \"" + card.getTitulo() + "\" → \"" + request.titulo() + "\"");
        card.setTitulo(request.titulo());
    }

    // ----- DESCRIÇÃO -----
    if (!java.util.Objects.equals(card.getDescricao(), request.descricao())) {
        registrarHistorico(card, null, null, emailUsuario, "Descrição atualizada");
        card.setDescricao(request.descricao());
    }

    // ----- PRAZO / PREVISÃO -----
    if (!java.util.Objects.equals(card.getPrevisaoLiberacao(), request.previsaoLiberacao())) {
        registrarHistorico(card, null, null, emailUsuario,
                "Prazo: " + card.getPrevisaoLiberacao() + " → " + request.previsaoLiberacao());
        card.setPrevisaoLiberacao(request.previsaoLiberacao());
    }

    // ----- RESPONSÁVEL -----
    UUID respAtualId = card.getResponsavel() != null ? card.getResponsavel().getId() : null;
    if (!java.util.Objects.equals(respAtualId, request.responsavelId())) {
        String nomeAntigo = card.getResponsavel() != null ? card.getResponsavel().getNome() : "ninguém";
        Usuario novoResp = request.responsavelId() != null
                ? usuarioRepository.findById(request.responsavelId()).orElse(null)
                : null;
        String nomeNovo = novoResp != null ? novoResp.getNome() : "ninguém";
        registrarHistorico(card, null, null, emailUsuario,
                "Responsável: " + nomeAntigo + " → " + nomeNovo);
        card.setResponsavel(novoResp);
    }

    // ----- CAMPO EXTRA 1 -----
    if (!java.util.Objects.equals(card.getValorExtra1(), request.valorExtra1())) {
        registrarHistorico(card, null, null, emailUsuario, "Campo 1 atualizado");
        card.setValorExtra1(request.valorExtra1());
    }

    // ----- CAMPO EXTRA 2 -----
    if (!java.util.Objects.equals(card.getValorExtra2(), request.valorExtra2())) {
        registrarHistorico(card, null, null, emailUsuario, "Campo 2 atualizado");
        card.setValorExtra2(request.valorExtra2());
    }

    // ----- CAMPO EXTRA 3 -----
    if (!java.util.Objects.equals(card.getValorExtra3(), request.valorExtra3())) {
        registrarHistorico(card, null, null, emailUsuario, "Campo 3 atualizado");
        card.setValorExtra3(request.valorExtra3());
    }

    card.setAtualizadoEm(LocalDateTime.now());
    Card salvo = cardRepository.save(card);

    return toResponse(salvo);
}

}