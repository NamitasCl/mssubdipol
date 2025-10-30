package cl.investigaciones.turnosv2.domain;

// Importa el Enum que crearemos a continuación

import cl.investigaciones.turnosv2.domain.enums.RolServicio;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Objeto "embebido" (Embeddable) que representa una línea de la configuración
 * de requerimientos (ej: "2 AYUDANTES", "1 JEFE_DE_SERVICIO").
 * * No es una entidad por sí misma, sino que vive DENTRO de la
 * lista "requerimientos" en la entidad PlantillaRequerimiento.
 */
@Embeddable // Le dice a JPA: "Esta clase se 'incrusta' en otra entidad"
@Data
@NoArgsConstructor // Requerido por JPA
@AllArgsConstructor
public class RequerimientoDia {

    /**
     * El rol que se necesita para esta línea de requerimiento.
     * Se guarda como String en la BD (ej: "JEFE_DE_SERVICIO") para
     * mayor claridad y robustez.
     */
    @Enumerated(EnumType.STRING)
    private RolServicio rol;

    /**
     * La cantidad de funcionarios que se necesitan para este rol específico.
     */
    private int cantidad;
}