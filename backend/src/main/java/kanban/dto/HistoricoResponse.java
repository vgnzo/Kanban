package kanban.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record HistoricoResponse (
    UUID id, 
    String usuarioNome,
    String colunaOrigem,
    String colunaDestino,
    String observacao,
    LocalDateTime criadoEm
) {}
