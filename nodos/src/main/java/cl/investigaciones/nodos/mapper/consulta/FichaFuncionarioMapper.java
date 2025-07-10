package cl.investigaciones.nodos.mapper.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.FichaFuncionario;
import cl.investigaciones.nodos.dto.consulta.FichaFuncionarioDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface FichaFuncionarioMapper {
    FichaFuncionarioMapper INSTANCE = Mappers.getMapper(FichaFuncionarioMapper.class);

    FichaFuncionarioDTO toDto(FichaFuncionario entity);
}
