package kanban.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record CardRequest(
    @NotBlank String titulo,
    String descricao,
    @NotNull UUID equipamentoId,
    @NotNull UUID colunaId,
    UUID reservaId,
    UUID responsavelId,
    LocalDate previsaoLiberacao
) {}