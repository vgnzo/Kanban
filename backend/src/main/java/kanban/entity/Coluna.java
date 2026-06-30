package kanban.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "colunas")
public class Coluna {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 50)
    private String nome;

    @Column(nullable = false)
    private Integer ordem;

    @Column(length = 20)
    private String cor;

    @ManyToOne
    @JoinColumn(name = "board_id")
    private Board board;
}