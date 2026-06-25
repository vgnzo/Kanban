package kanban.repository;

import kanban.entity.HistoricoCard;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface HistoricoCardRepository extends JpaRepository<HistoricoCard, UUID> {
    List<HistoricoCard> findByCardIdOrderByCriadoEmAsc(UUID cardId);
}