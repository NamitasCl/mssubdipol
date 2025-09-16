package cl.investigaciones.nodos.controller.consulta;

import cl.investigaciones.nodos.config.elements.JwtUserPrincipal;
import cl.investigaciones.nodos.domain.auditoriamemos.EstadoRevision;
import cl.investigaciones.nodos.domain.auditoriamemos.MemoRevisado;
import cl.investigaciones.nodos.domain.auditoriamemos.RolRevisor;
import cl.investigaciones.nodos.domain.entidadesconsulta.FichaMemo;
import cl.investigaciones.nodos.dto.serviciosespeciales.MemoEstadosPorRolDTO;
import cl.investigaciones.nodos.dto.serviciosespeciales.MemoRevisadoRequestDTO;
import cl.investigaciones.nodos.dto.serviciosespeciales.MemoRevisionDetalleDTO;
import cl.investigaciones.nodos.repository.auditoriamemos.MemoRevisadoRepository;
import jakarta.persistence.EntityManager;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/nodos/memo-revisado")
@CrossOrigin("*")
public class MemoRevisadoController {

    private final MemoRevisadoRepository memoRevisadoRepository;
    private final EntityManager entityManager;

    public MemoRevisadoController(MemoRevisadoRepository memoRevisadoRepository, EntityManager entityManager) {
        this.memoRevisadoRepository = memoRevisadoRepository;
        this.entityManager = entityManager;
    }

