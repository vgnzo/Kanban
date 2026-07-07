package kanban.dto;

public record ResetCardRequest(
    boolean copiarTitulo,
    boolean copiarDescricao,
    boolean copiarExtra1,
    boolean copiarExtra2,
    boolean copiarExtra3
) {}