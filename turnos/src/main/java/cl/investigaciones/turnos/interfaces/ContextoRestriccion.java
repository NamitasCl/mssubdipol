package cl.investigaciones.turnos.interfaces;

public interface ContextoRestriccion {

    /**
     * ¿El funcionario tiene turno asignado en el día dado?
     */
    boolean tieneTurno(int idFuncionario, int dia);

    /**
     * Devuelve el último día en que el funcionario fue asignado a un turno,
     * o null si no tiene turnos asignados.
     */
    Integer ultimoDiaAsignado(int idFuncionario);

    /**
     * ¿El funcionario está marcado como no disponible ese día?
     */
    boolean estaMarcadoNoDisponible(int idFuncionario, int dia);

    /**
     * ¿El funcionario está asignado como ayudante y hay un encargado más antiguo?
     * (para RestriccionAyudanteMenorEncargado)
     */
    boolean existeEncargadoMasAntiguo(int idFuncionario, int dia);

    /**
     * Devuelve el total de turnos asignados al funcionario entre dos días (inclusive).
     */
    int contarTurnosEnRango(int idFuncionario, int diaInicio, int diaFin);

    /**
     * ¿El funcionario tiene un turno el día anterior o siguiente a "dia"?
     * (útil para separación mínima y consecutividad)
     */
    boolean tieneTurnoCerca(int idFuncionario, int dia, int separacion);

    /**
     * ¿El funcionario tiene más de N turnos en fines de semana?
     */
    int contarTurnosFinDeSemana(int idFuncionario);

    /**
     * ¿El funcionario cumple el grado requerido para el turno?
     */
    boolean tieneGradoPermitido(int idFuncionario, String gradoRequerido);

    /**
     * ¿El funcionario ha sido asignado ya al turno con el mismo nombre ese mes?
     */
    boolean asignadoMismoNombreTurno(int idFuncionario, String nombreTurno, int mes);

    // Métodos adicionales según crezcan las restricciones...
}
