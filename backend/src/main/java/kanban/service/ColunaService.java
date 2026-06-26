package kanban.service;

import kanban.entity.Coluna;
import kanban.repository.ColunaRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service

public class ColunaService {
    
    private final ColunaRepository colunaRepository;

    public ColunaService(ColunaRepository colunaRepository) {
        this.colunaRepository = colunaRepository;
    }

    public List<Coluna> listarColunas(){
        return colunaRepository.findAllByOrderByOrdemAsc();
    }
}
