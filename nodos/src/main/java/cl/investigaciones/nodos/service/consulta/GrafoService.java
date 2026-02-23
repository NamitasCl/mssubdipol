package cl.investigaciones.nodos.service.consulta;

import cl.investigaciones.nodos.dto.consulta.*;
import cl.investigaciones.nodos.dto.grafos.EnlaceDTO;
import cl.investigaciones.nodos.dto.grafos.GrafoDTO;
import cl.investigaciones.nodos.dto.grafos.NodoDTO;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GrafoService {

    public GrafoDTO armarGrafo(FichaPersonaResponse persona) {
        GrafoDTO grafo = new GrafoDTO();
        String personaId = "persona:" + persona.getRut();

        // Usamos un Map para deduplicar nodos por ID de forma segura
        Map<String, NodoDTO> nodosMap = new LinkedHashMap<>();

        // Nodo Persona principal
        nodosMap.put(personaId, new NodoDTO(personaId, persona.getNombre() + " " + persona.getApellidoPat(), "persona", persona));

        for (FichaMemoDTO memo : persona.getMemos()) {
            String memoId = "memo:" + memo.getId();
            nodosMap.put(memoId, new NodoDTO(memoId, memo.getFormulario(), "memo", memo));
            grafo.getLinks().add(new EnlaceDTO(personaId, memoId, "relacionado"));
            agregarNodosDeMemo(nodosMap, grafo, memo, memoId);
        }

        grafo.setNodes(nodosMap.values().stream().toList());
        return grafo;
    }

    public GrafoDTO armarGrafoDesdeVehiculo(FichaVehiculoResponse vehiculo) {
        GrafoDTO grafo = new GrafoDTO();
        String label = (vehiculo.getPatente() != null ? vehiculo.getPatente() : "Vehículo")
                + (vehiculo.getMarca() != null ? " - " + vehiculo.getMarca() : "")
                + (vehiculo.getModelo() != null ? " " + vehiculo.getModelo() : "");
        String vehiculoId = "vehiculo:" + vehiculo.getPatente();

        Map<String, NodoDTO> nodosMap = new LinkedHashMap<>();

        // Nodo Vehículo principal
        nodosMap.put(vehiculoId, new NodoDTO(vehiculoId, label, "vehiculo", vehiculo));

        for (FichaMemoDTO memo : vehiculo.getMemos()) {
            String memoId = "memo:" + memo.getId();
            nodosMap.put(memoId, new NodoDTO(memoId, memo.getFormulario(), "memo", memo));
            grafo.getLinks().add(new EnlaceDTO(vehiculoId, memoId, "involucrado en"));
            agregarNodosDeMemo(nodosMap, grafo, memo, memoId);
        }

        grafo.setNodes(nodosMap.values().stream().toList());
        return grafo;
    }

    private void agregarNodosDeMemo(Map<String, NodoDTO> nodosMap, GrafoDTO grafo, FichaMemoDTO memo, String memoId) {

        // Personas involucradas
        for (FichaPersonaSimpleDTO per : memo.getFichaPersonas()) {
            String perId = "persona:" + per.getRut();
            nodosMap.putIfAbsent(perId, new NodoDTO(perId, per.getNombre() + " " + per.getApellidoPat(), "persona", per));
            grafo.getLinks().add(new EnlaceDTO(memoId, perId, "involucra"));
        }

        // Armas
        for (FichaArmaDTO arma : memo.getFichaArmas()) {
            String armaId = "arma:" + arma.getSerieArma();
            nodosMap.putIfAbsent(armaId, new NodoDTO(armaId, arma.getMarcaArma() + " " + arma.getTipoArma(), "arma", arma));
            grafo.getLinks().add(new EnlaceDTO(memoId, armaId, "incautó"));
        }

        // Dineros
        for (FichaDineroDTO dinero : memo.getFichaDineros()) {
            String dineroId = "dinero:" + dinero.getId();
            nodosMap.putIfAbsent(dineroId, new NodoDTO(dineroId, "Dinero $" + dinero.getMonto(), "dinero", dinero));
            grafo.getLinks().add(new EnlaceDTO(memoId, dineroId, "incautó"));
        }

        // Drogas
        for (FichaDrogaDTO droga : memo.getFichaDrogas()) {
            String drogaId = "droga:" + droga.getId();
            nodosMap.putIfAbsent(drogaId, new NodoDTO(drogaId, droga.getTipoDroga() + " (" + droga.getCantidadDroga() + ")", "droga", droga));
            grafo.getLinks().add(new EnlaceDTO(memoId, drogaId, "incautó"));
        }

        // Funcionarios
        for (FichaFuncionarioDTO funcionario : memo.getFichaFuncionarios()) {
            String funId = "funcionario:" + funcionario.getId();
            nodosMap.putIfAbsent(funId, new NodoDTO(funId, funcionario.getFuncionario(), "funcionario", funcionario));
            grafo.getLinks().add(new EnlaceDTO(memoId, funId, funcionario.getResponsabilidadMemo()));
        }

        // Municiones
        for (FichaMunicionDTO muni : memo.getFichaMuniciones()) {
            String muniId = "municion:" + muni.getId();
            nodosMap.putIfAbsent(muniId, new NodoDTO(muniId, "Munición", "municion", muni));
            grafo.getLinks().add(new EnlaceDTO(memoId, muniId, "incautó"));
        }

        // Vehículos
        for (FichaVehiculoDTO vehiculo : memo.getFichaVehiculos()) {
            String vehId = "vehiculo:" + vehiculo.getPatente();
            nodosMap.putIfAbsent(vehId, new NodoDTO(vehId, vehiculo.getPatente(), "vehiculo", vehiculo));
            grafo.getLinks().add(new EnlaceDTO(memoId, vehId, "involucra"));
        }

        // Otras especies
        for (FichaOtrasEspeciesDTO especie : memo.getFichaOtrasEspecies()) {
            String espId = "especie:" + especie.getId();
            String label = especie.getDescripcion() != null ? especie.getDescripcion() : "Especie";
            nodosMap.putIfAbsent(espId, new NodoDTO(espId, label, "especie", especie));
            grafo.getLinks().add(new EnlaceDTO(memoId, espId, "incautó"));
        }
    }
}
