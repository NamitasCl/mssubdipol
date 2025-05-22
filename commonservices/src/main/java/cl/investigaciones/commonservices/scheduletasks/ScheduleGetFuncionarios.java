package cl.investigaciones.commonservices.scheduletasks;

import cl.investigaciones.commonservices.service.FuncionariosService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ScheduleGetFuncionarios {

    private static final Logger log = LoggerFactory.getLogger(ScheduleGetFuncionarios.class);
    private final FuncionariosService funcionarioService;

    public ScheduleGetFuncionarios(FuncionariosService funcionarioService) {
        this.funcionarioService = funcionarioService;
    }

    //@Scheduled(cron = "*/30 * * * * *")
    public void scheduleGetFuncionarios() {

        log.info("Iniciando scheduleGetFuncionarios");

        try {
            funcionarioService.cronSaveFuncionarios();
            log.info("Tarea ejecutada correctamente.");
        } catch (Exception e) {
            log.error("Error al ejecutar tarea: " + e);
        }




    }

}
