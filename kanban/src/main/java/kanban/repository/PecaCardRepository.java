package kanban.repository;

import kanban.entity.PecaCard;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PecaCardRepository extends JpaRepository<PecaCard, UUID> {
    List<PecaCard> findByCardId(UUID cardId);
}