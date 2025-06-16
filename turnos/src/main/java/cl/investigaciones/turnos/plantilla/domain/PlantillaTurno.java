package cl.investigaciones.turnos.plantilla.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "plantilla_turno")
@Data
public class PlantillaTurno {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String descripcion;
    private boolean activo = true;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "plantilla_turno_id")
    private List<ServicioPlantilla> servicios = new ArrayList<>();
}
