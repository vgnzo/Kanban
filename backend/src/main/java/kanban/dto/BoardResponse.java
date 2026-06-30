package kanban.dto;

import java.util.UUID;

public record BoardResponse(
    UUID id,
    String nome,
    String tipo,
    String campoExtra1,
    String campoExtra2,
    String campoExtra3
) {}