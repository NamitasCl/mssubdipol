package cl.investigaciones.nodos.mapper.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.FichaArma;
import cl.investigaciones.nodos.dto.consulta.FichaArmaDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface FichaArmaMapper {
    FichaArmaMapper INSTANCE = Mappers.getMapper(FichaArmaMapper.class);

    @Mapping(target = "calibreArma", source = "calibreArma.calibre")
    @Mapping(target = "tipoArma", source = "tipoArma.tipoArma")
    FichaArmaDTO toDto(FichaArma entity);
}
