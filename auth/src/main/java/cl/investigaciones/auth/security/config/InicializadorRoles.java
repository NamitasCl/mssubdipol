package cl.investigaciones.auth.security.config;

import cl.investigaciones.auth.model.Rol;
import cl.investigaciones.auth.repository.RolRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class InicializadorRoles implements CommandLineRunner {

    private final RolRepository rolRepository;

    public InicializadorRoles(RolRepository rolRepository) {
        this.rolRepository = rolRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Inicializando roles...");
        // Existing roles
        crearRolSiNoExiste("ROLE_JEFE");
        crearRolSiNoExiste("ROLE_SUBJEFE");
        crearRolSiNoExiste("ROLE_FUNCIONARIO");
        crearRolSiNoExiste("ROLE_ADMINISTRADOR");
        crearRolSiNoExiste("ROLE_TURNOS");
        crearRolSiNoExiste("ROLE_TURNOS_RONDA");
        crearRolSiNoExiste("ROLE_REVISOR");
        crearRolSiNoExiste("ROLE_JENADEP");
        
        // SGE-specific roles for delegation flow
        crearRolSiNoExiste("ROLE_DIRECTOR");   // Dashboard view only, national scope
        crearRolSiNoExiste("ROLE_PM_SUB");     // Plana Mayor Subdirección - creates events
        crearRolSiNoExiste("ROLE_PM_REG");     // Plana Mayor Regional - manages region resources
    }

    private void crearRolSiNoExiste(String rol) {
        rolRepository.findByNombre(rol).orElseGet(
                () -> {
                    Rol nuevoRol = new Rol();
                    nuevoRol.setNombre(rol);
                    return rolRepository.save(nuevoRol);
                }
        );
    }
}
