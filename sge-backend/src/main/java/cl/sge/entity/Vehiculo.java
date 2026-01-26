package cl.sge.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Vehiculo {
    @Id
    private String sigla;
    private String tipo;
    private Integer capacidad;
    private String unidad; // Added to link vehicle to specific unit
    
    @Enumerated(EnumType.STRING)
    private EstadoLogistico estado;

    public enum EstadoLogistico {
        OPERATIVO, MANTENCION, BAJA
    }
}
