package cl.investigaciones.auth.security.config;

import cl.investigaciones.auth.model.Permiso;
import cl.investigaciones.auth.repository.PermisosRepository;
import org.springframework.boot.CommandLineRunner;

public class InicializadorPermisos implements CommandLineRunner {

    PermisosRepository permisosRepository;

    public InicializadorPermisos(PermisosRepository permisosRepository) {
        this.permisosRepository = permisosRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("Inicializando roles...");
        crearPermisoSiNoExiste("REGISTRO_VER");
        crearPermisoSiNoExiste("REGISTRO_CREAR");
        crearPermisoSiNoExiste("REGISTRO_EDITAR");
        crearPermisoSiNoExiste("EXPORTAR_EXCEL");

    }

    private void crearPermisoSiNoExiste(String permiso) {
        permisosRepository.findByNombre(permiso).orElseGet(
                () -> {
                    Permiso nuevoPermiso = new Permiso();
                    nuevoPermiso.setNombre(permiso);
                    return permisosRepository.save(nuevoPermiso);
                }
        );
    }
}
