package cl.investigaciones.commonservices.scheduletasks;

import cl.investigaciones.commonservices.service.UnidadesService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ScheduleGetUnidades {

    private static final Logger log = LoggerFactory.getLogger(ScheduleGetUnidades.class);

    private final UnidadesService unidadesService;

    public ScheduleGetUnidades(UnidadesService unidadesService) {
        this.unidadesService = unidadesService;
    }

    //@Scheduled(cron = "*/30 * * * * *")
    public void scheduleGetUnidades() {

        log.info("Iniciando scheduleGetUnidades");

        try {
            unidadesService.cronSaveUnidad();
            log.info("Tarea ejecutada correctamente.");
        } catch (Exception e) {
            log.error("Error al ejecutar tarea: " + e);
        }




    }

}
