package kanban.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table (name = "boards")
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;


    @ManyToOne
    @JoinColumn(name= "dono_id")
    private Usuario dono;

    @Column(nullable = false, length  = 120)
    private String nome;


    @Column(nullable = false, length = 20)
    private String tipo = "GENERICO";

      @Column(name = "campo_extra_1", length = 60)
    private String campoExtra1;

    @Column(name = "campo_extra_2", length = 60)
    private String campoExtra2;

    @Column(name = "campo_extra_3", length = 60)
    private String campoExtra3;


    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm = LocalDateTime.now();
}