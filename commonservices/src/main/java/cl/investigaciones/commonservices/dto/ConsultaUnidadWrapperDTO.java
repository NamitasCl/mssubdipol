package cl.investigaciones.commonservices.dto;

import java.util.List;

public class ConsultaUnidadWrapperDTO {
    private int code;
    private boolean success;
    private String description;
    private List<ConsultaUnidadDto> result;

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

    public List<ConsultaUnidadDto> getResult() {
        return result;
    }

    public void setResult(List<ConsultaUnidadDto> result) {
        this.result = result;
    }
}
