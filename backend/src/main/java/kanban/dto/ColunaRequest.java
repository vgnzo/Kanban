package kanban.dto;

import jakarta.validation.constraints.NotBlank;


public record ColunaRequest(
    @NotBlank String nome,
    String cor
){}