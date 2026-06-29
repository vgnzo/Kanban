package kanban.dto;

import java.util.UUID;

public record UnidadeResponse(
    UUID id,
    String nome,
    String cidade,
    String estado
) {}