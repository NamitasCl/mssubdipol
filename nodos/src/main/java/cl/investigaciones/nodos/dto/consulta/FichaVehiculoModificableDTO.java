package cl.investigaciones.nodos.dto.consulta;

import lombok.Data;

import java.time.OffsetDateTime;

/**
 * DTO desacoplado de la entidad JPA FichaPersona.
 * - Incluye todos los campos primitivos de FichaPersona.
 * - Para relaciones, solo datos básicos (ej: nombres), evitando exponer entidades completas.
 */
@Data
public class FichaVehiculoModificableDTO {
    // Campos primitivos de FichaPersona
    private Long id;
    private OffsetDateTime createdAt;
    private String patente;
    private String tipo;
    private String marca;
    private String modelo;
    private String color;
    private String calidad;
    private String unidad;
    private String observaciones;
    private Long memoId;
}
