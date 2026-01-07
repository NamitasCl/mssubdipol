package cl.investigaciones.turnos.security.elements;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) 
            throws ServletException, IOException {

        String authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authorizationHeader.substring(7);

        try {
            if (jwtUtils.isTokenExpired(token)) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token expirado");
                return;
            }

            if (!jwtUtils.isAuthenticated(token)) {
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token no autenticado");
                return;
            }

            String username = jwtUtils.extractUsername(token);
            List<String> roles = jwtUtils.extractRoles(token);
            Integer idFuncionario = jwtUtils.extractIdFuncionario(token);
            String siglasUnidad = jwtUtils.extractSiglasUnidad(token);
            Integer idUnidad = jwtUtils.extractIdUnidad(token);
            String nombreUsuario = jwtUtils.extractNombreUsuario(token);

            List<SimpleGrantedAuthority> authorities = roles.stream()
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());

            UsernamePasswordAuthenticationToken authenticationToken = 
                new UsernamePasswordAuthenticationToken(username, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(authenticationToken);

            // Inyectar claims en request para que controllers los lean fácilmente
            request.setAttribute("username", username);
            request.setAttribute("idFuncionario", idFuncionario);
            request.setAttribute("siglasUnidad", siglasUnidad);
            request.setAttribute("idUnidad", idUnidad);
            request.setAttribute("nombreUsuario", nombreUsuario);
            request.setAttribute("roles", roles);

        } catch (Exception e) {
            logger.error("Error validando JWT: " + e.getMessage(), e);
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token inválido");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
