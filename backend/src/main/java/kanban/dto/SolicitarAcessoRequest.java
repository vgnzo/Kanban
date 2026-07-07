package kanban.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record SolicitarAcessoRequest(
    @NotNull UUID boardId,
    @NotBlank String nomeSolicitante,
    String setor
) {}