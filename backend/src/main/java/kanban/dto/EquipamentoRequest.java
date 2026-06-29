package kanban.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record EquipamentoRequest(
    @NotBlank String frota,
    @NotBlank String modelo,
    String marca,
    Integer horimetro,
    @NotNull UUID unidadeId
) {}