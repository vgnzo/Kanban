package kanban.repository;

import kanban.entity.Unidade;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface UnidadeRepository extends JpaRepository<Unidade, UUID> {
}