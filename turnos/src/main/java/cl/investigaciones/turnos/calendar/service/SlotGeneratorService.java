package cl.investigaciones.turnos.calendar.service;

import cl.investigaciones.turnos.calendar.domain.Calendario;
import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.calendar.repository.CalendarioRepository;
import cl.investigaciones.turnos.calendar.repository.SlotRepository;
import cl.investigaciones.turnos.plantilla.domain.*;
import cl.investigaciones.turnos.plantilla.repository.PlantillaTurnoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;

@Service
@RequiredArgsConstructor
@Slf4j
public class SlotGeneratorService {

    private final CalendarioRepository calendarioRepo;
    private final PlantillaTurnoRepository plantillaRepo;
    private final SlotRepository slotRepo;

    public void generarSlotsParaCalendario(Long idCalendario) {
        log.info("Iniciando generación de slots para calendario: {}", idCalendario);
        Calendario calendario = calendarioRepo.findById(idCalendario)
                .orElseThrow(() -> new RuntimeException("Calendario no encontrado"));

        YearMonth yearMonth = YearMonth.of(calendario.getAnio(), calendario.getMes());

        for (Long idPlantilla : calendario.getIdPlantillasUsadas()) {
            PlantillaTurno plantilla = plantillaRepo.findById(idPlantilla)
                    .orElseThrow(() -> new RuntimeException("Plantilla no encontrada"));

            for (ServicioPlantilla servicio : plantilla.getServicios()) {

                for (int dia = 1; dia <= yearMonth.lengthOfMonth(); dia++) {
                    LocalDate fecha = yearMonth.atDay(dia);
                    DayOfWeek dow = fecha.getDayOfWeek();

                    if (servicio.getTipoServicio() == TipoServicio.RONDA) {

                        if (dow.getValue() >= 1 && dow.getValue() <= 5) { // Lunes-Viernes
                            generarSlotsRonda(calendario.getId(), fecha,
                                    LocalTime.of(20, 0), LocalTime.of(8, 0),
                                    servicio.getRondaCantidadSemana(), servicio);
                        } else { // Sábado-Domingo
                            // Tramo 1: 08:00 → 20:00
                            generarSlotsRonda(calendario.getId(), fecha,
                                    LocalTime.of(8, 0), LocalTime.of(20, 0),
                                    servicio.getRondaCantidadFds(), servicio);
                            // Tramo 2: 20:00 → 08:00 siguiente día
                            generarSlotsRonda(calendario.getId(), fecha,
                                    LocalTime.of(20, 0), LocalTime.of(8, 0),
                                    servicio.getRondaCantidadFds(), servicio);
                        }

                    } else {
                        // Lógica original para servicios normales
                        for (RecintoServicioPlantilla recinto : servicio.getRecintos()) {
                            for (CupoServicioPlantilla cupo : servicio.getCupos()) {
                                for (int i = 0; i < cupo.getCantidad(); i++) {
                                    Slot slot = new Slot();
                                    slot.setIdCalendario(calendario.getId());
                                    slot.setFecha(fecha);
                                    slot.setNombreServicio(servicio.getNombreServicio());
                                    slot.setTipoServicio(servicio.getTipoServicio());
                                    slot.setHoraInicio(servicio.getHoraInicio());
                                    slot.setHoraFin(servicio.getHoraFin());
                                    slot.setRolRequerido(cupo.getRol());
                                    slot.setRecinto(recinto.getNombre());
                                    slot.setCubierto(false);
                                    slotRepo.save(slot);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private void generarSlotsRonda(Long idCalendario, LocalDate fecha, LocalTime inicio, LocalTime fin, int cantidad, ServicioPlantilla servicio) {
        for (int i = 0; i < cantidad; i++) {
            Slot slot = new Slot();
            slot.setIdCalendario(idCalendario);
            slot.setFecha(fecha);
            slot.setNombreServicio(servicio.getNombreServicio());
            slot.setTipoServicio(servicio.getTipoServicio());
            slot.setHoraInicio(inicio);
            slot.setHoraFin(fin);
            slot.setRolRequerido(RolServicio.JEFE_DE_RONDA); // o lo que corresponda en tu plantilla
            slot.setRecinto(null); // Rondas no tienen recinto
            slot.setCubierto(false);
            slotRepo.save(slot);
        }
    }

}

