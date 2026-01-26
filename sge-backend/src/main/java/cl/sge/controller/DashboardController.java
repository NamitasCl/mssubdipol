package cl.sge.controller;

import cl.sge.entity.AsignacionRecurso;
import cl.sge.entity.Despliegue;
import cl.sge.entity.Evento;
import cl.sge.entity.Evento.EstadoEvento;
import cl.sge.repository.AsignacionRecursoRepository;
import cl.sge.repository.DespliegueRepository;
import cl.sge.repository.EventoRepository;
import cl.sge.repository.VehiculoRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DespliegueRepository despliegueRepository;
    private final VehiculoRepository vehiculoRepository;
    private final EventoRepository eventoRepository;
    private final AsignacionRecursoRepository asignacionRecursoRepository;

    public DashboardController(DespliegueRepository despliegueRepository, 
                               VehiculoRepository vehiculoRepository,
                               EventoRepository eventoRepository,
                               AsignacionRecursoRepository asignacionRecursoRepository) {
        this.despliegueRepository = despliegueRepository;
        this.vehiculoRepository = vehiculoRepository;
        this.eventoRepository = eventoRepository;
        this.asignacionRecursoRepository = asignacionRecursoRepository;
    }

    @GetMapping("/kpis")
    public Map<String, Object> getKpis() {
        List<Despliegue> despliegues = despliegueRepository.findAll();
        List<Evento> eventos = eventoRepository.findAll();
        List<AsignacionRecurso> asignaciones = asignacionRecursoRepository.findAll();

        // 1. Active Events (Permissive: ACTIVO or NULL)
        long eventosActivos = eventos.stream()
                .filter(e -> e.getEstado() == null || EstadoEvento.ACTIVO.equals(e.getEstado()))
                .count();

        // 2. Active Deployments
        List<Despliegue> desplieguesActivos = despliegues.stream()
                .filter(Despliegue::isActivo)
                .toList();
        
        long countDesplieguesActivos = desplieguesActivos.size();

        // 3. Deployed Personnel (Active Deployments only)
        long funcionariosDesplegados = asignaciones.stream()
                .filter(a -> a.getDespliegue() != null && a.getDespliegue().isActivo())
                .mapToLong(a -> a.getFuncionarios() != null ? a.getFuncionarios().size() : 0)
                .sum();

        // 4. Deployed Vehicles (Active Deployments only)
        long vehiculosDesplegados = asignaciones.stream()
                .filter(a -> a.getDespliegue() != null && a.getDespliegue().isActivo())
                .mapToLong(a -> a.getVehiculos() != null ? a.getVehiculos().size() : 0)
                .sum();
        
        // 5. Supply Alerts
        long alertasAbastecimiento = desplieguesActivos.stream()
                .filter(d -> d.getProvisiones() != null && 
                       ((d.getProvisiones().getLitrosAgua() != null && d.getProvisiones().getLitrosAgua() < 10) || 
                        (d.getProvisiones().getRacionesComida() != null && d.getProvisiones().getRacionesComida() < 10)))
                .count();

        Map<String, Object> kpis = new HashMap<>();
        kpis.put("eventosActivos", eventosActivos);
        kpis.put("desplieguesActivos", countDesplieguesActivos);
        kpis.put("totalFuncionarios", funcionariosDesplegados);
        kpis.put("vehiculosTerreno", vehiculosDesplegados);
        kpis.put("alertasAbastecimiento", alertasAbastecimiento);
        
        // Region Breakdown
        Map<String, Integer> regionBreakdown = new HashMap<>();
        eventos.stream()
            .filter(e -> e.getEstado() == null || EstadoEvento.ACTIVO.equals(e.getEstado()))
            .forEach(e -> {
                if(e.getRegiones() != null) {
                    e.getRegiones().forEach(r -> regionBreakdown.merge(r, 1, Integer::sum));
                }
            });
            
        kpis.put("regionData", regionBreakdown);

        return kpis;
    }
}
