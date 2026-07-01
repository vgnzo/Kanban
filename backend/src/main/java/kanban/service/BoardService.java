package kanban.service;

import kanban.dto.BoardRequest;
import kanban.dto.BoardResponse;
import kanban.entity.Board;
import kanban.entity.Coluna;
import kanban.repository.BoardRepository;
import kanban.repository.ColunaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import kanban.entity.Card;
import kanban.repository.CardRepository;
import kanban.repository.HistoricoCardRepository;
import java.util.List;
import java.util.UUID;

@Service
public class BoardService {

  private final BoardRepository boardRepository;
    private final ColunaRepository colunaRepository;
    private final CardRepository cardRepository;
    private final HistoricoCardRepository historicoCardRepository;

    public BoardService(BoardRepository boardRepository,
                        ColunaRepository colunaRepository,
                        CardRepository cardRepository,
                        HistoricoCardRepository historicoCardRepository) {
        this.boardRepository = boardRepository;
        this.colunaRepository = colunaRepository;
        this.cardRepository = cardRepository;
        this.historicoCardRepository = historicoCardRepository;
    }

    public BoardResponse buscarPorId(UUID id){
        Board board = boardRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Quadro não encontrado"));
        return toResponse(board);
    }


    @Transactional
    public BoardResponse criar(BoardRequest request){
        Board board = new Board();
        board.setNome(request.nome());
        board.setTipo("GENERICO");
         board.setCampoExtra1(vazioParaNull(request.campoExtra1()));
        board.setCampoExtra2(vazioParaNull(request.campoExtra2()));
        board.setCampoExtra3(vazioParaNull(request.campoExtra3()));

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

        return toResponse(salvo);
    }

  @Transactional
    public void deletar(UUID id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quadro não encontrado"));

        if ("EQUIPAMENTOS".equals(board.getTipo())) {
            throw new RuntimeException("O quadro de Equipamentos não pode ser excluído");
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

    private String vazioParaNull(String valor) {
        return (valor == null || valor.isBlank()) ? null : valor;
    }

    private BoardResponse toResponse(Board board) {
        return new BoardResponse(
                board.getId(),
                board.getNome(),
                board.getTipo(),
                board.getCampoExtra1(),
                board.getCampoExtra2(),
                board.getCampoExtra3()
        );
    }

    public List<BoardResponse> listarTodos() {
        return boardRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }
}




