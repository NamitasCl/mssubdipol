package cl.investigaciones.turnos.calendar.service;

import cl.investigaciones.turnos.calendar.domain.DiaNoDisponibleGlobal;
import cl.investigaciones.turnos.calendar.domain.FuncionarioAportadoDiasNoDisponible;
import cl.investigaciones.turnos.calendar.domain.FuncionarioAporte;
import cl.investigaciones.turnos.calendar.dto.DiaNoDisponibleDTO;
import cl.investigaciones.turnos.calendar.dto.DiaNoDisponibleGlobalDTO;
import cl.investigaciones.turnos.calendar.dto.DiaNoDisponibleGlobalRequest;
import cl.investigaciones.turnos.calendar.dto.DiaNoDisponibleGlobalResponse;
import cl.investigaciones.turnos.calendar.repository.FuncionarioAportadoDiasNoDisponibleRepository;
import cl.investigaciones.turnos.calendar.repository.FuncionarioDiaNoDisponibleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class FuncionarioDiaNoDisponibleService {

    @Autowired
    private FuncionarioDiaNoDisponibleRepository repo;

    @Autowired
    private FuncionarioAportadoDiasNoDisponibleRepository repoAportado;

    public void registrarDiasNoDisponibles(Integer idFuncionario, DiaNoDisponibleGlobalRequest dias) {
        for (DiaNoDisponibleGlobalDTO dto : dias.getDias()) {
            DiaNoDisponibleGlobal entity = new DiaNoDisponibleGlobal();
            entity.setIdFuncionario(idFuncionario);
            entity.setFecha(dto.getFecha());
            entity.setMotivo(dto.getMotivo());
            entity.setDetalle(dto.getDetalle());
            repo.save(entity);
        }
    }

    public DiaNoDisponibleGlobalResponse findByIdFuncionario(Integer idFuncionario) {

        List<DiaNoDisponibleGlobal> consulta = repo.findByIdFuncionario(idFuncionario);
        DiaNoDisponibleGlobalResponse response = new DiaNoDisponibleGlobalResponse();
        response.setIdFuncionario(idFuncionario);
        consulta.forEach(entity -> {
            DiaNoDisponibleGlobalDTO dto = new DiaNoDisponibleGlobalDTO();
            dto.setId(entity.getId());
            dto.setFecha(entity.getFecha());
            dto.setMotivo(entity.getMotivo());
            dto.setDetalle(entity.getDetalle());

            response.getDias().add(dto);
        });

        return response;
    }

    //TODO: Cambiar de Integer a Long para que funcione bien
    public DiaNoDisponibleGlobalResponse findByIdFuncionarioDiaNoDisponible(FuncionarioAporte f) {
        DiaNoDisponibleGlobalResponse response = new DiaNoDisponibleGlobalResponse();
        response.setIdFuncionario(f.getIdFuncionario());
        response.setDias(new ArrayList<>()); // asegurar que no es null

        if (f.getId() == null) {
            System.err.println("Funcionario sin ID persistido: " + f.getNombreCompleto());
            return response;
        }

        List<FuncionarioAportadoDiasNoDisponible> consulta = repoAportado.findByFuncionarioAporte_Id(f.getId());

        for (FuncionarioAportadoDiasNoDisponible entity : consulta) {
            DiaNoDisponibleGlobalDTO dto = new DiaNoDisponibleGlobalDTO();
            dto.setId(entity.getId());
            dto.setFecha(entity.getFecha());
            dto.setMotivo(entity.getMotivo());
            dto.setDetalle(entity.getDetalle());
            response.getDias().add(dto);
        }

        return response;
    }


}

