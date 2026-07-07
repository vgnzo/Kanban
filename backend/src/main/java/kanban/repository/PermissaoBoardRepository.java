package kanban.repository;

import kanban.entity.PermissaoBoard;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


public interface PermissaoBoardRepository extends JpaRepository<PermissaoBoard, UUID> {

    //busca a permissao de um user especifico(se existir)
    Optional<PermissaoBoard> findByUsuarioIdAndBoardId(UUID usuarioId, UUID boardId);

    List<PermissaoBoard> findByUsuarioId(UUID usuarioId);
    
    //lista todas as permissoes de um quadro (tds q tem acesso a ele)
    List<PermissaoBoard> findByBoardId(UUID boardId);
}