package kanban.service;

import kanban.dto.BoardRequest;
import kanban.dto.BoardResponse;
import kanban.entity.Board;
import kanban.entity.Card;
import kanban.entity.Coluna;
import kanban.entity.PermissaoBoard;
import kanban.entity.Usuario;
import kanban.repository.BoardRepository;
import kanban.repository.CardRepository;
import kanban.repository.ColunaRepository;
import kanban.repository.HistoricoCardRepository;
import kanban.repository.PermissaoBoardRepository;
import kanban.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BoardService {

    private final BoardRepository boardRepository;
    private final ColunaRepository colunaRepository;
    private final CardRepository cardRepository;
    private final HistoricoCardRepository historicoCardRepository;
    private final PermissaoBoardRepository permissaoRepository;
    private final UsuarioRepository usuarioRepository;

    public BoardService(BoardRepository boardRepository,
                        ColunaRepository colunaRepository,
                        CardRepository cardRepository,
                        HistoricoCardRepository historicoCardRepository,
                        PermissaoBoardRepository permissaoRepository,
                        UsuarioRepository usuarioRepository) {
        this.boardRepository = boardRepository;
        this.colunaRepository = colunaRepository;
        this.cardRepository = cardRepository;
        this.historicoCardRepository = historicoCardRepository;
        this.permissaoRepository = permissaoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public BoardResponse buscarPorId(UUID id, String emailUsuario) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quadro não encontrado"));
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        return toResponse(board, usuario);
    }

    @Transactional
    public BoardResponse criar(BoardRequest request, String emailUsuario) {
        Usuario dono = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Board board = new Board();
        board.setNome(request.nome());
        board.setTipo("GENERICO");
        board.setCampoExtra1(vazioParaNull(request.campoExtra1()));
        board.setCampoExtra2(vazioParaNull(request.campoExtra2()));
        board.setCampoExtra3(vazioParaNull(request.campoExtra3()));
        board.setCampoExtra4(vazioParaNull(request.campoExtra4()));
        board.setCampoExtra5(vazioParaNull(request.campoExtra5()));
        board.setDono(dono);

        Board salvo = boardRepository.save(board);

        int ordem = 1;
        for (BoardRequest.ColunaRequest colReq : request.colunas()) {
            Coluna coluna = new Coluna();
            coluna.setNome(colReq.nome());
            coluna.setCor(colReq.cor() != null ? colReq.cor() : "#378ADD");
            coluna.setOrdem(ordem++);
            coluna.setBoard(salvo);
            colunaRepository.save(coluna);
        }

        return toResponse(salvo, dono);
    }

    // Só o DONO do quadro pode excluí-lo (seja admin ou user).
    @Transactional
    public void deletar(UUID id, String emailUsuario) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quadro não encontrado"));

        if ("EQUIPAMENTOS".equals(board.getTipo())) {
            throw new RuntimeException("O quadro de Equipamentos não pode ser excluído");
        }

        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        boolean souDono = board.getDono() != null && board.getDono().getId().equals(usuario.getId());
        if (!souDono) {
            throw new RuntimeException("Apenas o dono pode excluir este quadro");
        }

        List<Coluna> colunas = colunaRepository.findByBoardIdOrderByOrdemAsc(id);

        for (Coluna coluna : colunas) {
            List<Card> cards = cardRepository.findByColunaId(coluna.getId());
            for (Card card : cards) {
                historicoCardRepository.deleteAll(
                    historicoCardRepository.findByCardIdOrderByCriadoEmAsc(card.getId())
                );
            }
            cardRepository.deleteAll(cards);
        }

        colunaRepository.deleteAll(colunas);
        boardRepository.delete(board);
    }

    // Todos os usuários veem todos os quadros na lista.
    // O toResponse marca quais têm acesso (dono ou permissão) e quais estão trancados.
    // Assim o USER enxerga os quadros dos outros (trancados) para poder solicitar acesso.
    public List<BoardResponse> listarTodos(String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        return boardRepository.findAll().stream()
                .map(b -> toResponse(b, usuario))
                .toList();
    }

    private String vazioParaNull(String valor) {
        return (valor == null || valor.isBlank()) ? null : valor;
    }

    // Regra unificada de acesso (vale pra ADMIN e USER):
    //  - dono do quadro → acesso total (EDITAR)
    //  - senão, tem permissão → acesso conforme o nível dela
    //  - senão → sem acesso (quadro trancado)
    private BoardResponse toResponse(Board board, Usuario usuario) {
        boolean souDono = board.getDono() != null && board.getDono().getId().equals(usuario.getId());

        boolean temAcesso;
        String nivelAcesso;

        if (souDono) {
            // dono manda no quadro dele
            temAcesso = true;
            nivelAcesso = "EDITAR";
        } else {
            // senão, o acesso depende de ter permissão
            Optional<PermissaoBoard> permissao =
                    permissaoRepository.findByUsuarioIdAndBoardId(usuario.getId(), board.getId());
            temAcesso = permissao.isPresent();
            nivelAcesso = permissao.map(PermissaoBoard::getNivel).orElse(null);
        }

        return new BoardResponse(
                board.getId(),
                board.getNome(),
                board.getTipo(),
                board.getCampoExtra1(),
                board.getCampoExtra2(),
                board.getCampoExtra3(),
                board.getCampoExtra4(),
                board.getCampoExtra5(),
                souDono,
                temAcesso,
                nivelAcesso
        );
    }
}