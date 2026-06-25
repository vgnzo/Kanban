package kanban.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "cards")
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn( name = "equipamento_id", nullable = false)
    private Equipamento equipamento;


    @ManyToOne
    @JoinColumn(name = "coluna_id", nullable = false)
    private Coluna coluna;

    @ManyToOne
    @JoinColumn(name = "responsavel_id")
    private Usuario responsavel;


    @Column(nullable = false, length =200)
    private String titulo;

    @Column (columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();

    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm = LocalDateTime.now();

    @Column(name = "previsao_liberacao")
    private LocalDate previsaoLiberacao;
}