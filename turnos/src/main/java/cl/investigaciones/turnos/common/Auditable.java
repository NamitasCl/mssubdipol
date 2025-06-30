package cl.investigaciones.turnos.common;

import jakarta.persistence.MappedSuperclass;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@MappedSuperclass
@Data
public abstract class Auditable {
    private Integer creadoPor;
    private LocalDateTime fechaCreacion;
    private Integer modificadoPor;
    private LocalDateTime fechaModificacion;
}
