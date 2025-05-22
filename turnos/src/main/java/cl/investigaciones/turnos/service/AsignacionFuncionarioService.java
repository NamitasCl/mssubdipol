package cl.investigaciones.turnos.service;

import cl.investigaciones.turnos.dto.FuncionarioAsignadoDTO;
import cl.investigaciones.turnos.dto.FuncionarioDiasNoDisponibleDTO;
import cl.investigaciones.turnos.dto.FuncionariosDisponiblesResponseDTO;
import cl.investigaciones.turnos.model.AsignacionFuncionario;
import cl.investigaciones.turnos.model.FuncionarioDiasNoDisponible;
import cl.investigaciones.turnos.repository.AsignacionFuncionarioRepository;
import cl.investigaciones.turnos.repository.FuncionarioDiasNoDisponibleRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AsignacionFuncionarioService {

    private final AsignacionFuncionarioRepository asignacionFuncionarioRepository;
    private final FuncionarioDiasNoDisponibleRepository funcionarioDiasNoDisponibleRepository;

    public AsignacionFuncionarioService(AsignacionFuncionarioRepository asignacionFuncionarioRepository,
                                         FuncionarioDiasNoDisponibleRepository funcionarioDiasNoDisponibleRepository) {
        this.asignacionFuncionarioRepository = asignacionFuncionarioRepository;
        this.funcionarioDiasNoDisponibleRepository = funcionarioDiasNoDisponibleRepository;
    }

    public void save(AsignacionFuncionario asignacionFuncionario) {
        try {
            asignacionFuncionarioRepository.save(asignacionFuncionario);
        } catch (Exception e) {
            System.out.println("Error al guardar asignación de funcionario: " + e.getMessage());
        }
    }

    public List<FuncionarioAsignadoDTO> getAsignacionesConDiasNoDisponibles(int mes, int anio, String unidad) {
        List<AsignacionFuncionario> asignados = asignacionFuncionarioRepository.findByMesAndAnioAndUnidad(mes, anio, unidad);

        if (asignados == null || asignados.isEmpty()) return List.of();

        LocalDate inicioMes = LocalDate.of(anio, mes, 1);
        LocalDate finMes = inicioMes.withDayOfMonth(inicioMes.lengthOfMonth());

        return asignados.stream().map(func -> {
            FuncionarioAsignadoDTO dto = new FuncionarioAsignadoDTO();
            dto.setId(func.getIdFuncionario());
            dto.setNombreCompleto(func.getNombreCompleto());
            dto.setSiglasCargo(func.getSiglasCargo());
            dto.setAntiguedad(func.getAntiguedad());

            List<FuncionarioDiasNoDisponible> dias = funcionarioDiasNoDisponibleRepository
                    .findDiasNoDisponiblesPorFuncionarioYMesAnio(
                            func.getIdFuncionario(), mes, anio, inicioMes, finMes
                    );

            List<FuncionarioDiasNoDisponibleDTO> diasDto = dias.stream().map(d -> {
                FuncionarioDiasNoDisponibleDTO dDto = new FuncionarioDiasNoDisponibleDTO();
                dDto.setFecha(d.getFecha());
                dDto.setFechaInicio(d.getFechaInicio());
                dDto.setFechaFin(d.getFechaFin());
                dDto.setMotivo(d.getMotivo());
                dDto.setDetalle(d.getDetalle());
                return dDto;
            }).toList();

            dto.setDiasNoDisponibles(diasDto);
            return dto;
        }).toList();
    }



    public List<FuncionariosDisponiblesResponseDTO> findFuncionariosDisponibles(int mes, int anio) {
        try {
            return asignacionFuncionarioRepository.findFuncionariosDisponibles(mes, anio);
        } catch (Exception e) {
            System.out.println("Error al consultar funcionarios disponibles: " + e.getMessage());
            return null;
        }
    }

    public AsignacionFuncionario saveOrUpdate(AsignacionFuncionario nueva) {
        Optional<AsignacionFuncionario> existente = asignacionFuncionarioRepository
                .findByIdFuncionarioAndMesAndAnioAndUnidad(
                        nueva.getIdFuncionario(),
                        nueva.getMes(),
                        nueva.getAnio(),
                        nueva.getUnidad()
                );

        if (existente.isPresent()) {
            AsignacionFuncionario actual = existente.get();
            actual.setNombreCompleto(nueva.getNombreCompleto());
            actual.setSiglasCargo(nueva.getSiglasCargo());
            actual.setAntiguedad(nueva.getAntiguedad());
            return asignacionFuncionarioRepository.save(actual);
        } else {
            return asignacionFuncionarioRepository.save(nueva);
        }
    }

}
