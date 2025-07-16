package cl.investigaciones.nodos.config.elements;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        String authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authorizationHeader.substring(7);

        if (jwtUtils.isTokenExpired(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        if(jwtUtils.isAuthenticated(token)) {
            String username = jwtUtils.extractUsername(token);
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
