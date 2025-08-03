package cl.investigaciones.commonservices.service;

import cl.investigaciones.commonservices.dto.DelitoResponseDto;
import cl.investigaciones.commonservices.model.Delito;
import cl.investigaciones.commonservices.repository.DelitoRepository;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DelitoService {

    private DelitoRepository delitoRepository;

    public DelitoService(DelitoRepository delitoRepository) {
        this.delitoRepository = delitoRepository;
    }

    public List<DelitoResponseDto> buscarDelito(String filtro) {

        if(filtro.length() < 3) {
            return Collections.emptyList();
        }

        List<Delito> delitosEncontrados = delitoRepository.findByDelitoContainingIgnoreCase(filtro);
        return delitosEncontrados.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private DelitoResponseDto mapToDto(Delito delito) {
        DelitoResponseDto dto = new DelitoResponseDto();
        dto.setCodigo(delito.getCodigo());
        dto.setFamilia(delito.getFamilia());
        dto.setDelito(delito.getDelito());
        return dto;
    }


}
