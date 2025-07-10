package cl.investigaciones.nodos.service.consulta;

import cl.investigaciones.nodos.dto.consulta.*;
import cl.investigaciones.nodos.dto.grafos.EnlaceDTO;
import cl.investigaciones.nodos.dto.grafos.GrafoDTO;
import cl.investigaciones.nodos.dto.grafos.NodoDTO;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class GrafoService {

    public GrafoDTO armarGrafo(FichaPersonaResponse persona) {
        GrafoDTO grafo = new GrafoDTO();
        String personaId = "persona:" + persona.getId();

        // Nodo Persona principal
        grafo.getNodes().add(new NodoDTO(personaId, persona.getNombre() + " " + persona.getApellidoPat(), "persona"));

        for (FichaMemoDTO memo : persona.getMemos()) {
            String memoId = "memo:" + memo.getId();
            // Nodo Memo
            grafo.getNodes().add(new NodoDTO(memoId, memo.getFormulario(), "memo"));
            // Enlace Persona - Memo
            grafo.getLinks().add(new EnlaceDTO(personaId, memoId, "relacionado"));

            // Personas involucradas
            for (FichaPersonaSimpleDTO per : memo.getFichaPersonas()) {
                String perId = "persona:" + per.getId();
                grafo.getNodes().add(new NodoDTO(perId, per.getNombre() + " " + per.getApellidoPat(), "persona"));
                grafo.getLinks().add(new EnlaceDTO(memoId, perId, "involucra"));
            }

            // Armas
            for (FichaArmaDTO arma : memo.getFichaArmas()) {
                String armaId = "arma:" + arma.getSerieArma();
                grafo.getNodes().add(new NodoDTO(armaId, arma.getMarcaArma() + " " + arma.getTipoArma(), "arma"));
                grafo.getLinks().add(new EnlaceDTO(memoId, armaId, "incautó"));
            }

            // Dineros
            for (FichaDineroDTO dinero : memo.getFichaDineros()) {
                String dineroId = "dinero:" + dinero.getId();
                grafo.getNodes().add(new NodoDTO(dineroId, "Dinero $" + dinero.getMonto(), "dinero"));
                grafo.getLinks().add(new EnlaceDTO(memoId, dineroId, "incautó"));
            }

            // Drogas
            for (FichaDrogaDTO droga : memo.getFichaDrogas()) {
                String drogaId = "droga:" + droga.getId();
                grafo.getNodes().add(new NodoDTO(drogaId, droga.getTipoDroga() + " (" + droga.getCantidadDroga() + ")", "droga"));
                grafo.getLinks().add(new EnlaceDTO(memoId, drogaId, "incautó"));
            }

            // Funcionarios
            for (FichaFuncionarioDTO funcionario : memo.getFichaFuncionarios()) {
                String funId = "funcionario:" + funcionario.getId();
                grafo.getNodes().add(new NodoDTO(funId, funcionario.getFuncionario(), "funcionario"));
                grafo.getLinks().add(new EnlaceDTO(memoId, funId, funcionario.getResponsabilidadMemo()));
            }

            // Municiones
            for (FichaMunicionDTO muni : memo.getFichaMuniciones()) {
                String muniId = "municion:" + muni.getId();
                grafo.getNodes().add(new NodoDTO(muniId, "Munición", "municion"));
                grafo.getLinks().add(new EnlaceDTO(memoId, muniId, "incautó"));
            }

            // Vehículos
            for (FichaVehiculoDTO vehiculo : memo.getFichaVehiculos()) {
                String vehId = "vehiculo:" + vehiculo.getId();
                grafo.getNodes().add(new NodoDTO(vehId, vehiculo.getPatente(), "vehiculo"));
                grafo.getLinks().add(new EnlaceDTO(memoId, vehId, "involucra"));
            }
        }
        // Opcional: Quitar nodos duplicados por id
        grafo.setNodes(grafo.getNodes().stream().distinct().collect(Collectors.toList()));
        return grafo;
    }


}
