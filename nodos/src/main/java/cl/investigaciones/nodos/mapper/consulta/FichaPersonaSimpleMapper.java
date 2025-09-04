// src/main/java/cl/investigaciones/nodos/mapper/consulta/FichaPersonaSimpleMapper.java
package cl.investigaciones.nodos.mapper.consulta;

import cl.investigaciones.nodos.domain.entidadesconsulta.FichaPersona;
import cl.investigaciones.nodos.domain.entidadesconsulta.listas.ListaCalidadPersona;
import cl.investigaciones.nodos.domain.entidadesconsulta.listas.ListaNacionalidad;
import cl.investigaciones.nodos.dto.consulta.FichaPersonaSimpleDTO;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface FichaPersonaSimpleMapper {

    // MapStruct llamará automáticamente a los métodos "map(...)" de abajo
    FichaPersonaSimpleDTO toDto(FichaPersona source);

    // ---- helpers de conversión ----

    // Set<ListaCalidadPersona> -> Set<String>
    default Set<String> map(Set<ListaCalidadPersona> value) {
        if (value == null || value.isEmpty()) return Collections.emptySet();
        return value.stream()
                .map(ListaCalidadPersona::getCalidad)  // <-- ajusta si tu campo se llama distinto
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    // ListaNacionalidad -> String
    default String map(ListaNacionalidad value) {
        if (value == null) return null;
        return value.getNacionalidad();               // <-- AJUSTA al nombre real del getter (p.ej. getDescripcion())
    }
}
