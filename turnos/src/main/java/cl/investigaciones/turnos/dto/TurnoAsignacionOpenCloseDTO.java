package cl.investigaciones.turnos.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TurnoAsignacionOpenCloseDTO {
    private String nombreCalendario;
    private int idFuncionario;
    private int mes;
    private int anio;
    private boolean open;
    private List<Long> ids;
    private LocalDate cretedAt;
    private LocalDate updatedAt;
}
