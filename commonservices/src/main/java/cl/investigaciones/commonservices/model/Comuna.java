package cl.investigaciones.commonservices.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Comuna {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    @ManyToOne
    @JoinColumn(name = "provincia_id")
    private Provincia provincia;
}
