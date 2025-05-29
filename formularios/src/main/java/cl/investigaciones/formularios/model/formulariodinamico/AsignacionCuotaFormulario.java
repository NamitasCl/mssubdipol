package cl.investigaciones.formularios.model.formulariodinamico;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "asignacion_cuota_formulario")
@Getter
@Setter
public class AsignacionCuotaFormulario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "formulario_id")
    private FormularioDefinicion formulario;

    private Integer idUnidad;      // ID de la unidad a la que se le asigna la cuota

    private Integer cuotaAsignada; // Puede ser null o 0 si es flexible

    private Integer cuotaPadreId;  // ID de la asignación padre (opcional, si quieres trazar redistribuciones)

    // Podrías agregar fecha de asignación, usuario asignador, comentarios, etc.
}
