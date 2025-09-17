package cl.investigaciones.auth.dto;

import lombok.Data;

@Data
public class AuthResponse {
    private String token;     // access token (unchanged for frontend)
    private String refresh;   // refresh token (new)
    private Long exp;         // access token exp (epoch seconds), optional for frontend timers

    public AuthResponse(String token) {
        this.token = token;
    }

    public AuthResponse(String token, String refresh, Long exp) {
        this.token = token;
        this.refresh = refresh;
        this.exp = exp;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getRefresh() { return refresh; }
    public void setRefresh(String refresh) { this.refresh = refresh; }

    public Long getExp() { return exp; }
    public void setExp(Long exp) { this.exp = exp; }
}
