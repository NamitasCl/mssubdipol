package cl.investigaciones.turnos.calendar.service;

import cl.investigaciones.turnos.calendar.domain.AporteUnidadProcepol;
import cl.investigaciones.turnos.calendar.domain.Feriado;
import cl.investigaciones.turnos.calendar.domain.Slot;
import cl.investigaciones.turnos.calendar.repository.AporteUnidadProcepolRepository;
import cl.investigaciones.turnos.calendar.repository.CalendarioRepository;
import cl.investigaciones.turnos.calendar.repository.FeriadoRepository;
import cl.investigaciones.turnos.calendar.repository.SlotRepository;
import cl.investigaciones.turnos.plantilla.domain.TipoServicio;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProcepolSlotGeneradorService {

    private final AporteUnidadProcepolRepository aporteRepo;
    private final CalendarioRepository calendarioRepo;
    private final FeriadoRepository feriadoRepo;
    private final SlotRepository slotRepo;

    @Transactional
    public void distribuir(Long calendarioId) {

        var cal = calendarioRepo.findById(calendarioId)
                .orElseThrow(() -> new IllegalArgumentException("Calendario no encontrado"));
        YearMonth ym = YearMonth.of(cal.getAnio(), cal.getMes());

        // Semilla reproducible
        long seed = Objects.hash(calendarioId, ym.getYear(), ym.getMonthValue());
        Random rng = new Random(seed);

        // Aportes
        List<AporteUnidadProcepol> aportes = aporteRepo.findAllByIdCalendario(calendarioId);
        if (aportes.isEmpty()) return;

        // Días del mes por categoría
        List<LocalDate> fridays = new ArrayList<>();
        List<LocalDate> saturdays = new ArrayList<>();
        List<LocalDate> sundays = new ArrayList<>();
        List<LocalDate> weekdaysOther = new ArrayList<>(); // L-J
        Set<LocalDate> feriados = feriadoRepo.findAll().stream()
                .map(Feriado::getFecha) // asumiendo LocalDate
                .collect(Collectors.toSet());
        List<LocalDate> holidays = new ArrayList<>();

        for (LocalDate d = ym.atDay(1); !d.isAfter(ym.atEndOfMonth()); d = d.plusDays(1)) {
            if (feriados.contains(d)) {
                holidays.add(d);
                continue;
            }
            switch (d.getDayOfWeek()) {
                case FRIDAY -> fridays.add(d);
                case SATURDAY -> saturdays.add(d);
                case SUNDAY -> sundays.add(d);
                default -> weekdaysOther.add(d); // L-J
            }
        }

        // ---- Cuotas mensuales por unidad (para poder elegir días) ----
        record Cupos(int viernes, int sab, int dom, int fest, int lj) {
        }
        Map<Long, Cupos> cuota = new HashMap<>();
        for (var ap : aportes) {
            // Si quieres que L-V sea “directo por día”, pon lj = 0 y crea L-J afuera.
            int v = fridays.size() * nz(ap.getCantidadLunesViernes());
            int s = saturdays.size() * nz(ap.getCantidadSabado());
            int d = sundays.size() * nz(ap.getCantidadDomingo());
            int f = holidays.size() * nz(ap.getCantidadFestivo());
            // (opcional) otros L-J: reparte el resto de L-V
            int lj = (weekdaysOther.size()) * nz(ap.getCantidadLunesViernes());
            cuota.put(ap.getIdUnidad(), new Cupos(v, s, d, f, lj));
        }

        // Estado para reglas
        Map<Long, Integer> lastWeekendWeek = new HashMap<>();           // semana ISO del último sábado/domingo asignado
        Map<Integer, Set<Long>> fridayUnitsByWeek = new HashMap<>();    // semana ISO -> unidades que tuvieron viernes

        // 1) Asigna VIERNES (afecta regla del finde inmediato)
        asignarDiasConReglas(
                calendarioId, rng, fridays, aportes,
                (ap) -> nz(ap.getCantidadLunesViernes()), // habilita si tiene LV>0
                (u) -> cuota.get(u).viernes,
                (u, c) -> cuota.put(u, new Cupos(c, cuota.get(u).sab, cuota.get(u).dom, cuota.get(u).fest, cuota.get(u).lj)),
                (u, fecha) -> fridayUnitsByWeek.computeIfAbsent(isoWeek(fecha), k -> new HashSet<>()).add(u),
                (u, fecha) -> false // en viernes no aplicamos regla contra viernes

        );

        // 2) Asigna SÁBADOS evitando: (a) viernes de la misma semana, (b) finde consecutivo
        asignarDiasConReglas(
                calendarioId, rng, saturdays, aportes,
                (ap) -> nz(ap.getCantidadSabado()),
                (u) -> cuota.get(u).sab,
                (u, c) -> cuota.put(u, new Cupos(cuota.get(u).viernes, c, cuota.get(u).dom, cuota.get(u).fest, cuota.get(u).lj)),
                (u, fecha) -> {
                }, // no side-effect adicional
                (u, fecha) -> chocaReglasFinde(u, fecha, lastWeekendWeek, fridayUnitsByWeek)
        );
        // marca último finde de lo recién asignado
        marcarUltimoFinde(saturdays, calendarioId, lastWeekendWeek);

        // 3) Asigna DOMINGOS con las mismas reglas
        asignarDiasConReglas(
                calendarioId, rng, sundays, aportes,
                (ap) -> nz(ap.getCantidadDomingo()),
                (u) -> cuota.get(u).dom,
                (u, c) -> cuota.put(u, new Cupos(cuota.get(u).viernes, cuota.get(u).sab, c, cuota.get(u).fest, cuota.get(u).lj)),
                (u, fecha) -> {
                },
                (u, fecha) -> chocaReglasFinde(u, fecha, lastWeekendWeek, fridayUnitsByWeek)
        );
        marcarUltimoFinde(sundays, calendarioId, lastWeekendWeek);

        // 4) (Opcional) Asigna FERIADOS con la regla de no consecutivo (si caen cerca de finde puedes reutilizar)
        asignarDiasConReglas(
                calendarioId, rng, holidays, aportes,
                (ap) -> nz(ap.getCantidadFestivo()),
                (u) -> cuota.get(u).fest,
                (u, c) -> cuota.put(u, new Cupos(cuota.get(u).viernes, cuota.get(u).sab, cuota.get(u).dom, c, cuota.get(u).lj)),
                (u, fecha) -> {
                },
                (u, fecha) -> false // feriado no necesariamente aplica regla, puedes ajustar

        );

        // 5) (Opcional) LUNES-JUEVES si los quieres distribuir también
        asignarDiasConReglas(
                calendarioId, rng, weekdaysOther, aportes,
                (ap) -> nz(ap.getCantidadLunesViernes()),
                (u) -> cuota.get(u).lj,
                (u, c) -> cuota.put(u, new Cupos(cuota.get(u).viernes, cuota.get(u).sab, cuota.get(u).dom, cuota.get(u).fest, c)),
                (u, fecha) -> {
                },
                (u, fecha) -> false
        );
    }

    // ---------- Núcleo de asignación con restricciones ----------
    private void asignarDiasConReglas(
            Long calendarioId,
            Random rng,
            List<LocalDate> fechas,
            List<AporteUnidadProcepol> aportes,
            java.util.function.ToIntFunction<AporteUnidadProcepol> habilitadoEnCategoria,     // ¿la unidad participa aquí?
            java.util.function.IntFunction<Integer> cuotaRestanteFn,                          // leer cuota actual (por unidadId)
            java.util.function.BiConsumer<Long, Integer> setCuotaRestante,                    // escribir nueva cuota
            java.util.function.BiConsumer<Long, LocalDate> sideEffectTrasAsignar,             // ej. marcar viernes por semana
            java.util.function.BiFunction<Long, LocalDate, Boolean> violaReglas               // true => evitar si hay alternativas

    ) {
        if (fechas.isEmpty()) return;

        // orden aleatorio estable de fechas
        List<LocalDate> ordenFechas = new ArrayList<>(fechas);
        Collections.shuffle(ordenFechas, rng);

        // candidatos: unidades con participación en esta categoría
        List<AporteUnidadProcepol> candidatosBase = aportes.stream()
                .filter(ap -> habilitadoEnCategoria.applyAsInt(ap) > 0)
                .collect(Collectors.toList());
        if (candidatosBase.isEmpty()) return;

        for (LocalDate fecha : ordenFechas) {
            // baraja unidades cada día (estable por seed)
            List<AporteUnidadProcepol> candidatos = new ArrayList<>(candidatosBase);
            Collections.shuffle(candidatos, rng);

            // Vamos tomando unidades con cuota > 0, evitando violar reglas si hay alternativa
            for (AporteUnidadProcepol ap : candidatos) {
                Long u = ap.getIdUnidad();
                int rest = cuotaRestanteFn.apply(u.intValue());
                if (rest <= 0) continue;

                LocalTime horaInicio = ap.getIsTercero() ? LocalTime.of(20, 0) : LocalTime.of(8, 0);
                LocalTime horaFin = ap.getIsTercero() ? LocalTime.of(8, 0) : LocalTime.of(20, 0);

                // buscamos la mejor unidad para esta fecha
                Optional<AporteUnidadProcepol> elegido = candidatos.stream()
                        .filter(x -> cuotaRestanteFn.apply(x.getIdUnidad().intValue()) > 0)
                        .sorted(Comparator.comparingInt(x ->
                                violaReglas.apply(x.getIdUnidad(), fecha) ? 1 : 0))
                        .findFirst();

                if (elegido.isEmpty()) break;
                AporteUnidadProcepol pick = elegido.get();
                Long unidadPick = pick.getIdUnidad();

                // crea 1 slot = 1 vehículo
                crearSlotVehiculo(calendarioId, fecha, pick.getSiglasUnidad(), horaInicio, horaFin);

                // descuenta cuota
                int restPick = cuotaRestanteFn.apply(unidadPick.intValue());
                setCuotaRestante.accept(unidadPick, restPick - 1);

                // side effect (viernes por semana, etc.)
                sideEffectTrasAsignar.accept(unidadPick, fecha);
            }
        }
    }

    private void crearSlotVehiculo(Long calendarioId, LocalDate fecha, String siglasUnidad,
                                   LocalTime horaInicio, LocalTime horaFin) {
        Slot s = new Slot();
        s.setIdCalendario(calendarioId);
        s.setFecha(fecha);
        s.setNombreServicio("Carro de procedimientos policiales");
        s.setTipoServicio(TipoServicio.PROCEPOL);
        s.setHoraInicio(horaInicio);
        s.setHoraFin(horaFin);
        s.setRolRequerido(null);
        s.setRecinto(null);
        s.setCubierto(false);
        s.setIdFuncionario(null);
        s.setGradoFuncionario(null);
        s.setNombreFuncionario(null);
        s.setAntiguedadFuncionario(null);
        s.setSiglasunidad(siglasUnidad);
        slotRepo.save(s);
    }

    // Marca el último fin de semana asignado leyendo lo que acabamos de crear (simple)
    private void marcarUltimoFinde(List<LocalDate> dias, Long calendarioId, Map<Long, Integer> lastWeekendWeek) {
        // Si quieres exactitud por unidad, puedes consultar Slots creados por fecha y agrupar por siglasUnidad
        // y setear lastWeekendWeek.put(idUnidad, isoWeek(fecha))
        // Aquí lo dejamos como hook por si quieres enriquecerlo.
    }

    private boolean chocaReglasFinde(Long unidadId, LocalDate fecha,
                                     Map<Long, Integer> lastWeekendWeek,
                                     Map<Integer, Set<Long>> fridayUnitsByWeek) {
        int week = isoWeek(fecha);
        // Regla A: tuvo viernes en la misma semana
        if (fridayUnitsByWeek.getOrDefault(week, Set.of()).contains(unidadId)) return true;
        // Regla B: fin de semana consecutivo
        Integer lastW = lastWeekendWeek.get(unidadId);
        return (lastW != null && (lastW == week - 1));
    }

    private int isoWeek(LocalDate d) {
        return d.get(java.time.temporal.IsoFields.WEEK_OF_WEEK_BASED_YEAR);
    }

    private int nz(Integer v) {
        return v == null ? 0 : Math.max(0, v);
    }
}

