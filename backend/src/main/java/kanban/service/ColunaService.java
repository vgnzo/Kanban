package kanban.service;

import kanban.entity.Coluna;
import kanban.repository.ColunaRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class ColunaService {

    private final ColunaRepository colunaRepository;

    public ColunaService(ColunaRepository colunaRepository) {
        this.colunaRepository = colunaRepository;
    }

    public List<Coluna> listarColunas() {
        return colunaRepository.findAllByOrderByOrdemAsc();
    }

    public List<Coluna> listarPorBoard(UUID boardId) {
        return colunaRepository.findByBoardIdOrderByOrdemAsc(boardId);
    }
}