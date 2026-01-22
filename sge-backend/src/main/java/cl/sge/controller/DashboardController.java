package cl.sge.controller;

import cl.sge.entity.Despliegue;
import cl.sge.repository.DespliegueRepository;
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

    public DashboardController(DespliegueRepository despliegueRepository, VehiculoRepository vehiculoRepository) {
        this.despliegueRepository = despliegueRepository;
        this.vehiculoRepository = vehiculoRepository;
    }

    public Map<String, Object> getKpis() {
        List<Despliegue> despliegues = despliegueRepository.findAll();
        
        // Reporting REQUIREMENTS now, as Actuals would need AsignacionRepository
        long totalFuncionariosRequeridos = despliegues.stream()
                .mapToLong(d -> d.getCantidadFuncionariosRequeridos() != null ? d.getCantidadFuncionariosRequeridos() : 0)
                .sum();
        
        long vehiculosRequeridos = despliegues.stream()
             .mapToLong(d -> d.getCantidadVehiculosRequeridos() != null ? d.getCantidadVehiculosRequeridos() : 0)
             .sum();
        
        long alertasAbastecimiento = despliegues.stream()
                .filter(d -> d.getProvisiones() != null && 
                       (d.getProvisiones().getLitrosAgua() < 10 || d.getProvisiones().getRacionesComida() < 10))
                .count();

        Map<String, Object> kpis = new HashMap<>();
        kpis.put("totalFuncionarios", totalFuncionariosRequeridos);
        kpis.put("vehiculosTerreno", vehiculosRequeridos);
        kpis.put("alertasAbastecimiento", alertasAbastecimiento);
        
        return kpis;
    }
    
    // Add endpoints for charts data if needed
}
