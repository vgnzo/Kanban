package kanban.service;

import kanban.entity.Board;
import kanban.entity.Coluna;
import kanban.repository.BoardRepository;
import kanban.repository.CardRepository;
import kanban.repository.ColunaRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import kanban.entity.Card;
import java.util.UUID;

@Service
public class ColunaService {

    private final ColunaRepository colunaRepository;
    private final BoardRepository boardRepository;
    private final CardRepository cardRepository;
    private final AcessoService acessoService;

    public ColunaService(ColunaRepository colunaRepository,
                         BoardRepository boardRepository,
                         CardRepository cardRepository,
                         AcessoService acessoService) {
        this.colunaRepository = colunaRepository;
        this.boardRepository = boardRepository;
        this.cardRepository = cardRepository;
        this.acessoService = acessoService;
    }

    public List<Coluna> listarColunas() {
        return colunaRepository.findAllByOrderByOrdemAsc();
    }

    public List<Coluna> listarPorBoard(UUID boardId) {
        return colunaRepository.findByBoardIdOrderByOrdemAsc(boardId);
    }

    public List<Coluna> listarPorBoard(UUID boardId, String emailUsuario) {
        if (emailUsuario != null && !acessoService.podeVer(emailUsuario, boardId)) {
            throw new RuntimeException("Acesso negado a este quadro");
        }
        return listarPorBoard(boardId);
    }

    public Coluna adicionarColuna(UUID boardId, String nome, String cor) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Quadro não encontrado"));

        if ("EQUIPAMENTOS".equals(board.getTipo())) {
            throw new RuntimeException("Não é permitido adicionar colunas ao quadro de Equipamentos");
        }

        List<Coluna> colunas = colunaRepository.findByBoardIdOrderByOrdemAsc(boardId);

        if (colunas.size() >= 15) {
            throw new RuntimeException("Este quadro já atingiu o limite de 15 colunas");
        }

        int proximaOrdem = colunas.isEmpty()
                ? 1
                : colunas.get(colunas.size() - 1).getOrdem() + 1;

        Coluna coluna = new Coluna();
        coluna.setNome(nome);
        coluna.setCor(cor != null && !cor.isBlank() ? cor : "#378ADD");
        coluna.setOrdem(proximaOrdem);
        coluna.setBoard(board);

        return colunaRepository.save(coluna);
    }

    public Coluna adicionarColuna(UUID boardId, String nome, String cor, String emailUsuario) {
        if (emailUsuario != null && !acessoService.podeEditar(emailUsuario, boardId)) {
            throw new RuntimeException("Sem permissão para alterar este quadro");
        }
        return adicionarColuna(boardId, nome, cor);
    }

    public Coluna renomearColuna(UUID colunaId, String novoNome) {
        Coluna coluna = colunaRepository.findById(colunaId)
                .orElseThrow(() -> new RuntimeException("Coluna não encontrada"));

        if (coluna.getBoard() != null && "EQUIPAMENTOS".equals(coluna.getBoard().getTipo())) {
            throw new RuntimeException("Não é permitido renomear colunas do quadro de Equipamentos");
        }

        coluna.setNome(novoNome);
        return colunaRepository.save(coluna);
    }

    public Coluna renomearColuna(UUID colunaId, String novoNome, String emailUsuario) {
        if (emailUsuario != null && !acessoService.podeEditarPelaColuna(emailUsuario, colunaId)) {
            throw new RuntimeException("Sem permissão para alterar esta coluna");
        }
        return renomearColuna(colunaId, novoNome);
    }

    public void removerColuna(UUID colunaId) {
        Coluna coluna = colunaRepository.findById(colunaId)
                .orElseThrow(() -> new RuntimeException("Coluna não encontrada"));

        if (coluna.getBoard() != null && "EQUIPAMENTOS".equals(coluna.getBoard().getTipo())) {
            throw new RuntimeException("Não é permitido remover colunas do quadro de Equipamentos");
        }

        List<Card> cards = cardRepository.findByColunaId(colunaId);
        if (!cards.isEmpty()) {
            throw new RuntimeException("Esta coluna possui cards. Mova ou exclua os cards antes de remover a coluna.");
        }

        colunaRepository.delete(coluna);
    }

    public void removerColuna(UUID colunaId, String emailUsuario) {
        if (emailUsuario != null && !acessoService.podeEditarPelaColuna(emailUsuario, colunaId)) {
            throw new RuntimeException("Sem permissão para remover esta coluna");
        }
        removerColuna(colunaId);
    }
}