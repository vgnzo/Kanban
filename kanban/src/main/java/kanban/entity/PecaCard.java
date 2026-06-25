package kanban.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Data
@Entity
@Table(name = "pecas_card")
public class PecaCard {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "card_id", nullable = false)
    private Card card;

    @Column(length = 50)
    private String codigo;

    @Column(length = 200)
    private String descricao;

    @Column(nullable = false)
    private Integer quantidade = 1;

    @Column(length = 50)
    private String sa;

    @Column(length = 50)
    private String sc;

    @Column(length = 50)
    private String pedido;

    private Boolean mrp = false;
}