package cl.investigaciones.turnos.service;

import cl.investigaciones.turnos.dto.DiaAsignadoFuncionarioRequest;
import cl.investigaciones.turnos.model.AsignacionFuncionario;
import cl.investigaciones.turnos.model.FuncionarioDiasNoDisponible;
import cl.investigaciones.turnos.repository.AsignacionFuncionarioRepository;
import cl.investigaciones.turnos.repository.FuncionarioDiasNoDisponibleRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service

public class ConsultaDiasAsignadosService {

    private final FuncionarioDiasNoDisponibleRepository funcionarioDiasNoDisponibleRepository;
    private final AsignacionFuncionarioRepository asignacionFuncionarioRepository;

    public ConsultaDiasAsignadosService(FuncionarioDiasNoDisponibleRepository funcionarioDiasNoDisponibleRepository,
                                        AsignacionFuncionarioRepository asignacionFuncionarioRepository) {
        this.funcionarioDiasNoDisponibleRepository = funcionarioDiasNoDisponibleRepository;
        this.asignacionFuncionarioRepository = asignacionFuncionarioRepository;

    }

    public boolean consultaDiaAsignadoFuncionario(DiaAsignadoFuncionarioRequest request) {

        System.out.println("ID FUNCIONARIO: " + request.getIdFuncionario());
        System.out.println("FECHA: " + request.getFecha());

        AsignacionFuncionario funcionarioEncontrado = asignacionFuncionarioRepository.findById(request.getIdFuncionario()).get();

        System.out.println("Funcionario encontrado: " + funcionarioEncontrado.getNombreCompleto());

        boolean resultado = funcionarioDiasNoDisponibleRepository.existePorFechaContenidaOIgual(
                funcionarioEncontrado,
                request.getFecha()
        );

        System.out.println("Resultado de la consulta: " + resultado);


        return false;

    }



}
