package kanban.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UsuarioRequest(
    @NotBlank String nome,

    @NotBlank @Email String email,

    @NotBlank String senha,

    @NotBlank
    @Pattern(regexp = "\\d{14}", message = "CNPJ deve conter 14 números")
    String cnpj
) {}