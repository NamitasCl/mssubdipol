package cl.investigaciones.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TokenActiveDirectoryResultDTO {
    private int code;
    private boolean success;
    private String description;
    private TokenActiveDirectoryDTO result;

    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TokenActiveDirectoryDTO getResult() {
        return result;
    }

    public void setResult(TokenActiveDirectoryDTO result) {
        this.result = result;
    }
}
