package cl.sge.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Asignacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Despliegue despliegue;

    @ManyToOne
    private Vehiculo vehiculo;

    // Optional: If a vehicle is not assigned, or if officials are assigned independently
    // For now we assume assignments can be mixed, but typically linked to a unit.
    
    // We can't use List<Funcionario> easily in a simple entity without a join table or @ElementCollection, 
    // but for simplicity in this assignments, let's say an assignment tracks one main resource (vehicle) 
    // or a group of officials. 
    // Let's keep it simple: An assignment is a Vehicle + its crew, OR just officials.
    
    // For this MVP, let's link a Vehicle (which has a crew capacity) and a distinct count of officials?
    // Or simpler: Just a link to Vehicle. Officials might need their own Assignment type if they go on foot.
    // Let's stick to the plan: "Links Despliegue, Vehiculo, Funcionario".
    
    @ManyToMany
    @JoinTable(
        name = "asignacion_funcionarios",
        joinColumns = @JoinColumn(name = "asignacion_id"),
        inverseJoinColumns = @JoinColumn(name = "funcionario_id")
    )
    private java.util.List<Funcionario> funcionarios; // Crew or Team

    // New Resource Types
    @ManyToOne
    private Recurso recurso;
    
    @ManyToOne
    private Insumo insumo;
    private Integer cantidadAsignada; // For consumables
    
    private String unidadOrigen;

    private LocalDateTime fechaAsignacion;
}
