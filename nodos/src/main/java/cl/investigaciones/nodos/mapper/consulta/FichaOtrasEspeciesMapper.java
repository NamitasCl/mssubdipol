package cl.investigaciones.nodos.mapper.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.FichaOtrasEspecies;
import cl.investigaciones.nodos.dto.consulta.FichaOtrasEspeciesDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface FichaOtrasEspeciesMapper {
    FichaOtrasEspeciesMapper INSTANCE = Mappers.getMapper(FichaOtrasEspeciesMapper.class);

    FichaOtrasEspeciesDTO toDto(FichaOtrasEspecies entity);
}
