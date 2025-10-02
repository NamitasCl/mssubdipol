package cl.investigaciones.nodos.dto.relatojenadep;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class RelatoJenadepRequest {
    private String unidad;
    private String lugar;
    private OffsetDateTime fecha;
    private String hecho;
    private String relato;
    private Long memo;
}
