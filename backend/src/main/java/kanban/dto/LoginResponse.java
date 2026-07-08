package kanban.dto;

public record LoginResponse (
    String token,
    String nome,
    String email,
    String perfil,
    String avatar
    
) {}
