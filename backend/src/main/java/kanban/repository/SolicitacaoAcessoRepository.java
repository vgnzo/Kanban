package kanban.repository;

import kanban.entity.SolicitacaoAcesso;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


public interface SolicitacaoAcessoRepository extends JpaRepository<SolicitacaoAcesso, UUID> {

    List<SolicitacaoAcesso> findByUsuarioId(UUID usuarioId);

    Optional<SolicitacaoAcesso> findByUsuarioIdAndBoardIdAndStatus(UUID usuarioId, UUID boardId, String status);

    List<SolicitacaoAcesso> findByBoardId(UUID boardId);

    List<SolicitacaoAcesso> findByBoardIdAndStatus(UUID boardId, String status);
}