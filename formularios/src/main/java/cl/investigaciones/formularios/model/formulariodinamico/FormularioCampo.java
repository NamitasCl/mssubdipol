package cl.investigaciones.formularios.model.formulariodinamico;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "formulario_campo")
@Getter
@Setter
public class FormularioCampo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "formulario_id")
    private FormularioDefinicion formulario;

    private String nombre;      // id del campo (machine name, ej: 'nombreServicio')
    private String etiqueta;    // Etiqueta visible (ej: "Nombre del Servicio")
    private String tipo;        // Tipo (text, select, date, boolean, etc)
    private Boolean requerido;
    @Column(columnDefinition = "TEXT")
    private String opciones;    // Para select/radio, JSON de opciones o string separado por comas
    private Integer orden;

}

