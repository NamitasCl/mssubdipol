package cl.investigaciones.nodos.mapper.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.FichaDroga;
import cl.investigaciones.nodos.dto.consulta.FichaDrogaDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface FichaDrogaMapper {
    FichaArmaMapper INSTANCE = Mappers.getMapper(FichaArmaMapper.class);

    FichaDrogaDTO toDto(FichaDroga entity);
}
