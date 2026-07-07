package kanban.service;

import kanban.dto.SolicitacaoResponse;
import kanban.entity.Board;
import kanban.entity.Card;
import kanban.entity.Coluna;
import kanban.entity.PermissaoBoard;
import kanban.entity.SolicitacaoAcesso;
import kanban.entity.Usuario;
import kanban.repository.BoardRepository;
import kanban.repository.CardRepository;
import kanban.repository.ColunaRepository;
import kanban.repository.PermissaoBoardRepository;
import kanban.repository.SolicitacaoAcessoRepository;
import kanban.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class AcessoService {

    private final PermissaoBoardRepository permissaoRepository;
    private final SolicitacaoAcessoRepository solicitacaoRepository;
    private final BoardRepository boardRepository;
    private final UsuarioRepository usuarioRepository;
    private final CardRepository cardRepository;
    private final ColunaRepository colunaRepository;

    public AcessoService(PermissaoBoardRepository permissaoRepository,
                         SolicitacaoAcessoRepository solicitacaoRepository,
                         BoardRepository boardRepository,
                         UsuarioRepository usuarioRepository,
                         CardRepository cardRepository,
                         ColunaRepository colunaRepository) {
        this.permissaoRepository = permissaoRepository;
        this.solicitacaoRepository = solicitacaoRepository;
        this.boardRepository = boardRepository;
        this.usuarioRepository = usuarioRepository;
        this.cardRepository = cardRepository;
        this.colunaRepository = colunaRepository;
    }

    // ===== USUÁRIO SOLICITA ACESSO =====
    @Transactional
    public void solicitarAcesso(String emailUsuario, UUID boardId, String nomeSolicitante, String setor) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Quadro não encontrado"));

        if (permissaoRepository.findByUsuarioIdAndBoardId(usuario.getId(), boardId).isPresent()) {
            throw new RuntimeException("Você já tem acesso a este quadro");
        }

        if (solicitacaoRepository.findByUsuarioIdAndBoardIdAndStatus(usuario.getId(), boardId, "PENDENTE").isPresent()) {
            throw new RuntimeException("Você já tem uma solicitação pendente para este quadro");
        }

        SolicitacaoAcesso sol = new SolicitacaoAcesso();
        sol.setUsuario(usuario);
        sol.setBoard(board);
        sol.setNomeSolicitante(nomeSolicitante);
        sol.setSetor(setor);
        sol.setStatus("PENDENTE");

        solicitacaoRepository.save(sol);
    }

    // ===== DONO APROVA =====
    @Transactional
    public void aprovarSolicitacao(UUID solicitacaoId, String nivel) {
        SolicitacaoAcesso sol = solicitacaoRepository.findById(solicitacaoId)
                .orElseThrow(() -> new RuntimeException("Solicitação não encontrada"));

        PermissaoBoard permissao = new PermissaoBoard();
        permissao.setUsuario(sol.getUsuario());
        permissao.setBoard(sol.getBoard());
        permissao.setNivel("EDITAR".equals(nivel) ? "EDITAR" : "VISUALIZAR");
        permissaoRepository.save(permissao);

        sol.setStatus("APROVADA");
        solicitacaoRepository.save(sol);
    }

    // ===== DONO RECUSA =====
    @Transactional
    public void recusarSolicitacao(UUID solicitacaoId) {
        SolicitacaoAcesso sol = solicitacaoRepository.findById(solicitacaoId)
                .orElseThrow(() -> new RuntimeException("Solicitação não encontrada"));
        sol.setStatus("RECUSADA");
        solicitacaoRepository.save(sol);
    }

    // ===== LISTAR PENDENTES =====
    public List<SolicitacaoResponse> listarPendentes(UUID boardId) {
        return solicitacaoRepository.findByBoardIdAndStatus(boardId, "PENDENTE")
                .stream()
                .map(s -> new SolicitacaoResponse(
                        s.getId(),
                        s.getNomeSolicitante(),
                        s.getSetor(),
                        s.getUsuario().getEmail(),
                        s.getStatus(),
                        s.getCriadoEm()
                ))
                .toList();
    }

    // ===== VERIFICAÇÕES DE ACESSO =====
    // Regra unificada (vale pra ADMIN e USER):
    //  - dono do quadro → acesso
    //  - senão, tem permissão → acesso conforme o nível
    public boolean podeVer(String emailUsuario, UUID boardId) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario).orElse(null);
        if (usuario == null) return false;

        Board board = boardRepository.findById(boardId).orElse(null);
        if (board == null) return false;

        // dono vê sempre (seja admin ou user)
        if (board.getDono() != null && board.getDono().getId().equals(usuario.getId())) {
            return true;
        }
        // senão, precisa ter permissão
        return permissaoRepository.findByUsuarioIdAndBoardId(usuario.getId(), boardId).isPresent();
    }

    public boolean podeEditar(String emailUsuario, UUID boardId) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario).orElse(null);
        if (usuario == null) return false;

        Board board = boardRepository.findById(boardId).orElse(null);
        if (board == null) return false;

        // dono edita sempre (seja admin ou user)
        if (board.getDono() != null && board.getDono().getId().equals(usuario.getId())) {
            return true;
        }
        // senão, precisa ter permissão de nível EDITAR
        return permissaoRepository.findByUsuarioIdAndBoardId(usuario.getId(), boardId)
                .map(p -> "EDITAR".equals(p.getNivel()))
                .orElse(false);
    }

    // descobre o board a partir do card e checa se pode editar
    public boolean podeEditarPeloCard(String emailUsuario, UUID cardId) {
        Card card = cardRepository.findById(cardId).orElse(null);
        if (card == null || card.getColuna() == null) return false;

        Coluna coluna = colunaRepository.findById(card.getColuna().getId()).orElse(null);
        if (coluna == null || coluna.getBoard() == null) return false;

        return podeEditar(emailUsuario, coluna.getBoard().getId());
    }

    // descobre o board a partir da coluna e checa se pode editar
    public boolean podeEditarPelaColuna(String emailUsuario, UUID colunaId) {
        Coluna coluna = colunaRepository.findById(colunaId).orElse(null);
        if (coluna == null || coluna.getBoard() == null) return false;
        return podeEditar(emailUsuario, coluna.getBoard().getId());
    }

    // ===== DONO DO QUADRO (pra aprovar/recusar solicitações) =====
    // checa se o usuário é o dono do board
    public boolean souDonoDoBoard(String emailUsuario, UUID boardId) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario).orElse(null);
        if (usuario == null) return false;

        Board board = boardRepository.findById(boardId).orElse(null);
        if (board == null || board.getDono() == null) return false;

        return board.getDono().getId().equals(usuario.getId());
    }

    // acha o board a partir da solicitação e checa se é o dono
    public boolean souDonoPelaSolicitacao(String emailUsuario, UUID solicitacaoId) {
        SolicitacaoAcesso sol = solicitacaoRepository.findById(solicitacaoId).orElse(null);
        if (sol == null || sol.getBoard() == null) return false;
        return souDonoDoBoard(emailUsuario, sol.getBoard().getId());
    }
}