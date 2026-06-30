package kanban.repository;

import kanban.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CardRepository extends JpaRepository<Card, UUID> {
    List<Card> findByColunaId(UUID colunaId);
    List<Card> findByEquipamentoId(UUID equipamentoId);

    List<Card> findByArquivadoEmIsNull();
    List<Card> findByArquivadoEmIsNotNull();

    List<Card> findByColunaBoardIdAndArquivadoEmIsNull(UUID boardId);
}