package cl.investigaciones.nodos.dto.serviciosespeciales;

import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;

@Data
public class FichaMemoRequestDTO {
    // Expect ISO-8601 instants with offset (e.g., 2025-09-01T04:00:00Z)
    private OffsetDateTime fechaInicioUtc;
    private OffsetDateTime fechaTerminoUtc;
    private String tipoFecha;
    private String tipoMemo;
    private String region;
    private String unidad;
    private List<String> unidades;
    private List<Long> memoIds;
    private List<Long> identificadoresUnidades;

    // Nuevo filtro opcional para mostrar solo memos con personas detenidas
    private Boolean filtroDetenidos;

    public Boolean getFiltroDetenidos() {
        return filtroDetenidos;
    }

    public void setFiltroDetenidos(Boolean filtroDetenidos) {
        this.filtroDetenidos = filtroDetenidos;
    }
}
