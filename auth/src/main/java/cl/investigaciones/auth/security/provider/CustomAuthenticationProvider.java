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
import org.springframework.http.*;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Component
public class CustomAuthenticationProvider implements AuthenticationProvider {

    UsuarioRepository usuarioRepository;

    RolRepository rolRepository;

    public CustomAuthenticationProvider(UsuarioRepository usuarioRepository, RolRepository rolRepository) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        Rol rolJefe = rolRepository.findByNombre("ROLE_JEFE")
                .orElseThrow(() -> new RuntimeException("No se encontró el rol ROL_JEFE en la base de datos"));

        Rol rolFuncionario = rolRepository.findByNombre("ROLE_FUNCIONARIO")
                .orElseThrow(() -> new RuntimeException("No se encontró el rol ROL_FUNCIONARIO en la base de datos"));

        String username = authentication.getName();
        String password = authentication.getCredentials().toString();


        ActiveDirectoryUserResponseDTO respuesta = consultaUsuarioActiveDirectory(username, password);

        if (!respuesta.isSuccess()) {
            throw new BadCredentialsException("Credenciales incorrectas");
        }


        UsuarioActiveDirectoryDTO usuarioAD = respuesta.getResult();
        /*
        UsuarioActiveDirectoryDTO usuarioAD = new UsuarioActiveDirectoryDTO(
            "ERAMIREZS",
                "15783070",
                "8",
                "ENZO ALEJANDRO",
                "RAMIREZ",
                12254,
                "SUBCOMISARIO (OPP)",
                "SILVA",
                "BRIGADA INVESTIGADORA DE DELITOS ECONOMICOS METROPOLITANA",
                "FUNCIONARIO",
                "BRIDECMET",
                "SUBCOMISARIO (OPP)",
                "ERAMIREZS@INVESTIGACIONES.CL",
                "14"
        );
        */

        // 🔄 Mutable set para evitar java.lang.UnsupportedOperationException
        Set<Rol> rolesAsignados = new HashSet<>();
        if ("JEFE".equalsIgnoreCase(usuarioAD.getNombrePerfil())) {
            rolesAsignados.add(rolJefe);
        } else {
            rolesAsignados.add(rolFuncionario);
        }

        Optional<Usuario> optionalUsuario = usuarioRepository.findByUsernameIgnoreCase(username);
        Usuario usuarioBD;

        if (optionalUsuario.isPresent()) {
            usuarioBD = optionalUsuario.get(); // ya tiene ID, JPA hará UPDATE

            // Solo actualizas lo necesario:
            usuarioBD.setNombre(usuarioAD.getNombreFun());
            usuarioBD.setApellidoPaterno(usuarioAD.getApellidoPaternoFun());
            usuarioBD.setApellidoMaterno(usuarioAD.getApellidoMaternoFun());
            usuarioBD.setNombrePerfil(usuarioAD.getNombrePerfil());
            usuarioBD.setEmail(usuarioAD.getEmailFun());
            usuarioBD.setAntiguedad(usuarioAD.getAntiguedad());
            usuarioBD.setRoles(optionalUsuario.get().getRoles());
            usuarioBD.setIdFun(usuarioAD.getIdFun());
            usuarioBD.setSiglasCargo(usuarioAD.getSiglasCargo());
        } else {
            usuarioBD = new Usuario();
            usuarioBD.setUsername(usuarioAD.getUsuarioAD()); // username nuevo
            usuarioBD.setNombre(usuarioAD.getNombreFun());
            usuarioBD.setApellidoPaterno(usuarioAD.getApellidoPaternoFun());
            usuarioBD.setApellidoMaterno(usuarioAD.getApellidoMaternoFun());
            usuarioBD.setNombrePerfil(usuarioAD.getNombrePerfil());
            usuarioBD.setRut(usuarioAD.getRunFun());
            usuarioBD.setDv(usuarioAD.getDvFun());
            usuarioBD.setSiglasUnidad(usuarioAD.getSiglasUnidad());
            usuarioBD.setIdUnidad(usuarioAD.getIdUnidad());
            usuarioBD.setNombreCargo(usuarioAD.getNombreCargo());
            usuarioBD.setEmail(usuarioAD.getEmailFun());
            usuarioBD.setAntiguedad(usuarioAD.getAntiguedad());
            usuarioBD.setRoles(rolesAsignados);
            usuarioBD.setIdFun(usuarioAD.getIdFun());
            usuarioBD.setSiglasCargo(usuarioAD.getSiglasCargo());
        }

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
