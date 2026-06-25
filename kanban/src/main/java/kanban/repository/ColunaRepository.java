package kanban.repository;

import kanban.entity.Coluna;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ColunaRepository extends JpaRepository<Coluna, UUID> {
    List<Coluna> findAllByOrderByOrdemAsc();
}