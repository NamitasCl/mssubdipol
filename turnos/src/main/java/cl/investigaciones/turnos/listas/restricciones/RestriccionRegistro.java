package cl.investigaciones.turnos.listas.restricciones;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

public class RestriccionRegistro {
    private static final Map<String, RestriccionDescriptor> restricciones = new HashMap<>();
    //Inicializador estático
    static {
        restricciones.put("dias_consecutivos",
                new RestriccionDescriptor(
                        "dias_consecutivos", "No asignar días consecutivos",
                        "Impide asignar turnos en días seguidos al mismo funcionario.",
                        true, "Días de separación"));

        restricciones.put("antiguedad_minima",
                new RestriccionDescriptor(
                        "antiguedad_minima", "Antigüedad mínima",
                        "Solo pueden asignarse funcionarios con al menos X años de antigüedad.",
                        true, "Años de antigüedad"));

        restricciones.put("dias_no_disponible",
                new RestriccionDescriptor(
                        "dias_no_disponible", "Evitar días no disponibles",
                        "No asignar turnos en días donde el funcionario está marcado como no disponible.",
                        false, null));

        restricciones.put("repeticion_dia_funcionario",
                new RestriccionDescriptor(
                        "repeticion_dia_funcionario", "Un solo turno por día",
                        "Impide que un funcionario reciba más de un turno por día.",
                        false, null));

        restricciones.put("separacion_minima_turnos",
                new RestriccionDescriptor(
                        "separacion_minima_turnos", "Separación mínima entre turnos",
                        "Obliga a dejar al menos X días entre los turnos de un funcionario.",
                        true, "Días mínimos"));

        restricciones.put("por_grado",
                new RestriccionDescriptor(
                        "por_grado", "Solo para grados específicos",
                        "Solo pueden asignarse funcionarios con uno de los grados requeridos.",
                        true, "Grados permitidos (lista)"));

        restricciones.put("max_turnos_finde",
                new RestriccionDescriptor(
                        "max_turnos_finde", "Máx. turnos fines de semana",
                        "Limita la cantidad de turnos que un funcionario puede tener en sábado/domingo.",
                        true, "Cantidad máxima"));

        restricciones.put("ayudante_menor_encargado",
                new RestriccionDescriptor(
                        "ayudante_menor_encargado", "Ayudante debe ser menos antiguo que el encargado",
                        "El ayudante asignado debe tener menor antigüedad que el encargado del mismo turno.",
                        false, null));
    }

    // Obtener todos los descriptores
    public static Collection<RestriccionDescriptor> getDescriptores() {
        return restricciones.values();
    }

    // Obtener descriptor por clave
    public static Optional<RestriccionDescriptor> getDescriptor(String clave) {
        return Optional.ofNullable(restricciones.get(clave));
    }
}
