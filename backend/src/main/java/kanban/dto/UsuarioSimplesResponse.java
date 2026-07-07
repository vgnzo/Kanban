package kanban.dto;

import java.util.UUID;

public record UsuarioSimplesResponse(
    UUID id,
    String nome
) {}