package kanban.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Data
@Entity
@Table(name = "unidades")
public class Unidade {

@Id
@GeneratedValue(strategy = GenerationType.UUID)
private UUID id;


@Column(nullable = false, length = 150)
private String nome;

@Column(length = 100)
private String cidade;

@Column(length = 2, columnDefinition = "CHAR(2)")
private String estado;

}