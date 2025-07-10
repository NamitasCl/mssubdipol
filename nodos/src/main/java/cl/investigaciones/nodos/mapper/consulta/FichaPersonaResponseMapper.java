package cl.investigaciones.nodos.mapper.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.FichaPersona;
import cl.investigaciones.nodos.domain.entidadesconsulta.listas.ListaNacionalidad;
import cl.investigaciones.nodos.dto.consulta.FichaPersonaResponse;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface FichaPersonaResponseMapper {
    FichaPersonaResponseMapper INSTANCE = Mappers.getMapper(FichaPersonaResponseMapper.class);

    FichaPersonaResponse toDto(FichaPersona fichaPersona);

    default String map(ListaNacionalidad nacionalidad) {
        return nacionalidad != null ? nacionalidad.getNacionalidad() : null;
    }
}
