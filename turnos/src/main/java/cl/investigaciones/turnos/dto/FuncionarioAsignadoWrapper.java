package cl.investigaciones.turnos.dto;

import java.util.List;

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

    public String getUnidad() {
        return unidad;
    }

    public void setUnidad(String unidad) {
        this.unidad = unidad;
    }

    public int getMes() {
        return mes;
    }

    public void setMes(int mes) {
        this.mes = mes;
    }

    public int getAnio() {
        return anio;
    }

    public void setAnio(int anio) {
        this.anio = anio;
    }

    public List<FuncionarioAsignadoDTO> getFuncionarios() {
        return funcionarios;
    }

    public void setFuncionarios(List<FuncionarioAsignadoDTO> funcionarios) {
        this.funcionarios = funcionarios;
    }

    @Override
    public String toString() {
        return "FuncionarioAsignadoWrapper{" +
                "unidad='" + unidad + '\'' +
                ", mes=" + mes +
                ", anio=" + anio +
                ", funcionarios=" + funcionarios +
                '}';
    }
}
