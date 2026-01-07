package cl.investigaciones.nodos.dto.consulta;

import lombok.Data;

import java.time.OffsetDateTime;
import java.util.Set;

/**
 * DTO desacoplado de la entidad JPA FichaPersona.
 * - Incluye todos los campos primitivos de FichaPersona.
 * - Para relaciones, solo datos básicos (ej: nombres), evitando exponer entidades completas.
 */
@Data
public class FichaPersonaModificableDTO {
    // Campos primitivos de FichaPersona
    private Long id;
    private String rut;
    private OffsetDateTime createdAt;
    private OffsetDateTime fechaHecho;
    private OffsetDateTime fechaRegistroMemo;
    private String nombre;
    private String apellidoPat;
    private String apellidoMat;
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
    private String sexo;
    private Integer edad;
    private String tipoDiligencia;
    private String unidad;

    // Relaciones resumidas
    private String nacionalidadNombre;        // ListaNacionalidad.nacionalidad

    private Set<String> delitosNombres;       // ListaDelito.delito

    private Set<String> estadosNombres;       // ListaCalidadPersona.calidad

    // Dato básico del memo asociado (no exponemos el objeto completo)
    private Long memoId;
}
