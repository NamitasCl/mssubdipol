package cl.investigaciones.nodos.dto.consulta;

import lombok.Data;

import java.util.List;

@Data
public class EstadisticasExportDTO {
    private List<FichaPersonaEstadisticaDTO> personas;
    private List<FichaArmaEstadisticaDTO> armas;
    private List<FichaDrogaEstadisticaDTO> drogas;
    private List<FichaDineroEstadisticaDTO> dineros;
    private List<FichaVehiculoEstadisticaDTO> vehiculos;
    private List<FichaMunicionEstadisticaDTO> municiones;
    private List<FichaOtrasEspeciesEstadisticaDTO> otrasEspecies;
    private List<FichaMemoEstadisticaDTO> resumenMemos;
}
