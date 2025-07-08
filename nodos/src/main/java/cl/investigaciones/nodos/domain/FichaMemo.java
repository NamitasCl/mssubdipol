package cl.investigaciones.nodos.domain;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Immutable;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "ficha_memo", schema = "nodos")
@Data
@Immutable
public class FichaMemo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private boolean isActive;
    private boolean isDeleted;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    private UUID uuid;

    private String concurrencia;
    private String ficha;
    private String tipo;
    private String hecho;

    private Long regpolId;
    private Long prefecturaId;
    private String asiento;
    private Long comunaId;
    private Long unidadId;
    private OffsetDateTime fecha;

    private String folioBrain;
    private String ruc;
    private Long fiscaliaId;
    private OffsetDateTime fechaFis;

    private String redactor;
    private String mediatico;
    private String estado;
    private String detalleEst;
    private Integer numvictima;

    private Long barrioId;
    private String numarmas;
    private String funcionario;
    private String modusDescripcion;
    private String diligencia;

    private Long grupoId;
    private String tipobanda;
    private String nombanda;
    private String nombreoperacion;
    private String cantDroga;
    private String vehiculosInca;
    private String armasCant;
    private String impuNna;
    private String impuChi;
    private String impuExt;
    private String unidadSol;

    private Long unidadDenId;
    private String modalidad;
    private OffsetDateTime fechaFinDel;
    private String resulEmpadro;
    private String recFoto;
    private String retrato;
    private String dineroSus;
    private String avaluo;
    private String totalImp;

    private Long userId;
    private String tempHistoryChangeReasonMemo;
    private String connotacionI;
    private String detMovilI;
    private String dispo;
    private String escla;
    private OffsetDateTime fechaInfoPol;
    private String infoPol;
    private String institucion;
    private String lugar;
    private String modusI;
    private String movilI;
    private String otroConnot;
    private String relaVicImpuD;
    private String relaVictImpu;
    private String formulario;
    private String nomgrupo;
    private String prensa;
    private String tipoMemo;
    private OffsetDateTime fechaInicioDel;
    private String relevante;
    private String contextmip;
    private String usuarioAd;
    private String echo;
    private String ofan;
    private String comunaUnidad;
    private String regionUnidad;
    private String folioFiscalia;
    private String idLacrim;
    private String fiscal;
    private String estadoReporte;
    private String idDocumento;
    private String urlDoc;
    private String url;
    private String tipoAcceso;
    private String correccionResumen;
    private String resumenIA;
    private OffsetDateTime fechaValidacion;
    private Long revisadoPorId;
    private boolean revisionValidada;

}
