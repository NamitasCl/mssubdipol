package cl.investigaciones.turnos.calendar.cache;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class FuncionarioCacheService {
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${commonservices.url:http://commonservices:8011}")
    private String commonServicesUrl;
    
    @Cacheable(value = "funcionarios", key = "#idFun")
    public Map<String, Object> obtenerFuncionario(Integer idFun) {
        try {
            String url = commonServicesUrl + "/funcionarios/" + idFun;
            @SuppressWarnings("unchecked")
            Map<String, Object> funcionario = restTemplate.getForObject(url, Map.class);
            return funcionario;
        } catch (Exception e) {
            log.warn("Error obteniendo funcionario {}: {}", idFun, e.getMessage());
            return crearFuncionarioDefault(idFun);
        }
    }
    
    public Map<Integer, Map<String, Object>> obtenerVarios(List<Integer> idsFun) {
        Map<Integer, Map<String, Object>> resultado = new HashMap<>();
        for (Integer idFun : idsFun) {
            resultado.put(idFun, obtenerFuncionario(idFun));
        }
        return resultado;
    }
    
    @CacheEvict(value = "funcionarios", allEntries = true)
    @Scheduled(fixedRate = 3600000) // 1 hora
    public void limpiarCache() {
        log.info("Limpiando cache de funcionarios");
    }
    
    @CacheEvict(value = "funcionarios", key = "#idFun")
    public void invalidar(Integer idFun) {
        log.debug("Invalidando cache para funcionario {}", idFun);
    }
    
    private Map<String, Object> crearFuncionarioDefault(Integer idFun) {
        Map<String, Object> defaults = new HashMap<>();
        defaults.put("idFun", idFun);
        defaults.put("nombreCompleto", "Desconocido");
        defaults.put("siglasCargo", "");
        defaults.put("antiguedad", 0);
        return defaults;
    }
}
