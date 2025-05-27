package cl.investigaciones.formularios.model.formulariodinamico;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "formulario_visibilidad")
@Getter
@Setter
public class FormularioVisibilidad {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "formulario_id")
    private FormularioDefinicion formulario;

    private String tipoDestino;   // "unidad", "usuario", "grupo", "publica"
    private String valorDestino;  // Sigla unidad, id de usuario, id grupo, etc. Null si es pública.
}

