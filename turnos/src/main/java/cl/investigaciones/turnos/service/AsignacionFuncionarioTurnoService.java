package cl.investigaciones.turnos.service;

import cl.investigaciones.turnos.dto.*;
import cl.investigaciones.turnos.model.*;
import cl.investigaciones.turnos.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AsignacionFuncionarioTurnoService {

    private final TurnoAsignacionRepository turnoAsignacionRepo;
    private final DiaAsignacionRepository diaAsignacionRepo;
    private final AsignacionFuncionarioRepository funcionarioRepo;
    private final AsignacionFuncionarioTurnoRepository asignacionTurnoRepo;
    private final RestTemplate restTemplate;
    private final RegistroCambiosRepository registroCambiosRepo;

    public AsignacionFuncionarioTurnoService(
            TurnoAsignacionRepository turnoAsignacionRepo,
            DiaAsignacionRepository diaAsignacionRepo,
            AsignacionFuncionarioRepository funcionarioRepo,
            AsignacionFuncionarioTurnoRepository asignacionTurnoRepo, RestTemplate restTemplate
    , RegistroCambiosRepository registroCambiosRepo) {
        this.turnoAsignacionRepo = turnoAsignacionRepo;
        this.diaAsignacionRepo = diaAsignacionRepo;
        this.funcionarioRepo = funcionarioRepo;
        this.asignacionTurnoRepo = asignacionTurnoRepo;
        this.restTemplate = restTemplate;
        this.registroCambiosRepo = registroCambiosRepo;
    }

    @Transactional
    public void guardarAsignaciones(AsignacionTurnoRequestDTO dto) {

        List<AsignacionTurnoRequestDTO.FuncionarioTurnoDTO> asignaciones = dto.getAsignaciones();
        for(AsignacionTurnoRequestDTO.FuncionarioTurnoDTO ft : asignaciones) {
            System.out.println("Funcionario: " + ft.getId() + ", Turno: " + ft.getNombreTurno());
        }

        System.out.println("Mes: " + dto.getMes());
        System.out.println("Año: " + dto.getAnio());
        System.out.println("Dia: " + dto.getDia());

        TurnoAsignacion mes = turnoAsignacionRepo.findByMesAndAnioAndActivoTrue(dto.getMes(), dto.getAnio())
                .orElseThrow(() -> new RuntimeException("Mes no encontrado"));

        DiaAsignacion dia = diaAsignacionRepo.findByTurnoAsignacionAndDia(mes, dto.getDia())
                .orElseThrow(() -> new RuntimeException("Día no encontrado"));

        for (AsignacionTurnoRequestDTO.FuncionarioTurnoDTO ft : dto.getAsignaciones()) {
            System.out.println("Funcionario: " + ft.getId() + ", Turno: " + ft.getNombreTurno());
            AsignacionFuncionario funcionario = funcionarioRepo
                    .findByIdAndMesAndAnio(ft.getId(), dto.getMes(), dto.getAnio())
                    .orElseThrow(() -> new RuntimeException("Funcionario no encontrado"));

            AsignacionFuncionarioTurno asignacion = new AsignacionFuncionarioTurno();
            asignacion.setDiaAsignacion(dia);
            asignacion.setFuncionario(funcionario);
            asignacion.setNombreTurno(ft.getNombreTurno());
            asignacionTurnoRepo.save(asignacion);
        }
    }

    public List<DiaConAsignacionesDTO> obtenerAsignaciones(int mes, int anio) {
        TurnoAsignacion mesAsignado = turnoAsignacionRepo.findByMesAndAnio(mes, anio)
                .orElseThrow(() -> new RuntimeException("No existe mes"));

        return mesAsignado.getAsignaciones().stream().map(dia -> {
            DiaConAsignacionesDTO dto = new DiaConAsignacionesDTO();
            dto.setDia(dia.getDia());
            dto.setDiaSemana(dia.getDiaSemana());

            List<DiaConAsignacionesDTO.FuncionarioTurnoDTO> asignaciones = dia.getAsignacionesFuncionario().stream()
                    .map(a -> {
                        AsignacionFuncionario f = a.getFuncionario();
                        var ft = new DiaConAsignacionesDTO.FuncionarioTurnoDTO();
                        ft.setNombreTurno(a.getNombreTurno());
                        ft.setIdFuncionario(f.getIdFuncionario());
                        ft.setNombreCompleto(f.getNombreCompleto());
                        ft.setSiglasCargo(f.getSiglasCargo());
                        ft.setAntiguedad(f.getAntiguedad());
                        ft.setSiglasUnidad(f.getUnidad());
                        return ft;
                    }).collect(Collectors.toList());

            dto.setAsignaciones(asignaciones);
            return dto;
        }).collect(Collectors.toList());
    }

    public List<DiaConAsignacionesDTO> obtenerAsignacionesPorMesAnioUnidad(int mes, int anio, String unidad) {
        TurnoAsignacion mesAsignado = turnoAsignacionRepo.findByMesAndAnio(mes, anio)
                .orElseThrow(() -> new RuntimeException("No existe mes"));

        return mesAsignado.getAsignaciones().stream().map(dia -> {
            DiaConAsignacionesDTO dto = new DiaConAsignacionesDTO();
            dto.setDia(dia.getDia());
            dto.setDiaSemana(dia.getDiaSemana());

            List<DiaConAsignacionesDTO.FuncionarioTurnoDTO> asignaciones = dia.getAsignacionesFuncionario().stream()
                    .filter(a -> a.getFuncionario().getUnidad().equalsIgnoreCase(unidad))
                    .map(a -> {
                        AsignacionFuncionario f = a.getFuncionario();
                        var ft = new DiaConAsignacionesDTO.FuncionarioTurnoDTO();
                        ft.setNombreTurno(a.getNombreTurno());
                        ft.setIdFuncionario(f.getIdFuncionario());
                        ft.setNombreCompleto(f.getNombreCompleto());
                        ft.setSiglasCargo(f.getSiglasCargo());
                        ft.setAntiguedad(f.getAntiguedad());
                        ft.setSiglasUnidad(f.getUnidad());
                        return ft;
                    }).collect(Collectors.toList());

            dto.setAsignaciones(asignaciones);
            return dto;
        }).collect(Collectors.toList());

    }
    @Transactional
    public void actualizarTurnoPorUnidad(ActualizacionTurnoUnidadWrapper dto) {
        String funcionariosPorUnidad = "http://commonservices:8011/funcionario/porunidad";
        AsignacionFuncionario funcionarioOriginal;
        CSFuncionarioUnidadResponseDTO[] resultado = null;

        List<ActualizacionTurnoUnidadDTO> actualizaciones = dto.getActualizaciones();

        for (ActualizacionTurnoUnidadDTO actualizacion : actualizaciones) {
            System.out.println("Id Funcionario a asignar: " + actualizacion.getFuncionarioNuevo().getValue());

            // 1. Busco el registro del funcionario a asignar
            Optional<AsignacionFuncionario> funcionarioReemplazoOpt =
                    funcionarioRepo.findByIdFuncionario(actualizacion.getFuncionarioNuevo().getValue());

            if (funcionarioReemplazoOpt.isEmpty()) {
                // 2. Buscar en el microservicio externo con la unidad y nombre del nuevo funcionario
                URI uri = UriComponentsBuilder
                        .fromUriString(funcionariosPorUnidad)
                        .queryParam("unidad", actualizacion.getFuncionarioNuevo().getUnidad())
                        .queryParam("term", actualizacion.getFuncionarioNuevo().getLabel())
                        .build()
                        .encode()
                        .toUri();

                System.out.println("Uri de búsqueda: " + uri);

                ResponseEntity<CSFuncionarioUnidadResponseDTO[]> response = restTemplate.getForEntity(uri, CSFuncionarioUnidadResponseDTO[].class);
                resultado = response.getBody();

                System.out.println("Funcionario encontrado: " + resultado[0].getNombreCompleto());

                if (resultado != null && resultado.length > 0) {
                    // 3. Tomo el primer resultado y uso el registro del funcionario a reemplazar para mantener la FK
                    funcionarioOriginal = funcionarioRepo.findByIdFuncionario(actualizacion.getFuncionarioOriginal().getIdFuncionario())
                            .orElseThrow(() -> new RuntimeException("Funcionario original no encontrado"));

                    // Actualizo los datos básicos
                    funcionarioOriginal.setNombreCompleto(resultado[0].getNombreCompleto());
                    funcionarioOriginal.setIdFuncionario(resultado[0].getIdFun());
                    funcionarioOriginal.setSiglasCargo(resultado[0].getSiglasCargo());
                    funcionarioOriginal.setUnidad(resultado[0].getSiglasUnidad());
                    funcionarioOriginal.setAntiguedad(resultado[0].getAntiguedad());
                    // Si tienes más campos relevantes, agrégalos aquí
                    funcionarioRepo.save(funcionarioOriginal);
                    System.out.println("Funcionario de reemplazo actualizado en registro local: " + funcionarioOriginal.getNombreCompleto());
                } else {
                    throw new RuntimeException("Funcionario no encontrado ni local ni externo.");
                }
            } else {
                funcionarioOriginal = funcionarioReemplazoOpt.get();
                System.out.println("Funcionario a asignar (encontrado local): " + funcionarioOriginal.getNombreCompleto());
            }

            // 4. Busco el registro del funcionario original
            //AsignacionFuncionario funcionarioOriginal = funcionarioRepo.findByIdFuncionario(actualizacion.getFuncionarioOriginal().getIdFuncionario())
            //        .orElseThrow(() -> new RuntimeException("Funcionario original no encontrado"));
            //System.out.println("Funcionario a reemplazar: " + funcionarioOriginal.getId());

            // 5. Busco el mes asignacion
            TurnoAsignacion mesAsignacion = turnoAsignacionRepo.findByMesAndAnioAndActivoTrue(actualizacion.getMes(), actualizacion.getAnio())
                    .orElseThrow(() -> new RuntimeException("Mes no encontrado"));
            System.out.println("Mes asignación encontrado: " + mesAsignacion.getMes());

            // 6. Obtengo el día asignacion
            DiaAsignacion diaAsignacion = diaAsignacionRepo.findByTurnoAsignacionAndDia(mesAsignacion, actualizacion.getDia())
                    .orElseThrow(() -> new RuntimeException("Día no encontrado"));
            System.out.println("Día asignación encontrado: " + diaAsignacion.getDia());

            // 7. Busco registro del turno a modificar
            AsignacionFuncionarioTurno asignacionTurno = asignacionTurnoRepo.findByFuncionarioIdAndDiaAsignacion(funcionarioOriginal.getId(), diaAsignacion)
                    .orElseThrow(() -> new RuntimeException("Asignación de turno no encontrada"));
            System.out.println("Asignación de turno encontrada: " + asignacionTurno.getId());

            // 8. Registro de auditoría
            RegistroCambios registro = RegistroCambios.builder()
                    .fechaCambio(LocalDateTime.now())
                    .idFuncionarioOriginal(actualizacion.getFuncionarioOriginal().getIdFuncionario())
                    .funcionarioOriginal(actualizacion.getFuncionarioOriginal().getNombreCompleto())
                    .idFuncionarioReemplazo(resultado[0].getIdFun())
                    .funcionarioReemplazo(resultado[0].getNombreCompleto())
                    .nombreTurno(actualizacion.getNombreTurno())
                    .dia(actualizacion.getDia())
                    .mes(actualizacion.getMes())
                    .anio(actualizacion.getAnio())
                    .unidad(actualizacion.getFuncionarioOriginal().getUnidad())
                    .motivo("Cambio de funcionario por solicitud de unidad o mejor servicio") // Puedes parametrizar el motivo
                    // .usuarioCambio(usuarioDelContexto)
                    .build();
            registroCambiosRepo.save(registro);
            System.out.println("Registro de cambio guardado para auditoría.");

            // 9. Actualizo el turno con el nuevo funcionario
            System.out.println("Actualizando turno de " + funcionarioOriginal.getNombreCompleto() + " a " + resultado[0].getNombreCompleto());
            asignacionTurno.setFuncionario(funcionarioOriginal);
            asignacionTurnoRepo.save(asignacionTurno);
            System.out.println("Asignación de turno guardada correctamente");
        }
    }
}