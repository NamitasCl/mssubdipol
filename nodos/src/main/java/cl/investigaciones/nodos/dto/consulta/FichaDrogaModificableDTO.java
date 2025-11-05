package cl.investigaciones.nodos.dto.consulta;

import lombok.Data;

import java.time.OffsetDateTime;

/**
 * DTO desacoplado de la entidad JPA FichaPersona.
 * - Incluye todos los campos primitivos de FichaPersona.
 * - Para relaciones, solo datos básicos (ej: nombres), evitando exponer entidades completas.
 */
@Data
public class FichaDrogaModificableDTO {
    // Campos primitivos de FichaPersona
    private Long id;
    private OffsetDateTime createdAt;
    private OffsetDateTime fechaHechoMemo;
    private String tipoDroga;
    private String unidadMedida;
    private Double cantidadDroga;
    private String obs;
    private Long memo;
}
