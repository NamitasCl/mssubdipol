package cl.investigaciones.nodos.dto.consulta;

import lombok.Data;

import java.time.OffsetDateTime;
import java.util.Set;

@Data
public class FichaPersonaEstadisticaDTO {
    // Datos de persona (únicos)
    private String rut;
    private String nombre;
    private String apellidoPat;
    private String apellidoMat;
    private Set<String> estados; // calidades si existen

    // Referencia al memo
    private Long memoId;
    private String memoFolio; // folioBrain
    private String memoRuc;
    private OffsetDateTime memoFecha;
    private String memoUnidad;
    private String memoFormulario;
}
