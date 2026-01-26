package cl.sge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

/**
 * DTO for heat map visualization.
 * Returns GeoJSON FeatureCollection format.
 */
@Data
@AllArgsConstructor
public class HeatMapDataDTO {
    private String type; // "FeatureCollection"
    private List<HeatMapFeature> features;
    
    @Data
    @AllArgsConstructor
    public static class HeatMapFeature {
        private String type; // "Feature"
        private Geometry geometry;
        private Properties properties;
    }
    
    @Data
    @AllArgsConstructor
    public static class Geometry {
        private String type; // "Point"
        private double[] coordinates; // [lon, lat]
    }
    
    @Data
    @AllArgsConstructor
    public static class Properties {
        private String tipo;           // "funcionario", "vehiculo", "equipamiento"
        private String identificador;  // RUT or Sigla
        private String nombre;
        private String unidadOrigen;
        private int intensidad;        // Weight for heat map (1-10)
    }
}
