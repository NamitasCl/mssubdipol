package cl.investigaciones.turnos.model;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.*;

@Embeddable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class RolPlantilla {
    private String nombreRol;
    private int cantidad;
    private String gradosPermitidos; // Ej: "SBC,COM,SPF" o null para todos los grados

    // Puedes agregar métodos auxiliares para parsear
    public Set<String> getSetGradosPermitidos() {
        if (gradosPermitidos == null || gradosPermitidos.trim().isEmpty())
            return Collections.emptySet();
        return new HashSet<>(Arrays.asList(gradosPermitidos.split(",")));
    }
}

