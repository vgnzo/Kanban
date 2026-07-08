package kanban.entity;

public enum Prioridade {
    BAIXO(1),
    MEDIO(2),
    ALTO(3);

    private final int peso;

    Prioridade(int peso) {
        this.peso = peso;
    }

    public int getPeso() {
        return peso;
    }
}