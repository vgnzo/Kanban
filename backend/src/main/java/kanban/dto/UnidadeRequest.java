package kanban.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UnidadeRequest(
    @NotBlank String nome,
    String cidade,
    @Size(min = 2, max = 2) String estado
) {}