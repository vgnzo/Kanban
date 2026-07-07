package kanban.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record SolicitacaoResponse(
    UUID id,
    String nomeSolicitante,
    String setor,
    String emailUsuario,
    String status,
    LocalDateTime criadoEm
) {}