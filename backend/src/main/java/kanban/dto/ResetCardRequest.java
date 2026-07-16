package kanban.dto;

import kanban.entity.Prioridade;

public record ResetCardRequest(
    boolean copiarTitulo,
    boolean copiarDescricao,
    boolean copiarExtra1,
    boolean copiarExtra2,
    boolean copiarExtra3,
    String titulo,
    String descricao,
    String valorExtra1,
    String valorExtra2,
    String valorExtra3,
    Prioridade prioridade
) {}