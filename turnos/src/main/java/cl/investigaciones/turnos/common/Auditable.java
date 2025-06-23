package cl.investigaciones.turnos.common;

import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@MappedSuperclass
@Getter
@Setter
public abstract class Auditable {
    private int creadoPor;
    private LocalDateTime fechaCreacion;
    private int modificadoPor;
    private LocalDateTime fechaModificacion;
}
