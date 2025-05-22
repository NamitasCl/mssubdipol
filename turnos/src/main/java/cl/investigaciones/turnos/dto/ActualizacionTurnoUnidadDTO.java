package cl.investigaciones.turnos.dto;

import lombok.Data;

@Data
public class ActualizacionTurnoUnidadDTO {
    private int dia;
    private int mes;
    private int anio;
    private String diaSemana;
    private FuncionarioNuevo funcionarioNuevo;
    private FuncionarioOriginal funcionarioOriginal;
    private String nombreTurno;

    @Data
    public static class FuncionarioNuevo{
        private String label; // Nombre del funcionario
        private String unidad; // Unidad del funcionario
        private int value; // ifFun del funcionario
    }

    @Data
    public static class FuncionarioOriginal{
        private int antiguedad; // Antiguedad del funcionario
        private int idFuncionario; // ifFun del funcionario
        private String nombreCompleto; // Nombre del funcionario
        private String nombreTurno; // Nombre del turno
        private String siglasCargo; // Siglas del cargo
        private String unidad; // Unidad del funcionario

    }

}
