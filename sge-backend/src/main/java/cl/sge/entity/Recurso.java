package cl.sge.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Recurso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String tipo; // Generador, Drone, Maquinaria Pesada
    
    @Enumerated(EnumType.STRING)
    private EstadoRecurso estado;
    
    private String unidadDueña;
    
    private Integer cantidad; // New field for quantity

    private String registeredBy;

    public enum EstadoRecurso {
        OPERATIVO, MANTENCION, BAJA
    }
}
