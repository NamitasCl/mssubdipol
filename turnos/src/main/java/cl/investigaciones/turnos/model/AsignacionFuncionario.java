package cl.investigaciones.turnos.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AsignacionFuncionario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int idFuncionario;

    private String nombreCompleto;
    private String siglasCargo;
    private int antiguedad;
    private String unidad;
    private int mes;
    private int anio;

    private LocalDate createdAt;
    private LocalDate updatedAt;
    private LocalDate fechaCreacion;

    @OneToMany(mappedBy = "identificadorFuncionario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<FuncionarioDiasNoDisponible> diasNoDisponibles;


}
