package kanban.dto;

import jakarta.validation.constraints.NotBlank;
import kanban.entity.Prioridade;
import java.time.LocalDate;
import java.util.UUID;

public record CardGenericoUpdateRequest(
    @NotBlank String titulo,
    String descricao,
    UUID responsavelId,
    LocalDate previsaoLiberacao,
    Prioridade prioridade,
    String valorExtra1,
    String valorExtra2,
    String valorExtra3
) {}