package kanban.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;


public record TrocarSenhaRequest (
    @NotBlank String senhaAtual,
    @NotBlank @Size(min = 6, message = "A nova senha deve ter pelo menos 6 caracteres!") String senhaNova
) {}
