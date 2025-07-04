package cl.investigaciones.turnos.common;

import cl.investigaciones.turnos.restriccion.implementaciones.restricciones.*;
import cl.investigaciones.turnos.restriccion.interfaces.Restriccion;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class RestriccionFactory {
    public static List<Restriccion> fromJsonConfig(String jsonConfig) {
        List<Restriccion> restricciones = new ArrayList<>();
        ObjectMapper mapper = new ObjectMapper();
        try {
            Map<String, Map<String,Object>> config = mapper.readValue(jsonConfig, Map.class);

            // RestriccionMaximoTurnos
            if (Boolean.TRUE.equals(config.getOrDefault("maxTurnosPorMes", Map.of()).get("activa"))) {
                restricciones.add(new RestriccionMaximoTurnos(
                        (Integer) config.get("maxTurnosPorMes").get("valor")
                ));
            }

            // RestriccionMaximoTurnosFinDeSemana
            if (Boolean.TRUE.equals(config.getOrDefault("maxTurnosFinDeSemana", Map.of()).get("activa"))) {
                restricciones.add(new RestriccionMaximoTurnosFinDeSemana(
                        (Integer) config.get("maxTurnosFinDeSemana").get("valor")
                ));
            }

            // RestriccionMaxUnaNochePorSemana
            if (Boolean.TRUE.equals(config.getOrDefault("maxUnaNochePorSemana", Map.of()).get("activa"))) {
                restricciones.add(new RestriccionMaxUnaNochePorSemana());
            }

            // RestriccionNochesConsecutivas
            if (Boolean.TRUE.equals(config.getOrDefault("nochesConsecutivas", Map.of()).get("activa"))) {
                Map<String, Object> nochesConsec = config.get("nochesConsecutivas");
                int valor = (Integer) nochesConsec.get("valor");
                String palabraClave = (String) nochesConsec.getOrDefault("palabraClave", "noche");
                restricciones.add(new RestriccionNochesConsecutivas(palabraClave, valor));
            }

            // RestriccionSeparacionDias
            if (Boolean.TRUE.equals(config.getOrDefault("separacionDias", Map.of()).get("activa"))) {
                restricciones.add(new RestriccionSeparacionDias(
                        (Integer) config.get("separacionDias").get("valor")
                ));
            }

            // RestriccionUnSoloRolPorServicio
            if (Boolean.TRUE.equals(config.getOrDefault("unSoloRolPorServicio", Map.of()).get("activa"))) {
                restricciones.add(new RestriccionUnSoloRolPorServicio());
            }

            // RestriccionJerarquiaRolServicio
            if (Boolean.TRUE.equals(config.getOrDefault("jerarquiaRolServicio", Map.of()).get("activa"))) {
                restricciones.add(new RestriccionJerarquiaRolServicio());
            }

            // RestriccionNoDisponible
            if (Boolean.TRUE.equals(config.getOrDefault("noDisponible", Map.of()).get("activa"))) {
                restricciones.add(new RestriccionNoDisponible());
            }

        } catch (Exception e) {
            throw new RuntimeException("Error al leer configuración de restricciones: " + e.getMessage(), e);
        }

        return restricciones;
    }
}
