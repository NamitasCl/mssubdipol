package cl.investigaciones.formularios.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
public class FormularioPermisos {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long formularioId; // Relaciona con el formulario
    // Puedes hacerlo @OneToOne si tienes la entidad Formulario

    @ElementCollection
    private List<String> usuarios;    // ["ERAMIREZS", "JJARA"]
    @ElementCollection
    private List<String> roles;       // ["ROLE_ADMINISTRADOR", "ROLE_SUBDIPOL"]
    @ElementCollection
    private List<String> unidades;    // ["BRIDECMET", "BICRIMPA"]
    @ElementCollection
    private List<String> grupos;      // ["PLANA MAYOR SUBDIPOL"]

}

