package cl.investigaciones.turnos.service;

import cl.investigaciones.turnos.model.FuncionarioDiasNoDisponible;
import cl.investigaciones.turnos.repository.FuncionarioDiasNoDisponibleRepository;
import org.springframework.stereotype.Service;

@Service
public class FuncionarioDiasNoDisponibleService {

    private final FuncionarioDiasNoDisponibleRepository funcionarioDiasNoDisponibleRepository;

    public FuncionarioDiasNoDisponibleService(FuncionarioDiasNoDisponibleRepository funcionarioDiasNoDisponibleRepository) {
        this.funcionarioDiasNoDisponibleRepository = funcionarioDiasNoDisponibleRepository;
    }

    public void save(FuncionarioDiasNoDisponible funcionarioDiasNoDisponible) {
        try {
            funcionarioDiasNoDisponibleRepository.save(funcionarioDiasNoDisponible);
        } catch (Exception e) {
            System.out.println("Error al guardar días no disponibles de funcionario: " + e.getMessage());
        }
    }
}
