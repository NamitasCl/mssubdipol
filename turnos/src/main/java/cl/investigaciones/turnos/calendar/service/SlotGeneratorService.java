package cl.investigaciones.turnos.calendar.service;

import cl.investigaciones.turnos.calendar.domain.Calendario;
import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.calendar.repository.CalendarioRepository;
import cl.investigaciones.turnos.calendar.repository.SlotRepository;
import cl.investigaciones.turnos.plantilla.domain.CupoServicioPlantilla;
import cl.investigaciones.turnos.plantilla.domain.PlantillaTurno;
import cl.investigaciones.turnos.plantilla.domain.ServicioPlantilla;
import cl.investigaciones.turnos.plantilla.repository.PlantillaTurnoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;

@Service
@RequiredArgsConstructor
public class SlotGeneratorService {

    private final CalendarioRepository calendarioRepo;
    private final PlantillaTurnoRepository plantillaRepo;
    private final SlotRepository slotRepo;

    public void generarSlotsParaCalendario(Long idCalendario) {
        Calendario calendario = calendarioRepo.findById(idCalendario)
                .orElseThrow(() -> new RuntimeException("Calendario no encontrado"));

        YearMonth yearMonth = YearMonth.of(calendario.getAnio(), calendario.getMes());

        for (Long idPlantilla : calendario.getIdPlantillasUsadas()) {
            PlantillaTurno plantilla = plantillaRepo.findById(idPlantilla)
                    .orElseThrow(() -> new RuntimeException("Plantilla no encontrada"));

            for (ServicioPlantilla servicio : plantilla.getServicios()) {
                for (int dia = 1; dia <= yearMonth.lengthOfMonth(); dia++) {
                    LocalDate fecha = yearMonth.atDay(dia);

                    for (int r = 1; r <= servicio.getCantidadRecintos(); r++) {
                        for (CupoServicioPlantilla cupo : servicio.getCupos()) {
                            for (int i = 0; i < cupo.getCantidad(); i++) {
                                Slot slot = new Slot();
                                slot.setIdCalendario(calendario.getId());
                                slot.setFecha(fecha);
                                slot.setNombreServicio(servicio.getNombreServicio());
                                slot.setRolRequerido(cupo.getRol());
                                slot.setRecinto(r);
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

