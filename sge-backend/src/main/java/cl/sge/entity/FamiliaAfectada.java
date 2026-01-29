package cl.sge.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "familia_afectada")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FamiliaAfectada {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "evento_id")
    private Evento evento;

    // External reference to commonservices Funcionario
    private String funcionarioId;
    private String funcionarioNombre; // Snapshot for display
    private String funcionarioRut;    // Snapshot for search

    // Affected Family Member Details
    private String nombreCompleto;
    private String rut; // Family member RUT
    private String telefono;
    
    private String parentesco; // Padre, Madre, Hijo, etc.
    
    private String tipoBienAfectado; // Casa, Auto, etc.
    private String direccion;
    
    @Column(columnDefinition = "TEXT")
    private String detalle;
    
    private LocalDateTime fechaRegistro;

    @PrePersist
    public void prePersist() {
        this.fechaRegistro = LocalDateTime.now();
    }
}
