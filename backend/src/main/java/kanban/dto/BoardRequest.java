package kanban.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record BoardRequest(
    @NotBlank String nome,
    String campoExtra1,
    String campoExtra2,
    String campoExtra3,
    String campoExtra4,
    String campoExtra5,

    @NotEmpty @Size(max = 15, message = "Maximo de 15 colunas por quadro")
    List<ColunaRequest> colunas
) {
    public record ColunaRequest(
        @NotBlank String nome,
        String cor
    ) {}
}