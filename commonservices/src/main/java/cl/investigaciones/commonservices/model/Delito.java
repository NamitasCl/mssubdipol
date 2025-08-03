package cl.investigaciones.commonservices.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "delitos")
@Data
public class Delito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String familia;
    private String delito;
    private int codigo;

}
