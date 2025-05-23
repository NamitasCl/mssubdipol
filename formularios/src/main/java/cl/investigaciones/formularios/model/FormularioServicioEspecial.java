package cl.investigaciones.formularios.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "form_servicio_especial")
@Getter
@Setter
public class FormularioServicioEspecial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String regionPolicial;
    private String brigada;
    private String nombreServicio;

    private LocalDateTime fechaHoraInicio;
    private LocalDateTime fechaHoraTermino;

    private String siglaCarro;
    private Boolean esCorporativo;

    private Integer idJefeMaquina;     // Se obtiene desde commonservices
    private String telefonoJefeMaquina;

    private LocalDateTime fechaRegistro;
}
