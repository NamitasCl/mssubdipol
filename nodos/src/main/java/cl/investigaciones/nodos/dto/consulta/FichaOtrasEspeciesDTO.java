package cl.investigaciones.nodos.dto.consulta;

import lombok.Data;

@Data
public class FichaOtrasEspeciesDTO {
    private Long id;
    private String calidad;
    private String descripcion;
    private String nue;
    private String cantidad;
    private String avaluo;
    private String utilizadoComoArma; // ✅ CAMBIADO DE Boolean A String
    private String sitioSuceso;
}