package cl.investigaciones.commonservices.dto;

import lombok.Data;

import java.util.List;

@Data
public class ConsultaUnidadWrapperDTO {
    private int code;
    private boolean success;
    private String description;
    private List<ConsultaUnidadDto> result;
}
