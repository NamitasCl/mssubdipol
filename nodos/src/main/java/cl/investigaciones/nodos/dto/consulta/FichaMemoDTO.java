package cl.investigaciones.nodos.dto.consulta;

import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;

@Data
public class FichaMemoDTO {
    private Long id;
    private String formulario;
    private OffsetDateTime fecha;
    private String folioBrain;
    private String ruc;
    private String modusDescripcion;
    private ListaUnidadDTO unidad;

    private List<FichaPersonaSimpleDTO> fichaPersonas;
    private List<FichaArmaDTO> fichaArmas;
    private List<FichaDineroDTO> fichaDineros;
    private List<FichaDrogaDTO> fichaDrogas;
    private List<FichaFuncionarioDTO> fichaFuncionarios;
    private List<FichaMunicionDTO> fichaMuniciones;
    private List<FichaVehiculoDTO> fichaVehiculos;
    private List<FichaOtrasEspeciesDTO> fichaOtrasEspecies;

}
