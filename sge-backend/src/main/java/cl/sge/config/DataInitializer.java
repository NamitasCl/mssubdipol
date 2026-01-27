package cl.sge.config;

import cl.sge.entity.TipoEvento;
import cl.sge.entity.TipoRecurso;
import cl.sge.entity.TipoVehiculo;
import cl.sge.entity.TipoEspecialidad;
import cl.sge.entity.ModuleConfig;
import cl.sge.repository.TipoEventoRepository;
import cl.sge.repository.TipoRecursoRepository;
import cl.sge.repository.TipoVehiculoRepository;
import cl.sge.repository.TipoEspecialidadRepository;
import cl.sge.repository.ModuleConfigRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(TipoVehiculoRepository vehiculoRepo,
                                      TipoRecursoRepository recursoRepo,
                                      TipoEventoRepository eventoRepo,
                                      TipoEspecialidadRepository especialidadRepo,
                                      ModuleConfigRepository moduleRepo) {
        return args -> {
            // Seed TipoVehiculo
            if (vehiculoRepo.count() == 0) {
                List<String> vehiculos = Arrays.asList(
                        "Radio Patrulla", "Furgón Z", "Camioneta 4x4", "Retén Móvil",
                        "Bus", "Motocicleta", "Helicóptero", "Lancha", "Dron", "Blindado"
                );
                vehiculos.forEach(nombre -> {
                    TipoVehiculo t = new TipoVehiculo();
                    t.setNombre(nombre);
                    vehiculoRepo.save(t);
                });
            }

            // Seed TipoRecurso
            if (recursoRepo.count() == 0) {
                List<String> recursos = Arrays.asList(
                        "Energía", "Vehículos", "Herramientas", "Comunicaciones",
                        "Campamento", "Tecnología", "Insumos Médicos", "Alimentación", "Otro"
                );
                recursos.forEach(nombre -> {
                    TipoRecurso t = new TipoRecurso();
                    t.setNombre(nombre);
                    recursoRepo.save(t);
                });
            }

            // Seed TipoEvento
            if (eventoRepo.count() == 0) {
                List<String> eventos = Arrays.asList(
                        "Incendio", "Terremoto", "Inundación", "Accidente Vehicular",
                        "Orden Público", "Rescate", "Operativo Especial", "Otro"
                );
                eventos.forEach(nombre -> {
                    TipoEvento t = new TipoEvento();
                    t.setNombre(nombre);
                    eventoRepo.save(t);
                });
            }

            // Seed TipoEspecialidad
            if (especialidadRepo.count() == 0) {
                List<String> especialidades = Arrays.asList(
                        "AUDITOR", "ENFERMERO", "PARAMEDICO", "MEDICO", "ABOGADO",
                        "PSICOLOGO", "KINESIOLOGO", "INGENIERO", "TECNICO",
                        "BOMBERO", "DRON", "OTRO"
                );
                especialidades.forEach(nombre -> {
                    TipoEspecialidad t = new TipoEspecialidad();
                    t.setNombre(nombre);
                    especialidadRepo.save(t);
                });
            }

            // Seed ModuleConfig (Restore missing modules)
            // Seed/Update ModuleConfig
            // We do not check count() == 0 because we want to update roles if they are missing or incorrect
            
            // SGE Module
            ModuleConfig sge = new ModuleConfig();
            sge.setModuleKey("sge");
            sge.setTitle("Gestión de Emergencias (SGE)");
            sge.setDescription("Control y monitoreo de eventos catastróficos, despliegues y logística operativa.");
            sge.setRoute("/sge");
            sge.setIconName("Shield");
            sge.setColor("blue");
            sge.setEnabled(true);
            sge.setAuthorizedRoles(new HashSet<>(Arrays.asList("ROLE_ADMINISTRADOR", "ROLE_JEFE", "ROLE_PM_SUB", "ROLE_PM_REG", "ROLE_FUNCIONARIO"))); 
            moduleRepo.save(sge);

            // Turnos Module
            ModuleConfig turnos = new ModuleConfig();
            turnos.setModuleKey("turnos");
            turnos.setTitle("Gestión de Turnos");
            turnos.setDescription("Planificación mensual de personal, asignaciones y control de dotación.");
            turnos.setRoute("/layout");
            turnos.setIconName("Calendar");
            turnos.setColor("emerald");
            turnos.setEnabled(true);
            turnos.setAuthorizedRoles(new HashSet<>(Arrays.asList("ROLE_ADMINISTRADOR", "ROLE_JEFE", "ROLE_SECUIN", "ROLE_SUBJEFE", "ROLE_FUNCIONARIO")));
            moduleRepo.save(turnos);

            // Formularios Module
            ModuleConfig forms = new ModuleConfig();
            forms.setModuleKey("formularios");
            forms.setTitle("Formularios");
            forms.setDescription("Solicitud y gestión de formularios dinámicos.");
            forms.setRoute("/formularios");
            forms.setIconName("ClipboardList");
            forms.setColor("amber");
            forms.setEnabled(true);
            forms.setAuthorizedRoles(new HashSet<>(Arrays.asList("ROLE_ADMINISTRADOR", "ROLE_SECUIN", "ROLE_JEFE")));
            moduleRepo.save(forms);

            // Auditoría Module
            ModuleConfig auditoria = new ModuleConfig();
            auditoria.setModuleKey("auditoria");
            auditoria.setTitle("Auditoría de Servicios");
            auditoria.setDescription("Visualización de memos y auditoría de servicios especiales.");
            auditoria.setRoute("/auditoria");
            auditoria.setIconName("FileText"); // Using FileText as it's a generic document/audit icon
            auditoria.setColor("indigo");
            auditoria.setEnabled(true);
            auditoria.setAuthorizedRoles(new HashSet<>(Arrays.asList("ROLE_ADMINISTRADOR", "ROLE_JEFE")));
            moduleRepo.save(auditoria);

            // Admin Module
            ModuleConfig admin = new ModuleConfig();
            admin.setModuleKey("admin");
            admin.setTitle("Administración");
            admin.setDescription("Configuración global del sistema, usuarios y auditoría.");
            admin.setRoute("/admin");
            admin.setIconName("Settings");
            admin.setColor("slate");
            admin.setEnabled(true);
            admin.setAuthorizedRoles(new HashSet<>(Collections.singletonList("ROLE_ADMINISTRADOR")));
            moduleRepo.save(admin);
        };
    }
}
