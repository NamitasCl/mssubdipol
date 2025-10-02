package cl.investigaciones.nodos.dto.consulta;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class FichaSitioSucesoDTO {
    private Long id;
    private OffsetDateTime fechaConcurrenciaSs;
    private String calle;
    private String numero;
    private String depto;
    private String block;
    private String comuna;
    private String region;
    private String tipoSitioSuceso;
}
