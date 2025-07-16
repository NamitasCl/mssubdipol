package cl.investigaciones.turnos.calendar.service;

import cl.investigaciones.turnos.calendar.domain.Calendario;
import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.calendar.repository.CalendarioRepository;
import cl.investigaciones.turnos.calendar.repository.SlotRepository;
import cl.investigaciones.turnos.plantilla.domain.CupoServicioPlantilla;
import cl.investigaciones.turnos.plantilla.domain.PlantillaTurno;
import cl.investigaciones.turnos.plantilla.domain.RecintoServicioPlantilla;
import cl.investigaciones.turnos.plantilla.domain.ServicioPlantilla;
import cl.investigaciones.turnos.plantilla.repository.PlantillaTurnoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;

@Service
@RequiredArgsConstructor
@Slf4j
public class SlotGeneratorService {

    private final CalendarioRepository calendarioRepo;
    private final PlantillaTurnoRepository plantillaRepo;
    private final SlotRepository slotRepo;

    public void generarSlotsParaCalendario(Long idCalendario) {

        log.info("Iniciando slot generados para calendario: "  + idCalendario);
        Calendario calendario = calendarioRepo.findById(idCalendario)
                .orElseThrow(() -> new RuntimeException("Calendario no encontrado"));


        System.out.println("Plantillas: " + calendario.getIdPlantillasUsadas());

        YearMonth yearMonth = YearMonth.of(calendario.getAnio(), calendario.getMes());

        for (Long idPlantilla : calendario.getIdPlantillasUsadas()) {
            PlantillaTurno plantilla = plantillaRepo.findById(idPlantilla)
                    .orElseThrow(() -> new RuntimeException("Plantilla no encontrada"));

            for (ServicioPlantilla servicio : plantilla.getServicios()) {
                System.out.println("Servicio: " + servicio.getNombreServicio());
                for (int dia = 1; dia <= yearMonth.lengthOfMonth(); dia++) {
                    LocalDate fecha = yearMonth.atDay(dia);

                    for (RecintoServicioPlantilla recinto : servicio.getRecintos()) {
                        System.out.println("Recinto: " + recinto.getNombre());
                        for (CupoServicioPlantilla cupo : servicio.getCupos()) {
                            System.out.println("Cupo: " + cupo.getCantidad());
                            for (int i = 0; i < cupo.getCantidad(); i++) {
                                Slot slot = new Slot();
                                System.out.println("Uno");
                                slot.setIdCalendario(calendario.getId());
                                System.out.println("Dos");
                                slot.setFecha(fecha);
                                System.out.println("Tres");
                                slot.setNombreServicio(servicio.getNombreServicio());
                                System.out.println("Cuatro");
                                slot.setRolRequerido(cupo.getRol());
                                System.out.println("Cinco");
                                slot.setRecinto(recinto.getNombre()); // o guarda el ID si quieres
                                System.out.println("Seis");
                                slot.setCubierto(false);
                                log.info("Guardando slot para fecha={}, servicio={}, recinto={}, rol={}, cantidad={}",
                                        fecha, servicio.getNombreServicio(), recinto.getNombre(), cupo.getRol(), cupo.getCantidad());

                                slotRepo.save(slot);

                                log.info("Slot guardado (id pendiente de generación)");

                            }
                        }
                    }

                }
            }
        }
    }
}

