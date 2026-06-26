package kanban.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record CardResponse(
    UUID id,
    String titulo,
    String descricao,
    String frota,
    String modelo,
    String unidade,
    String frotaReserva,
    UUID colunaId,
    String colunaNome,
    String corColuna,
    UUID responsavelId,
    String responsavelNome,
    LocalDate previsaoLiberacao,
    LocalDateTime criadoEm,
    LocalDateTime atualizadoEm
) {}