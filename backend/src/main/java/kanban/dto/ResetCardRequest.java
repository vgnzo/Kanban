package kanban.dto;

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
    String valorExtra3
) {}