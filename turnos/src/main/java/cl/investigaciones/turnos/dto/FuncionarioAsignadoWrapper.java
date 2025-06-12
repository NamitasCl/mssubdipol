package cl.investigaciones.turnos.dto;

import lombok.Data;

import java.util.List;

@Data
public class FuncionarioAsignadoWrapper {
    private String unidad;
    private int mes;
    private int anio;
    List<FuncionarioAsignadoDTO> funcionarios;

    public FuncionarioAsignadoWrapper() {
    }

    public FuncionarioAsignadoWrapper(String unidad, int mes, int anio, List<FuncionarioAsignadoDTO> funcionarios) {
        this.unidad = unidad;
        this.mes = mes;
        this.anio = anio;
        this.funcionarios = funcionarios;
    }
}
