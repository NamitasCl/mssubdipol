package cl.investigaciones.turnos.calendar.domain;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AporteUnidadProcepol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long idCalendario;
    private Long idUnidad;
    private String siglasUnidad;
    private Integer cantidadLunesViernes;
    private Integer cantidadSabado;
    private Integer cantidadDomingo;
    private Integer cantidadFestivo;
    private Boolean isTercero;

}
