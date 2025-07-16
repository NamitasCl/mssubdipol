package cl.investigaciones.nodos.dto.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.listas.ListaMarca;
import cl.investigaciones.nodos.domain.entidadesconsulta.listas.ListaModelo;
import lombok.Data;

@Data
public class FichaVehiculoDTO {
    private Long id;
    private String patente;
    private String marca;
    private String modelo;
    private String calidad;
    private String obs;
}
