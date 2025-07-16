package cl.investigaciones.nodos.mapper.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.FichaDinero;
import cl.investigaciones.nodos.dto.consulta.FichaDineroDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface FichaDineroMapper {
    FichaDineroMapper INSTANCE = Mappers.getMapper(FichaDineroMapper.class);

    FichaDineroDTO toDto(FichaDinero entity);
}
