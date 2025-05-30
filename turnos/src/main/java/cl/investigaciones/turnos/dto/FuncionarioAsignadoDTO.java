package cl.investigaciones.turnos.dto;

import lombok.Data;

import java.util.List;

@Data
public class FuncionarioAsignadoDTO {
    private Long id;
    private int idFuncionario;
    private String nombreCompleto;
    private String siglasCargo;
    private int antiguedad;
    private List<FuncionarioDiasNoDisponibleDTO> diasNoDisponibles;

    public FuncionarioAsignadoDTO() {
    }

    public FuncionarioAsignadoDTO(int id, String nombreCompleto, String siglasCargo, int antiguedad) {
        this.id = id;
        this.nombreCompleto = nombreCompleto;
        this.siglasCargo = siglasCargo;
        this.antiguedad = antiguedad;
    }

    @Override
    public String toString() {
        return "FuncionarioAsignadoDTO{" +
                "id=" + id +
                ", nombreCompleto='" + nombreCompleto + '\'' +
                ", siglasCargo='" + siglasCargo + '\'' +
                ", antiguedad=" + antiguedad +
                ", funcionarioDiasNoDisponible=" + diasNoDisponibles +
                '}';
    }


}
