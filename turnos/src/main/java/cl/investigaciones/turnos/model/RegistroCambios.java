package cl.investigaciones.turnos.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "registro_cambios")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistroCambios {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Fecha y hora del cambio
    @Column(nullable = false)
    private LocalDateTime fechaCambio;

    // Id y nombre del funcionario original
    @Column(nullable = false)
    private Integer idFuncionarioOriginal;
    @Column(nullable = false)
    private String funcionarioOriginal;

    // Id y nombre del funcionario reemplazo
    @Column(nullable = false)
    private Integer idFuncionarioReemplazo;
    @Column(nullable = false)
    private String funcionarioReemplazo;

    // Nombre del turno cambiado (opcional pero útil)
    @Column(nullable = false)
    private String nombreTurno;

    // Día, mes y año del turno
    private Integer dia;
    private Integer mes;
    private Integer anio;

    // Unidad que realiza el cambio (si aplica)
    private String unidad;

    // Motivo del cambio (libre, por mejor servicio, etc)
    @Column(length = 255)
    private String motivo;

    // Usuario (nombre o username) que realiza el cambio
    private String usuarioCambio;

    // Puedes agregar cualquier otro campo relevante para trazabilidad
}