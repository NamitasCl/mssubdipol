package cl.investigaciones.nodos.mapper.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.FichaMunicion;
import cl.investigaciones.nodos.dto.consulta.FichaMunicionDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface FichaMunicionMapper {
    FichaMunicionMapper INSTANCE = Mappers.getMapper(FichaMunicionMapper.class);

    FichaMunicionDTO toDto(FichaMunicion entity);
}
