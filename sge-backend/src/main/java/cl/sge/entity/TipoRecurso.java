package cl.sge.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "tipo_recurso")
public class TipoRecurso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", nullable = false, unique = true)
    private String nombre;
}
