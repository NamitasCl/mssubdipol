package cl.investigaciones.turnosv2.dto;

import lombok.Data;

import java.util.List;

@Data
public class AsignarPlantillaDTO {
    private List<Long> diaIds;
    private Long plantillaId;
}