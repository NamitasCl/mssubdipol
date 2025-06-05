package cl.investigaciones.turnos.listas.restricciones;

import lombok.Getter;

// RestriccionDescriptor.java
@Getter
public class RestriccionDescriptor {
    private final String nombre;
    private final String displayName;
    private final String descripcion;
    private final boolean requiereParametro;
    private final String nombreParametro; // ej: "Cantidad de días"
    // Puedes agregar más

    public RestriccionDescriptor(String nombre, String displayName, String descripcion, boolean requiereParametro, String nombreParametro) {
        this.nombre = nombre;
        this.displayName = displayName;
        this.descripcion = descripcion;
        this.requiereParametro = requiereParametro;
        this.nombreParametro = nombreParametro;
    }
}

