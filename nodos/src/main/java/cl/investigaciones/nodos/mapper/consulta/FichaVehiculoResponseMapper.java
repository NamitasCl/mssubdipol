package cl.investigaciones.nodos.mapper.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.FichaVehiculo;
import cl.investigaciones.nodos.dto.consulta.FichaVehiculoResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface FichaVehiculoResponseMapper {
    FichaVehiculoResponseMapper INSTANCE = Mappers.getMapper(FichaVehiculoResponseMapper.class);

    @Mapping(target = "marca", source = "marca.marca")
    @Mapping(target = "modelo", source = "modelo.modelo")
    @Mapping(target = "tipo", source = "tipo.tipoVehiculo")
    @Mapping(target = "memos", ignore = true)
    FichaVehiculoResponse toDto(FichaVehiculo entity);
}
