package cl.investigaciones.turnos.calendar.service;

import cl.investigaciones.turnos.calendar.domain.AporteUnidadProcepol;
import cl.investigaciones.turnos.calendar.dto.AporteUnidadItemProcepolDTO;
import cl.investigaciones.turnos.calendar.dto.AporteUnidadItemRequestProcepolDTO;
import cl.investigaciones.turnos.calendar.repository.AporteUnidadProcepolRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AporteUnidadProcepolService {

    private final AporteUnidadProcepolRepository repo;

    @Transactional
    public void guardarAportes(AporteUnidadItemRequestProcepolDTO req) {
        Long calendarioId = req.getIdCalendario();
        List<AporteUnidadItemProcepolDTO> items = Optional.ofNullable(req.getUnidades()).orElseGet(List::of);

        // Upsert por cada unidad del carrito
        for (AporteUnidadItemProcepolDTO it : items) {
            var existente = repo.findByIdCalendarioAndIdUnidad(calendarioId, it.getIdUnidad()).orElse(null);
            if (existente == null) {
                existente = AporteUnidadProcepol.builder()
                        .idCalendario(calendarioId)
                        .idUnidad(it.getIdUnidad())
                        .siglasUnidad(it.getSiglasUnidad())
                        .cantidadLunesViernes(nz(it.getCantidadLunesViernes()))
                        .cantidadSabado(nz(it.getCantidadSabado()))
                        .cantidadDomingo(nz(it.getCantidadDomingo()))
                        .cantidadFestivo(nz(it.getCantidadFestivo()))
                        .build();
            } else {
                existente.setSiglasUnidad(it.getSiglasUnidad());
                existente.setCantidadLunesViernes(nz(it.getCantidadLunesViernes()));
                existente.setCantidadSabado(nz(it.getCantidadSabado()));
                existente.setCantidadDomingo(nz(it.getCantidadDomingo()));
                existente.setCantidadFestivo(nz(it.getCantidadFestivo()));
            }
            repo.save(existente);
        }

        // (Opcional) Borrar lo que ya no está en el carrito:
        Set<Long> idsEnCarrito = items.stream().map(AporteUnidadItemProcepolDTO::getIdUnidad).collect(Collectors.toSet());
        List<AporteUnidadProcepol> actuales = repo.findAllByIdCalendario(calendarioId);
        for (AporteUnidadProcepol a : actuales) {
            if (!idsEnCarrito.contains(a.getIdUnidad())) {
                repo.deleteByIdCalendarioAndIdUnidad(calendarioId, a.getIdUnidad());
            }
        }
    }

    private int nz(Integer v) { return v == null ? 0 : Math.max(0, v); }

}
