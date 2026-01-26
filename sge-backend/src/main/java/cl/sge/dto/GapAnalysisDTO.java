package cl.sge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * DTO for gap analysis reporting.
 * Shows required vs assigned resources per region/solicitud.
 */
@Data
@AllArgsConstructor
public class GapAnalysisDTO {
    private String region;
    private Integer funcionariosRequeridos;
    private Integer funcionariosAsignados;
    private Integer vehiculosRequeridos;
    private Integer vehiculosAsignados;
    private String estado;
    
    // Computed
    public Integer getGapFuncionarios() {
        return funcionariosRequeridos - funcionariosAsignados;
    }
    
    public Integer getGapVehiculos() {
        return vehiculosRequeridos - vehiculosAsignados;
    }
    
    public Double getPorcentajeCumplimiento() {
        int total = funcionariosRequeridos + vehiculosRequeridos;
        int asignados = funcionariosAsignados + vehiculosAsignados;
        return total > 0 ? (double) asignados / total * 100 : 0.0;
    }
}