    // POST con idempotencia y datos del revisor desde JWT
    @PostMapping
    public ResponseEntity<MemoRevisado> saveMemoRevisado(@RequestBody MemoRevisadoRequestDTO req) {
        try {
            if (req.getMemoId() == null || req.getEstado() == null) {
                return ResponseEntity.badRequest().build();
            }

            // Idempotencia por requestId
            if (req.getRequestId() != null && !req.getRequestId().isBlank()) {
                Optional<MemoRevisado> existente = memoRevisadoRepository.findByMemo_IdAndRequestId(req.getMemoId(), req.getRequestId());
                if (existente.isPresent()) {
                    return ResponseEntity.ok(existente.get());
                }
            }

            // Obtener datos del JWT si no vienen en el request
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            JwtUserPrincipal principal = null;
            if (auth != null && auth.getPrincipal() instanceof JwtUserPrincipal p) {
                principal = p;
            }

            MemoRevisado memoRevisado = new MemoRevisado();
            FichaMemo memoRef = entityManager.getReference(FichaMemo.class, req.getMemoId());
            memoRevisado.setMemo(memoRef);

            memoRevisado.setEstado(req.getEstado());
            memoRevisado.setObservaciones(Optional.ofNullable(req.getObservaciones()).orElse(req.getObservacion()));

            // Poblar desde JWT si está disponible
            if (principal != null) {
                memoRevisado.setNombreRevisor(Optional.ofNullable(req.getNombreRevisor()).orElse(principal.getNombreUsuario()));
                memoRevisado.setUnidadRevisor(Optional.ofNullable(req.getUnidadRevisor()).orElse(principal.getSiglasUnidad()));
                memoRevisado.setUsuarioRevisor(Optional.ofNullable(req.getUsuarioRevisor()).orElse(principal.getUsername()));

                // Mapear nombrePerfil/roles a RolRevisor si no viene en request
                RolRevisor rol = req.getRolRevisor();
                if (rol == null) {
                    rol = mapPerfilToRol(principal.getNombrePerfil(), principal.getRoles());
                }
                memoRevisado.setRolRevisor(rol != null ? rol : RolRevisor.PMAYOR);
            } else {
                memoRevisado.setNombreRevisor(req.getNombreRevisor());
                memoRevisado.setUnidadRevisor(req.getUnidadRevisor());
                memoRevisado.setUsuarioRevisor(req.getUsuarioRevisor());
                memoRevisado.setRolRevisor(req.getRolRevisor() != null ? req.getRolRevisor() : RolRevisor.PMAYOR);
            }

            memoRevisado.setCreatedAt(req.getCreatedAt() != null ? req.getCreatedAt() : OffsetDateTime.now(ZoneOffset.UTC));
            memoRevisado.setOrigen(req.getOrigen());
            memoRevisado.setRequestId(req.getRequestId());

            MemoRevisado guardado = memoRevisadoRepository.save(memoRevisado);
            return ResponseEntity.ok(guardado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // GET historial completo
    @GetMapping("/historial/{memoId}")
    public ResponseEntity<List<MemoRevisionDetalleDTO>> historial(@PathVariable Long memoId) {
        List<MemoRevisado> historial = memoRevisadoRepository.findHistorial(memoId);
        List<MemoRevisionDetalleDTO> dtos = historial.stream().map(this::toDetalleDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // GET últimos por rol para múltiples memos: /ultimos-por-rol?memoIds=1,2,3
    @GetMapping("/ultimos-por-rol")
    public ResponseEntity<List<MemoEstadosPorRolDTO>> ultimosPorRol(@RequestParam("memoIds") String memoIdsCsv) {
        if (memoIdsCsv == null || memoIdsCsv.isBlank()) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        List<Long> ids = Arrays.stream(memoIdsCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Long::valueOf)
                .collect(Collectors.toList());

        List<MemoRevisado> lista = memoRevisadoRepository.findUltimosPorRolYMemoIds(ids);
        Map<Long, MemoEstadosPorRolDTO> grouped = new HashMap<>();
        for (MemoRevisado mr : lista) {
            Long memoId = mr.getMemo().getId();
            MemoEstadosPorRolDTO dto = grouped.computeIfAbsent(memoId, k -> new MemoEstadosPorRolDTO());
            dto.setMemoId(memoId);
            switch (mr.getRolRevisor()) {
                case JEFE -> dto.setJefe(toDetalleDTO(mr));
                case CONTRALOR -> dto.setContralor(toDetalleDTO(mr));
                case PMAYOR, PM -> dto.setPlana(toDetalleDTO(mr));
            }
        }
        // calcular estadoGlobal
        for (MemoEstadosPorRolDTO dto : grouped.values()) {
            EstadoRevision global = null;
            if (dto.getJefe() != null) global = dto.getJefe().getEstado();
            else if (dto.getContralor() != null) global = dto.getContralor().getEstado();
            else if (dto.getPlana() != null) global = dto.getPlana().getEstado();
            dto.setEstadoGlobal(global != null ? global : EstadoRevision.PENDIENTE);
        }
        return ResponseEntity.ok(new ArrayList<>(grouped.values()));
    }

    private MemoRevisionDetalleDTO toDetalleDTO(MemoRevisado mr) {
        MemoRevisionDetalleDTO dto = new MemoRevisionDetalleDTO();
        dto.setId(mr.getId());
        dto.setMemoId(mr.getMemo() != null ? mr.getMemo().getId() : null);
        dto.setEstado(mr.getEstado());
        dto.setRolRevisor(mr.getRolRevisor());
        dto.setObservaciones(mr.getObservaciones());
        dto.setNombreRevisor(mr.getNombreRevisor());
        dto.setUnidadRevisor(mr.getUnidadRevisor());
        dto.setUsuarioRevisor(mr.getUsuarioRevisor());
        dto.setCreatedAt(mr.getCreatedAt());
        dto.setOrigen(mr.getOrigen());
        dto.setRequestId(mr.getRequestId());
        return dto;
    }

    private RolRevisor mapPerfilToRol(String nombrePerfil, List<String> roles) {
        if (roles != null) {
            for (String r : roles) {
                if (r != null && r.toUpperCase(Locale.ROOT).contains("CONTRALOR")) {
                    return RolRevisor.CONTRALOR;
                }
            }
        }
        if (nombrePerfil == null) return RolRevisor.PMAYOR;
        String np = nombrePerfil.trim().toUpperCase(Locale.ROOT);
        if (np.equals("JEFE")) return RolRevisor.JEFE;
        // cualquier otro caso es PLANA
        return RolRevisor.PMAYOR;
    }
}
