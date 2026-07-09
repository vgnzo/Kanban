package kanban.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import kanban.entity.Prioridade;
import java.util.UUID;

public record CardGenericoRequest(
    @NotBlank String titulo,
    String descricao,
    @NotNull UUID colunaId,
    UUID responsavelId,
    Prioridade prioridade,
    String valorExtra1,
    String valorExtra2,
    String valorExtra3
) {}