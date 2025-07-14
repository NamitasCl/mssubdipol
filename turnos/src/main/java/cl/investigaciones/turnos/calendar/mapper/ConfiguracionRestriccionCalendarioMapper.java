package cl.investigaciones.turnos.calendar.mapper;

import cl.investigaciones.turnos.calendar.domain.ConfiguracionRestriccionesCalendario;
import cl.investigaciones.turnos.calendar.dto.ConfiguracionRestriccionesCalendarioDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface ConfiguracionRestriccionCalendarioMapper {
    ConfiguracionRestriccionCalendarioMapper INSTANCE = Mappers.getMapper(ConfiguracionRestriccionCalendarioMapper.class);

    ConfiguracionRestriccionesCalendario toEntity(ConfiguracionRestriccionesCalendarioDTO dto);
    ConfiguracionRestriccionesCalendarioDTO toDto(ConfiguracionRestriccionesCalendario entity);
}
