package kanban.dto;

import java.util.UUID;

public record EquipamentoResponse(
    UUID id,
    String frota,
    String modelo,
    String marca,
    Integer horimetro,
    String unidade
) {}