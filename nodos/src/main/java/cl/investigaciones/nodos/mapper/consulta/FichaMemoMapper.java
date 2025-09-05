package cl.investigaciones.nodos.mapper.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.FichaMemo;
import cl.investigaciones.nodos.dto.consulta.FichaMemoDTO;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(
        componentModel = "spring",
        uses = {
                FichaPersonaSimpleMapper.class,
                FichaArmaMapper.class,
                FichaDineroMapper.class,
                FichaDrogaMapper.class,
                FichaFuncionarioMapper.class,
                FichaMunicionMapper.class,
                FichaVehiculoMapper.class,
                FichaOtrasEspeciesMapper.class, // ✅ AGREGADO
        }
)
public interface FichaMemoMapper {
    FichaMemoMapper INSTANCE = Mappers.getMapper(FichaMemoMapper.class);

    FichaMemoDTO toDto(FichaMemo entity);

}
