package cl.investigaciones.turnos.calendar.domain;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "configuracion_reglas_distribucion")
@Data
public class ConfiguracionReglas {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 100)
    private String nombre;
    
    @Column(length = 500)
    private String descripcion;
    
    // ===== Reglas de Separación =====
    @Column(nullable = false)
    private Integer minSeparacionDias = 3;
    
    @Column(nullable = false)
    private Integer maxTurnosConsecutivos = 2;
    
    // ===== Reglas de Fin de Semana =====
    @Column(nullable = false)
    private Integer maxFinDeSemanaMes = 2;
    
    @Column(nullable = false)
    private Boolean tratarFeriadosComoFds = true;
    
    // ===== Reglas de Balance =====
    @Column(nullable = false)
    private Boolean balancearCargaEquitativa = true;
    
    @Column(nullable = false)
    private Double toleranciaDesviacion = 2.0; // Turnos de diferencia aceptables
    
    // ===== Reglas de Jerarquía =====
    @Column(nullable = false)
    private Boolean considerarJerarquia = true;
    
    @Column(nullable = false)
    private Boolean priorizarAntiguedad = true;
    
    // ===== Reglas de Disponibilidad =====
    @Column(nullable = false)
    private Boolean respetarDiasNoDisponibles = true;
    
    @Column(nullable = false)
    private Boolean permitirSobreAsignacion = false;
    
    // ===== Pesos para Optimización =====
    @Column(nullable = false)
    private Double pesoSeparacion = 1.0;
    
    @Column(nullable = false)
    private Double pesoFinDeSemana = 0.8;
    
    @Column(nullable = false)
    private Double pesoBalance = 1.2;
    
    @Column(nullable = false)
    private Double pesoJerarquia = 0.5;
    
    // ===== Configuración de Algoritmo =====
    @Column(nullable = false)
    private Integer maxIteraciones = 1000;
    
    @Column(nullable = false)
    private Boolean permitirBacktracking = true;
    
    @Column(nullable = false)
    private Boolean activo = true;
    
    // ===== Metadata =====
    @Column(nullable = false, updatable = false)
    private java.time.OffsetDateTime fechaCreacion;
    
    @Column
    private java.time.OffsetDateTime fechaModificacion;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = java.time.OffsetDateTime.now(java.time.ZoneId.of("America/Santiago"));
        fechaModificacion = fechaCreacion;
    }
    
    @PreUpdate
    protected void onUpdate() {
        fechaModificacion = java.time.OffsetDateTime.now(java.time.ZoneId.of("America/Santiago"));
    }
}
