package kanban.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CardGenericoRequest(
    @NotBlank String titulo,
    String descricao,
    @NotNull UUID colunaId,
    UUID responsavelId,
    String valorExtra1,
    String valorExtra2,
    String valorExtra3
) {}