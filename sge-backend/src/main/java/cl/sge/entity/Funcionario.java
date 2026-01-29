package cl.sge.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Data
public class Funcionario {
    @Id
    private String rut;
    private String nombre;
    private String grado;
    private String unidad;

    private String subdireccion; // SUBDIPOL or SUBDICOR
    private String region;
    private String regionPolicial;
    private String telefono;

    @ElementCollection
    @CollectionTable(name = "funcionario_especialidades", joinColumns = @JoinColumn(name = "funcionario_rut"))
    @Column(name = "especialidad")
    private List<String> especialidades;

    private String estado = "DISPONIBLE"; // DISPONIBLE, ASIGNADO, DE_FRANCO, LICENCIA
}
