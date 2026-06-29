package kanban.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.util.UUID;


public record CarUpdateRequest(
    @NotBlank String titulo,
    String descricao,
    UUID reservaId,
    UUID responsavelId,
    LocalDate previsaoLiberacao
) {}
