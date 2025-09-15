package cl.investigaciones.auth.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtil {

    private final String token;
    private final long expiration = 24 * 60 * 60 * 1000;

    public JwtUtil(@Value("${jwt.token}") String token) {
        this.token = token;
    }

    public String generateToken(
            String username,
            List<String> roles,
            String nombreCompletoUsuario,
            String nombreCargo,
            String siglasUnidad,
            int idUnidad,
            boolean isAdmin,
            int idFuncionario,
            List<String> permisos,
            String nombrePerfil
    ) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .setSubject(username)
                .claim("roles", roles)
                .claim("authorities", permisos)
                .claim("isAuthenticated", true)
                .claim("nombreUsuario", nombreCompletoUsuario)
                .claim("nombreCargo", nombreCargo)
                .claim("siglasUnidad", siglasUnidad)
                .claim("idUnidad", idUnidad)
                .claim("isAdmin", isAdmin)
                .claim("idFuncionario", idFuncionario)
                .claim("nombrePerfil", nombrePerfil)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(SignatureAlgorithm.HS512, token.getBytes(StandardCharsets.UTF_8))
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(token)
                .build()
                .parseClaimsJws(token).getBody();
    }

    public String getUsername(String token) {
        Claims claims = parseToken(token);
        return claims.getSubject();
    }

    public boolean validateToken(String token, List<String> roles) {
        Claims claims = parseToken(token);
        Date expirationDate = claims.getExpiration();
        return !expirationDate.before(new Date()) && roles.containsAll(claims.get("roles", List.class));
    }


}
