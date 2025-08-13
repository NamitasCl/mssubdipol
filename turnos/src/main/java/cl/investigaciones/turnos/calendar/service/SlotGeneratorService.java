package cl.investigaciones.turnos.calendar.service;

import cl.investigaciones.turnos.calendar.domain.Calendario;
import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.calendar.repository.CalendarioRepository;
import cl.investigaciones.turnos.calendar.repository.SlotRepository;
import cl.investigaciones.turnos.calendar.utils.FeriadoServiceImpl;
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
    private final FeriadoServiceImpl feriadoService;

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

                    // Nuevo: si es feriado, se trata como fin de semana
                    boolean esFinDeSemana = (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY);
                    boolean esFeriado = feriadoService.esFeriado(fecha);
                    boolean tratarComoFds = esFinDeSemana || esFeriado;


                    if (servicio.getTipoServicio() == TipoServicio.RONDA) {
                        LocalTime lvIni   = firstNonNull(servicio.getRondaLvInicio(),       LocalTime.of(20, 0));
                        LocalTime lvFin   = firstNonNull(servicio.getRondaLvFin(),          LocalTime.of(8, 0));
                        LocalTime fdsDIni = firstNonNull(servicio.getRondaFdsDiaInicio(),   LocalTime.of(8, 0));
                        LocalTime fdsDFin = firstNonNull(servicio.getRondaFdsDiaFin(),      LocalTime.of(20, 0));
                        LocalTime fdsNIni = firstNonNull(servicio.getRondaFdsNocheInicio(), LocalTime.of(20, 0));
                        LocalTime fdsNFin = firstNonNull(servicio.getRondaFdsNocheFin(),    LocalTime.of(8, 0));

                        int cantLv  = servicio.getRondaCantidadSemana() != null ? servicio.getRondaCantidadSemana() : 0;
                        int cantFds = servicio.getRondaCantidadFds() != null ? servicio.getRondaCantidadFds() : 0;

                        int cantDia   = (cantFds + 1) / 2; // redondea hacia arriba para día
                        int cantNoche =  cantFds / 2;      // resto para noche

                        if (!tratarComoFds) {
                            generarSlotsRonda(calendario.getId(), fecha, lvIni, lvFin, cantLv, servicio);
                        } else {
                            generarSlotsRonda(calendario.getId(), fecha, fdsDIni, fdsDFin, cantDia, servicio);
                            generarSlotsRonda(calendario.getId(), fecha, fdsNIni, fdsNFin, cantNoche, servicio);
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

    private static <T> T firstNonNull(T val, T def) { return val != null ? val : def; }

}

