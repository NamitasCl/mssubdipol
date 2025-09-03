package cl.investigaciones.nodos.dto.serviciosespeciales;

import lombok.Data;

import java.util.List;

@Data
public class RegistroPersonasServEspDTO {

    private Long id;
    private String rut;
    private String sexo;
    private String edad;
    private String nacionalidad;
    private String tipoMemo; //O/A Flagrancia Arresto
    private List<String> delitosAsociados;
    private String jefaturaUnidadQueDetiene;
    private String regionJefaturaQueDetiene;
    private String unidadQueDetiene;
    private String regionUnidadQueDetiene;

}
