package cl.investigaciones.nodos.service.consulta;

import cl.investigaciones.nodos.dto.consulta.*;
import cl.investigaciones.nodos.dto.serviciosespeciales.FichaMemoRequestDTO;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class EstadisticasService {

    private final ServiciosEspecialesService serviciosEspecialesService;

    public EstadisticasService(ServiciosEspecialesService serviciosEspecialesService) {
        this.serviciosEspecialesService = serviciosEspecialesService;
    }

    public EstadisticasExportDTO generarEstadisticas(FichaMemoRequestDTO req) {
        System.out.println("📊 [EstadisticasService] Iniciando generación de estadísticas...");
        System.out.println("📋 [EstadisticasService] Request: " + req);
        List<FichaMemoDTO> memos = serviciosEspecialesService.listarMemos(req);
        System.out.println("📝 [EstadisticasService] Memos obtenidos: " + (memos != null ? memos.size() : 0));
        if (memos == null || memos.isEmpty()) {
            System.out.println("⚠️ [EstadisticasService] No hay memos, retornando DTO vacío");
            return new EstadisticasExportDTO();
        }

        // Personas
        List<FichaPersonaEstadisticaDTO> personas = new ArrayList<>();
        // Armas
        List<FichaArmaEstadisticaDTO> armas = new ArrayList<>();
        // Drogas
        List<FichaDrogaEstadisticaDTO> drogas = new ArrayList<>();
        // Dineros
        List<FichaDineroEstadisticaDTO> dineros = new ArrayList<>();
        // Vehículos
        List<FichaVehiculoEstadisticaDTO> vehiculos = new ArrayList<>();
        // Municiones
        List<FichaMunicionEstadisticaDTO> municiones = new ArrayList<>();
        // Otras Especies
        List<FichaOtrasEspeciesEstadisticaDTO> otrasEspecies = new ArrayList<>();
        // Resumen por memo
        List<FichaMemoEstadisticaDTO> resumen = new ArrayList<>();

        // Sets para deduplicación por clave textual
        Set<String> keyPersonas = new LinkedHashSet<>();
        Set<String> keyArmas = new LinkedHashSet<>();
        Set<String> keyDrogas = new LinkedHashSet<>();
        Set<String> keyDineros = new LinkedHashSet<>();
        Set<String> keyVehiculos = new LinkedHashSet<>();
        Set<String> keyMuniciones = new LinkedHashSet<>();
        Set<String> keyOtras = new LinkedHashSet<>();

        for (FichaMemoDTO m : memos) {
            // resumen por memo
            FichaMemoEstadisticaDTO r = new FichaMemoEstadisticaDTO();
            r.setMemoId(m.getId());
            r.setMemoFolio(m.getFolioBrain());
            r.setMemoRuc(m.getRuc());
            r.setMemoFecha(m.getFecha());
            r.setMemoUnidad(m.getUnidad() != null ? m.getUnidad().getNombreUnidad() : null);
            r.setMemoFormulario(m.getFormulario());
            r.setTotalPersonas(m.getFichaPersonas() != null ? m.getFichaPersonas().size() : 0);
            r.setTotalArmas(m.getFichaArmas() != null ? m.getFichaArmas().size() : 0);
            r.setTotalDrogas(m.getFichaDrogas() != null ? m.getFichaDrogas().size() : 0);
            r.setTotalDineros(m.getFichaDineros() != null ? m.getFichaDineros().size() : 0);
            r.setTotalVehiculos(m.getFichaVehiculos() != null ? m.getFichaVehiculos().size() : 0);
            r.setTotalMuniciones(m.getFichaMuniciones() != null ? m.getFichaMuniciones().size() : 0);
            r.setTotalOtrasEspecies(m.getFichaOtrasEspecies() != null ? m.getFichaOtrasEspecies().size() : 0);
            resumen.add(r);

            // Personas
            if (m.getFichaPersonas() != null) {
                for (FichaPersonaSimpleDTO p : m.getFichaPersonas()) {
                    String key = String.join("|",
                            nullSafe(p.getRut()),
                            nullSafe(p.getNombre()),
                            nullSafe(p.getApellidoPat()),
                            nullSafe(p.getApellidoMat()));
                    if (keyPersonas.add(key)) {
                        FichaPersonaEstadisticaDTO dto = new FichaPersonaEstadisticaDTO();
                        dto.setRut(p.getRut());
                        dto.setNombre(p.getNombre());
                        dto.setApellidoPat(p.getApellidoPat());
                        dto.setApellidoMat(p.getApellidoMat());
                        dto.setEstados(p.getEstados());
                        fillMemoRef(dto, m);
                        personas.add(dto);
                    }
                }
            }

            // Armas
            if (m.getFichaArmas() != null) {
                for (FichaArmaDTO a : m.getFichaArmas()) {
                    String key = String.join("|",
                            nullSafe(a.getSerieArma()),
                            nullSafe(a.getMarcaArma()),
                            nullSafe(a.getTipoArma()),
                            nullSafe(a.getCalibreArma()));
                    if (keyArmas.add(key)) {
                        FichaArmaEstadisticaDTO dto = new FichaArmaEstadisticaDTO();
                        dto.setSerieArma(a.getSerieArma());
                        dto.setCalidad(a.getCalidad());
                        dto.setMarcaArma(a.getMarcaArma());
                        dto.setCondicion(a.getCondicion());
                        dto.setCalibreArma(a.getCalibreArma());
                        dto.setTipoArma(a.getTipoArma());
                        dto.setObs(a.getObs());
                        fillMemoRef(dto, m);
                        armas.add(dto);
                    }
                }
            }

            // Drogas
            if (m.getFichaDrogas() != null) {
                for (FichaDrogaDTO d : m.getFichaDrogas()) {
                    String key = String.join("|",
                            nullSafe(d.getTipoDroga()),
                            nullSafe(d.getUnidadMedida()),
                            String.valueOf(d.getCantidadDroga()));
                    if (keyDrogas.add(key)) {
                        FichaDrogaEstadisticaDTO dto = new FichaDrogaEstadisticaDTO();
                        dto.setTipoDroga(d.getTipoDroga());
                        dto.setUnidadMedida(d.getUnidadMedida());
                        dto.setCantidadDroga(d.getCantidadDroga());
                        dto.setObs(d.getObs());
                        fillMemoRef(dto, m);
                        drogas.add(dto);
                    }
                }
            }

            // Dineros
            if (m.getFichaDineros() != null) {
                for (FichaDineroDTO d : m.getFichaDineros()) {
                    String key = String.join("|",
                            nullSafe(d.getCalidad()),
                            String.valueOf(d.getMonto()),
                            nullSafe(d.getObs()));
                    if (keyDineros.add(key)) {
                        FichaDineroEstadisticaDTO dto = new FichaDineroEstadisticaDTO();
                        dto.setCalidad(d.getCalidad());
                        dto.setMonto(d.getMonto());
                        dto.setObs(d.getObs());
                        fillMemoRef(dto, m);
                        dineros.add(dto);
                    }
                }
            }

            // Vehículos
            if (m.getFichaVehiculos() != null) {
                for (FichaVehiculoDTO v : m.getFichaVehiculos()) {
                    String key = String.join("|",
                            nullSafe(v.getPatente()),
                            nullSafe(v.getMarca()),
                            nullSafe(v.getModelo()));
                    if (keyVehiculos.add(key)) {
                        FichaVehiculoEstadisticaDTO dto = new FichaVehiculoEstadisticaDTO();
                        dto.setPatente(v.getPatente());
                        dto.setMarca(v.getMarca());
                        dto.setModelo(v.getModelo());
                        dto.setCalidad(v.getCalidad());
                        dto.setObs(v.getObs());
                        fillMemoRef(dto, m);
                        vehiculos.add(dto);
                    }
                }
            }

            // Municiones
            if (m.getFichaMuniciones() != null) {
                for (FichaMunicionDTO mu : m.getFichaMuniciones()) {
                    String key = nullSafe(mu.getObs());
                    if (keyMuniciones.add(key)) {
                        FichaMunicionEstadisticaDTO dto = new FichaMunicionEstadisticaDTO();
                        dto.setObs(mu.getObs());
                        fillMemoRef(dto, m);
                        municiones.add(dto);
                    }
                }
            }

            // Otras especies
            if (m.getFichaOtrasEspecies() != null) {
                for (FichaOtrasEspeciesDTO oe : m.getFichaOtrasEspecies()) {
                    String key = String.join("|",
                            nullSafe(oe.getDescripcion()),
                            nullSafe(oe.getNue()),
                            nullSafe(oe.getCantidad()),
                            nullSafe(oe.getAvaluo()),
                            String.valueOf(oe.getUtilizadoComoArma()),
                            nullSafe(oe.getSitioSuceso()));
                    if (keyOtras.add(key)) {
                        FichaOtrasEspeciesEstadisticaDTO dto = new FichaOtrasEspeciesEstadisticaDTO();
                        dto.setCalidad(oe.getCalidad());
                        dto.setDescripcion(oe.getDescripcion());
                        dto.setNue(oe.getNue());
                        dto.setCantidad(oe.getCantidad());
                        dto.setAvaluo(oe.getAvaluo());
                        dto.setUtilizadoComoArma(oe.getUtilizadoComoArma() != null ? String.valueOf(oe.getUtilizadoComoArma()) : null);
                        dto.setSitioSuceso(oe.getSitioSuceso());
                        fillMemoRef(dto, m);
                        otrasEspecies.add(dto);
                    }
                }
            }
        }

        EstadisticasExportDTO out = new EstadisticasExportDTO();
        out.setPersonas(personas);
        out.setArmas(armas);
        out.setDrogas(drogas);
        out.setDineros(dineros);
        out.setVehiculos(vehiculos);
        out.setMuniciones(municiones);
        out.setOtrasEspecies(otrasEspecies);
        out.setResumenMemos(resumen);

        System.out.println("✅ [EstadisticasService] Estadísticas generadas exitosamente");
        System.out.println("📊 [EstadisticasService] Resumen: " +
                "Personas=" + personas.size() +
                ", Armas=" + armas.size() +
                ", Drogas=" + drogas.size() +
                ", Dineros=" + dineros.size() +
                ", Vehículos=" + vehiculos.size() +
                ", Municiones=" + municiones.size() +
                ", Otras=" + otrasEspecies.size() +
                ", Memos=" + resumen.size());

        return out;
    }

    private static String nullSafe(String s) { return s == null ? "" : s.trim(); }

    private static void fillMemoRef(Object target, FichaMemoDTO m) {
        if (target instanceof FichaPersonaEstadisticaDTO dto) {
            applyMemo(dto, m);
        } else if (target instanceof FichaArmaEstadisticaDTO dto) {
            applyMemo(dto, m);
        } else if (target instanceof FichaDrogaEstadisticaDTO dto) {
            applyMemo(dto, m);
        } else if (target instanceof FichaDineroEstadisticaDTO dto) {
            applyMemo(dto, m);
        } else if (target instanceof FichaVehiculoEstadisticaDTO dto) {
            applyMemo(dto, m);
        } else if (target instanceof FichaMunicionEstadisticaDTO dto) {
            applyMemo(dto, m);
        } else if (target instanceof FichaOtrasEspeciesEstadisticaDTO dto) {
            applyMemo(dto, m);
        }
    }

    private static void applyMemo(Object toFill, FichaMemoDTO m) {
        String unidad = m.getUnidad() != null ? m.getUnidad().getNombreUnidad() : null;
        if (toFill instanceof FichaPersonaEstadisticaDTO t) {
            t.setMemoId(m.getId());
            t.setMemoFolio(m.getFolioBrain());
            t.setMemoRuc(m.getRuc());
            t.setMemoFecha(m.getFecha());
            t.setMemoUnidad(unidad);
            t.setMemoFormulario(m.getFormulario());
        } else if (toFill instanceof FichaArmaEstadisticaDTO t) {
            t.setMemoId(m.getId());
            t.setMemoFolio(m.getFolioBrain());
            t.setMemoRuc(m.getRuc());
            t.setMemoFecha(m.getFecha());
            t.setMemoUnidad(unidad);
            t.setMemoFormulario(m.getFormulario());
        } else if (toFill instanceof FichaDrogaEstadisticaDTO t) {
            t.setMemoId(m.getId());
            t.setMemoFolio(m.getFolioBrain());
            t.setMemoRuc(m.getRuc());
            t.setMemoFecha(m.getFecha());
            t.setMemoUnidad(unidad);
            t.setMemoFormulario(m.getFormulario());
        } else if (toFill instanceof FichaDineroEstadisticaDTO t) {
            t.setMemoId(m.getId());
            t.setMemoFolio(m.getFolioBrain());
            t.setMemoRuc(m.getRuc());
            t.setMemoFecha(m.getFecha());
            t.setMemoUnidad(unidad);
            t.setMemoFormulario(m.getFormulario());
        } else if (toFill instanceof FichaVehiculoEstadisticaDTO t) {
            t.setMemoId(m.getId());
            t.setMemoFolio(m.getFolioBrain());
            t.setMemoRuc(m.getRuc());
            t.setMemoFecha(m.getFecha());
            t.setMemoUnidad(unidad);
            t.setMemoFormulario(m.getFormulario());
        } else if (toFill instanceof FichaMunicionEstadisticaDTO t) {
            t.setMemoId(m.getId());
            t.setMemoFolio(m.getFolioBrain());
            t.setMemoRuc(m.getRuc());
            t.setMemoFecha(m.getFecha());
            t.setMemoUnidad(unidad);
            t.setMemoFormulario(m.getFormulario());
        } else if (toFill instanceof FichaOtrasEspeciesEstadisticaDTO t) {
            t.setMemoId(m.getId());
            t.setMemoFolio(m.getFolioBrain());
            t.setMemoRuc(m.getRuc());
            t.setMemoFecha(m.getFecha());
            t.setMemoUnidad(unidad);
            t.setMemoFormulario(m.getFormulario());
        }
    }
}
