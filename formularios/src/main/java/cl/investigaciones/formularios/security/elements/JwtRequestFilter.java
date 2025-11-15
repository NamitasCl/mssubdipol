package cl.investigaciones.formularios.security.elements;


import cl.investigaciones.formularios.dto.JwtUserPrincipal;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Value( "${app.modo-desarrollo.activado:false}")
    private boolean modoDesarrollo;

    @Value("${app.modo-desarrollo.token}")
    private String dev_token;

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String authorizationHeader = request.getHeader("Authorization");
        String username = null;

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authorizationHeader.substring(7);

        if( modoDesarrollo && token.equals(dev_token)) {
            username = "ERAMIREZS"; // El 'sub' que pusimos en el token
            String nombreUsuario = "ENZO ALEJANDRO RAMIREZ SILVA";

            String siglasUnidad = "PMSUBDIPOL";
            List<String> rolesStrings = List.of("ROLE_ADMINISTRADOR", "ROLE_JEFE", "ROLE_FUNCIONARIO");
            int idFuncionario = 12254; // Un ID de funcionario para desarrollo (ej: 1)

            // 1. Crear el Principal
            JwtUserPrincipal principal = new JwtUserPrincipal(username, nombreUsuario, siglasUnidad, rolesStrings, idFuncionario);

            // 2. Crear las Authorities
            List<GrantedAuthority> authorities = rolesStrings.stream()
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());

            // 3. Crear el Token de Autenticación de Spring
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    principal,
                    null, // Las credenciales son nulas porque ya está autenticado
                    authorities
            );

            // 4. Establecer la autenticación en el contexto de seguridad
            SecurityContextHolder.getContext().setAuthentication(authToken);

            filterChain.doFilter(request, response);
            return; // ¡MUY IMPORTANTE! Salir del filtro aquí.
        }

        if (jwtUtils.isTokenExpired(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        if(jwtUtils.isAuthenticated(token)) {
            username = jwtUtils.extractUsername(token);
            String nombreUsuario = jwtUtils.extractClaim(token, claims -> claims.get("nombreUsuario", String.class));
            String siglasUnidad = jwtUtils.extractClaim(token, claims -> claims.get("siglasUnidad", String.class));
            List roles = jwtUtils.extractClaim(token, claims -> claims.get("roles", List.class));
            Integer idFuncionario = jwtUtils.extractClaim(token, claims -> claims.get("idFuncionario", Integer.class));

            if (idFuncionario == null) {
                logger.warn("Token JWT recibido sin idFuncionario, acceso denegado.");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Token inválido: falta idFuncionario");
                return;
            }

            JwtUserPrincipal principal = new JwtUserPrincipal(username, nombreUsuario, siglasUnidad, roles, idFuncionario);

            // Mapear roles a objetos GrantedAuthority
            Object rolesObj = jwtUtils.extractClaim(token, claims -> claims.get("roles"));
            List<GrantedAuthority> authorities = new ArrayList<>();
            if (rolesObj instanceof List<?>) {
                authorities = ((List<?>) rolesObj).stream()
                        .map(role -> new SimpleGrantedAuthority(role.toString()))
                        .collect(Collectors.toList());
            }

            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(principal, null, authorities);

            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        filterChain.doFilter(request, response);

    }

}
