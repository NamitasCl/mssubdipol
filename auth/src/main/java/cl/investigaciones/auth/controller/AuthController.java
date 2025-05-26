package cl.investigaciones.auth.controller;

import cl.investigaciones.auth.dto.AuthRequest;
import cl.investigaciones.auth.dto.AuthResponse;
import cl.investigaciones.auth.dto.TokenActiveDirectoryDTO;
import cl.investigaciones.auth.dto.TokenActiveDirectoryResultDTO;
import cl.investigaciones.auth.repository.UsuarioRepository;
import cl.investigaciones.auth.security.details.UsuarioDetails;
import cl.investigaciones.auth.util.JwtUtil;
import org.springframework.http.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private AuthenticationManager authenticationManager;
    private JwtUtil jwtUtil;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil, UsuarioRepository usuarioRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Autenticación principal
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
        );

        UsuarioDetails usuarioDetails = (UsuarioDetails) auth.getPrincipal();
        String token = jwtUtil.generateToken(
                usuarioDetails.getUsername(),
                usuarioDetails.getRoles(),
                usuarioDetails.getNombreCompleto(),
                usuarioDetails.getNombreCargo(),
                usuarioDetails.getSiglasUnidad(),
                usuarioDetails.isAdmin(),
                usuarioDetails.getId(),
                usuarioDetails.getPermisos()
        );

        SecurityContextHolder.getContext().setAuthentication(auth);
        return ResponseEntity.ok(new AuthResponse(token));
    }

    /**
     * Test para verificar disponibilidad del endpoint
     */
    @PostMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Test ok");
    }

    /**
     * Obtener token desde Active Directory externo
     */
    @GetMapping("/token")
    public ResponseEntity<String> getToken() {
        String tokenAd = "https://apialma.investigaciones.cl/api/Login/GetToken";

        Map<String, String> tokenBodyRequest = new HashMap<>();
        tokenBodyRequest.put("usuarioAD", "lcarrascol");
        tokenBodyRequest.put("contraseñaFun", "Pdi2024+++");
        tokenBodyRequest.put("keySistema", "UNE1KBATI6BNVLQF8Z9O");

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, String>> request = new HttpEntity<>(tokenBodyRequest, headers);
        ResponseEntity<TokenActiveDirectoryResultDTO> response = restTemplate.exchange(
                tokenAd, HttpMethod.POST, request, TokenActiveDirectoryResultDTO.class
        );

        if (response.getBody() == null || !response.getBody().isSuccess() || response.getBody().getResult() == null) {
            throw new RuntimeException("Error al obtener token de autenticación");
        }

        TokenActiveDirectoryDTO token = response.getBody().getResult();
        return ResponseEntity.ok(token.getToken());
    }
}