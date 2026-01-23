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
    @Enumerated(EnumType.STRING)
    private List<Especialidad> especialidades;

    public enum Especialidad {
        AUDITOR, ENFERMERO, PARAMEDICO, MEDICO, ABOGADO,
        PSICOLOGO, KINESIOLOGO, INGENIERO, TECNICO,
        BOMBERO, DRON, OTRO
    }
}
