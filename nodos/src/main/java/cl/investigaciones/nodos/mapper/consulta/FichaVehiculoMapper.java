package cl.investigaciones.nodos.mapper.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.FichaVehiculo;
import cl.investigaciones.nodos.dto.consulta.FichaVehiculoDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface FichaVehiculoMapper {
    FichaFuncionarioMapper INSTANCE = Mappers.getMapper(FichaFuncionarioMapper.class);

    @Mapping(target = "marca", source = "marca.marca")
    @Mapping(target = "modelo", source = "modelo.modelo")
    FichaVehiculoDTO toDto(FichaVehiculo entity);
}
