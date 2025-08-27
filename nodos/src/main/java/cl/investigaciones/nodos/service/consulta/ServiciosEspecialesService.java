package cl.investigaciones.nodos.service.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.FichaMemo;
import cl.investigaciones.nodos.dto.consulta.*;
import cl.investigaciones.nodos.dto.serviciosespeciales.FichaMemoRequestDTO;
import cl.investigaciones.nodos.repository.consulta.FichaMemoRepository;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
public class ServiciosEspecialesService {

    private final FichaMemoRepository memoRepo;

    public ServiciosEspecialesService(FichaMemoRepository memoRepo) {
        this.memoRepo = memoRepo;
    }

    public List<FichaMemoDTO> listarMemos(FichaMemoRequestDTO solicitud) {
        OffsetDateTime fechaInicio = solicitud.getFechaInicioUtc().atOffset(ZoneOffset.UTC);
        OffsetDateTime fechaTermino = solicitud.getFechaTerminoUtc().atOffset(ZoneOffset.UTC);

        List<FichaMemo> memos = memoRepo.findByFechaBetween(fechaInicio, fechaTermino);
        if (memos.isEmpty()) {
            return List.of();
        }

        return memos.stream()
                .map(registro -> {
                    FichaMemoDTO dto = new FichaMemoDTO();
                    dto.setId(registro.getId());
                    dto.setFormulario(registro.getFormulario());
                    dto.setFecha(registro.getFecha());
                    dto.setFolioBrain(registro.getFolioBrain());
                    dto.setRuc(registro.getRuc());
                    dto.setModusDescripcion(registro.getModusDescripcion());

                    if (registro.getFichaPersonas() != null) {
                        dto.setFichaPersonas(registro.getFichaPersonas().stream()
                                .map(persona -> {
                                    FichaPersonaSimpleDTO per = new FichaPersonaSimpleDTO();
                                    per.setId(persona.getId());
                                    per.setNombre(persona.getNombre());
                                    per.setApellidoPat(persona.getApellidoPat());
                                    per.setApellidoMat(persona.getApellidoMat());
                                    per.setRut(persona.getRut());
                                    return per;
                                })
                                .toList()
                        );
                    }

                    if (registro.getFichaArmas() != null) {
                        dto.setFichaArmas(registro.getFichaArmas().stream()
                                .map(arma -> {
                                    FichaArmaDTO ar = new FichaArmaDTO();
                                    ar.setSerieArma(arma.getSerieArma());
                                    ar.setMarcaArma(arma.getMarcaArma());
                                    ar.setTipoArma(arma.getTipoArma().toString());
                                    return ar;
                                }).toList()
                        );
                    }

                    if (registro.getFichaDineros() != null) {
                        dto.setFichaDineros(registro.getFichaDineros().stream()
                                .map(dinero -> {
                                    FichaDineroDTO din = new FichaDineroDTO();
                                    din.setCalidad(dinero.getCalidad());
                                    din.setMonto(dinero.getMonto());
                                    din.setObs(dinero.getObs());
                                    return din;
                                }).toList()
                        );
                    }

                    if (registro.getFichaDrogas() != null) {
                        dto.setFichaDrogas(registro.getFichaDrogas().stream()
                                .map(droga -> {
                                    FichaDrogaDTO dro = new FichaDrogaDTO();
                                    dro.setTipoDroga(droga.getTipoDroga());
                                    dro.setCantidadDroga(droga.getCantidadDroga());
                                    dro.setUnidadMedida(droga.getUnidadMedida());
                                    dro.setObs(droga.getObs());
                                    return dro;
                                }).toList()
                        );
                    }

                    if (registro.getFichaFuncionarios() != null) {
                        dto.setFichaFuncionarios(registro.getFichaFuncionarios().stream()
                                .map(funcionario -> {
                                    FichaFuncionarioDTO fun = new FichaFuncionarioDTO();
                                    fun.setFuncionario(funcionario.getFuncionario());
                                    fun.setResponsabilidadMemo(funcionario.getResponsabilidadMemo());
                                    return fun;
                                }).toList()
                        );
                    }

                    if (registro.getFichaMuniciones() != null) {
                        dto.setFichaMuniciones(registro.getFichaMuniciones().stream()
                                .map(municion -> {
                                    FichaMunicionDTO mun = new FichaMunicionDTO();
                                    mun.setObs(municion.getObs());
                                    return mun;
                                }).toList()
                        );
                    }

                    if (registro.getFichaVehiculos() != null) {
                        dto.setFichaVehiculos(registro.getFichaVehiculos().stream()
                                .map(vehiculo -> {
                                    FichaVehiculoDTO veh = new FichaVehiculoDTO();
                                    veh.setPatente(vehiculo.getPatente());
                                    veh.setMarca(vehiculo.getMarca().toString());
                                    veh.setModelo(vehiculo.getModelo().toString());
                                    veh.setCalidad(vehiculo.getCalidad());
                                    veh.setObs(vehiculo.getObs());
                                    return veh;
                                }).toList()
                        );
                    }


                    return dto;
                })
                .toList();

    }
}
