package cl.investigaciones.nodos.config;

import com.fasterxml.jackson.databind.Module;
import com.fasterxml.jackson.datatype.hibernate5.jakarta.Hibernate5JakartaModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    @Bean
    public Module hibernate5Module() {
        Hibernate5JakartaModule module = new Hibernate5JakartaModule();
        // No forzar la carga de relaciones LAZY
        module.disable(Hibernate5JakartaModule.Feature.FORCE_LAZY_LOADING);
        // Reemplazar colecciones persistentes con colecciones estándar para una mejor serialización
        module.enable(Hibernate5JakartaModule.Feature.REPLACE_PERSISTENT_COLLECTIONS);
        return module;
    }
}
