package cl.investigaciones.nodos.mapper.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.FichaPersona;
import cl.investigaciones.nodos.domain.entidadesconsulta.listas.ListaCalidadPersona;
import cl.investigaciones.nodos.domain.entidadesconsulta.listas.ListaDelito;
import cl.investigaciones.nodos.domain.entidadesconsulta.listas.ListaNacionalidad;
import cl.investigaciones.nodos.dto.consulta.FichaPersonaSimpleDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface FichaPersonaSimpleMapper {

    // ✅ MAPEOS EXPLÍCITOS para campos con conversiones especiales
    @Mapping(target = "delitos", source = "delitos")
    @Mapping(target = "estados", source = "estados", qualifiedByName = "mapEstados")
    @Mapping(target = "nacionalidad", source = "nacionalidad")
    FichaPersonaSimpleDTO toDto(FichaPersona source);

    // ---- helpers de conversión ----

    // Set<ListaCalidadPersona> -> Set<String> para ESTADOS
    @Named("mapEstados")
    default Set<String> mapEstados(Set<ListaCalidadPersona> value) {
        if (value == null || value.isEmpty()) return Collections.emptySet();
        return value.stream()
                .map(ListaCalidadPersona::getCalidad)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    // ListaNacionalidad -> String
    default String map(ListaNacionalidad value) {
        if (value == null) return null;
        return value.getNacionalidad();
    }

    // ✅ MÉTODO RENOMBRADO: Set<ListaDelito> -> Set<String> para DELITOS
    // Cambié de "mapDelitos" a "map" para que MapStruct lo use automáticamente
    default Set<String> map(Set<ListaDelito> value) {
        if (value == null || value.isEmpty()) return Collections.emptySet();
        return value.stream()
                .map(ListaDelito::getDelito)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }
}
