package cl.investigaciones.auth.security.provider;

import cl.investigaciones.auth.dto.ActiveDirectoryUserResponseDTO;
import cl.investigaciones.auth.dto.TokenActiveDirectoryDTO;
import cl.investigaciones.auth.dto.TokenActiveDirectoryResultDTO;
import cl.investigaciones.auth.dto.UsuarioActiveDirectoryDTO;
import cl.investigaciones.auth.model.Rol;
import cl.investigaciones.auth.model.Usuario;
import cl.investigaciones.auth.repository.RolRepository;
import cl.investigaciones.auth.repository.UsuarioRepository;
import cl.investigaciones.auth.security.details.UsuarioDetails;
import jakarta.transaction.Transactional;
import org.springframework.http.*;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Component
public class CustomAuthenticationProvider implements AuthenticationProvider {

    UsuarioRepository usuarioRepository;

    RolRepository rolRepository;

    public CustomAuthenticationProvider(UsuarioRepository usuarioRepository, RolRepository rolRepository) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
    }

    @Override
    @Transactional
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        System.out.println("Entrando a authenticate localhost");

        Rol rolJefe = rolRepository.findByNombre("ROLE_JEFE")
                .orElseThrow(() -> new RuntimeException("No se encontró el rol ROL_JEFE en la base de datos"));
        Rol rolFuncionario = rolRepository.findByNombre("ROLE_FUNCIONARIO")
                .orElseThrow(() -> new RuntimeException("No se encontró el rol ROL_FUNCIONARIO en la base de datos"));
        Rol rolRevisor = rolRepository.findByNombre("ROLE_REVISOR")
                .orElseThrow(() -> new RuntimeException("No se encontró el rol ROL_REVISOR en la base de datos"));

        String username = authentication.getName();
        String password = String.valueOf(authentication.getCredentials());

        ActiveDirectoryUserResponseDTO respuesta = consultaUsuarioActiveDirectory(username, password);
        if (!respuesta.isSuccess()) {
            throw new BadCredentialsException("Credenciales incorrectas");
        }
        UsuarioActiveDirectoryDTO usuarioAD = respuesta.getResult();

        // Cargar o crear usuario desde BD (FUENTE DE VERDAD DE ROLES)
        Usuario usuarioBD = usuarioRepository.findByUsernameIgnoreCase(username)
                .orElseGet(Usuario::new);

        if (usuarioBD.getId() == null) {
            // Crear: setear username y rol por defecto UNA sola vez
            usuarioBD.setUsername(usuarioAD.getUsuarioAD());
            Set<Rol> rolesIniciales = new HashSet<>();
            if ("JEFE".equalsIgnoreCase(usuarioAD.getNombrePerfil())) {
                rolesIniciales.add(rolJefe);
            } else {
                rolesIniciales.add(rolFuncionario);
            }
            usuarioBD.setRoles(rolesIniciales);
        }

        // Actualizar campos no sensibles
        usuarioBD.setNombre(usuarioAD.getNombreFun());
        usuarioBD.setApellidoPaterno(usuarioAD.getApellidoPaternoFun());
        usuarioBD.setApellidoMaterno(usuarioAD.getApellidoMaternoFun());
        usuarioBD.setNombrePerfil(usuarioAD.getNombrePerfil());
        usuarioBD.setSiglasUnidad(usuarioAD.getSiglasUnidad());
        usuarioBD.setEmail(usuarioAD.getEmailFun());
        usuarioBD.setAntiguedad(usuarioAD.getAntiguedad());
        usuarioBD.setIdFun(usuarioAD.getIdFun());
        usuarioBD.setSiglasCargo(usuarioAD.getSiglasCargo());
        usuarioBD.setIdUnidad(usuarioAD.getIdUnidad());
        usuarioBD.setNombreUnidad(usuarioAD.getNombreUnidad());
        usuarioBD.setRut(usuarioAD.getRunFun());
        usuarioBD.setDv(usuarioAD.getDvFun());
        usuarioBD.setNombreCargo(usuarioAD.getNombreCargo());

        // === Reglas de roles: CONSERVAR lo existente y AGREGAR si aplica ===
        Set<Rol> rolesActuales = new HashSet<>(usuarioBD.getRoles() == null ? Set.of() : usuarioBD.getRoles());

        // Regla 1: por perfil AD, agrega si no está (no quites lo que ya tenía)
        if ("JEFE".equalsIgnoreCase(usuarioAD.getNombrePerfil())) {
            rolesActuales.add(rolJefe);
        } else {
            rolesActuales.add(rolFuncionario);
        }

        // Regla 2: condición extra (PLANA MAYOR) => agrega REVISOR sin quitar otros
        if ("FUNCIONARIO".equalsIgnoreCase(usuarioAD.getNombrePerfil())
                && usuarioAD.getNombreUnidad() != null
                && usuarioAD.getNombreUnidad().toUpperCase().contains("PLANA MAYOR")) {
            rolesActuales.add(rolRevisor);
        }

        // Importante: NO eliminar roles que el admin haya dado manualmente
        usuarioBD.setRoles(rolesActuales);

        usuarioRepository.save(usuarioBD);

        UsuarioDetails userDetails = new UsuarioDetails(usuarioBD);
        return new UsernamePasswordAuthenticationToken(userDetails, password, userDetails.getAuthorities());
    }


    private ActiveDirectoryUserResponseDTO consultaUsuarioActiveDirectory(String username, String password) {
        String tokenAd = "https://apialma.investigaciones.cl/api/Login/GetToken";
        String urlAd = "https://apialma.investigaciones.cl/api/Funcionario/ListarFuncionarioByLogin";

        Map<String, String> tokenBodyRequest = new HashMap<>();

        tokenBodyRequest.put("usuarioAD", "eramirezs");
        tokenBodyRequest.put("contraseñaFun", "Mhb2015.@");
        tokenBodyRequest.put("keySistema", "UNE1KBATI6BNVLQF8Z9O");

        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, String>> request = new HttpEntity<>(tokenBodyRequest, headers);

        ResponseEntity<TokenActiveDirectoryResultDTO> response = restTemplate
                .exchange(tokenAd, HttpMethod.POST, request, TokenActiveDirectoryResultDTO.class);

        if (response.getBody() == null || !response.getBody().isSuccess() || response.getBody().getResult() == null) {
            throw new RuntimeException("Error al obtener token de autenticación");
        }

        TokenActiveDirectoryDTO token = response.getBody().getResult();
        String tokenValue = token.getToken();

        System.out.println("Token: " + tokenValue);

        HttpHeaders authHeaders = new HttpHeaders();
        authHeaders.setContentType(MediaType.APPLICATION_JSON);
        authHeaders.setBearerAuth(tokenValue);

        Map<String, String> authBodyRequest = Map.of(
                "usuarioAD", username,
                "contraseñaFun", password
        );

        ResponseEntity<ActiveDirectoryUserResponseDTO> authResponse = restTemplate
                .exchange(urlAd, HttpMethod.POST, new HttpEntity<>(authBodyRequest, authHeaders), ActiveDirectoryUserResponseDTO.class);

        ActiveDirectoryUserResponseDTO body = authResponse.getBody();
        System.out.println("Success: " + body.isSuccess());
        System.out.println("User: " + body.getResult());
        if (body.getResult() != null) {
            System.out.println("Nombre usuario: " + body.getResult().getNombreFun());
            System.out.println("Perfil: " + body.getResult().getNombrePerfil());
        }


        if (authResponse.getBody() == null || !authResponse.getBody().isSuccess() || authResponse.getBody().getResult() == null) {
            throw new RuntimeException("Error al autenticar usuario");
        }

        return authResponse.getBody();
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
    }
}
