package cl.investigaciones.nodos.dto.consulta;

import lombok.Data;

import java.time.OffsetDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Data
public class FichaPersonaSimpleDTO {
    private Long id;
    private String rut;
    private OffsetDateTime createdAt;
    private String nombre;
    private String apellidoPat;
    private String apellidoMat;
    private String nacionalidad;
    private String direccion;
    private String direccionNumero;
    private String departamento;
    private String block;
    private String condicionMigratoria;
    private String apodo;
    private String ciudadNacimiento;
    private String observaciones;
    private String fono;
    private String correoElectronico;

    // 👇 ahora simples strings; inicializado para que nunca sea null
    private Set<String> estados = new LinkedHashSet<>();
}
