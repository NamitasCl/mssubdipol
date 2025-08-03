package cl.investigaciones.commonservices.dto;

import lombok.Data;

@Data
public class DelitoResponseDto {
    private Long id;
    private String delito;
    private String familia;
    private int codigo;
}
