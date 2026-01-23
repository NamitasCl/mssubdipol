package cl.sge.controller;

import cl.sge.service.ExcelService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ExcelService excelService;

    public ReportController(ExcelService excelService) {
        this.excelService = excelService;
    }

    @GetMapping("/deployments/excel")
    public ResponseEntity<InputStreamResource> downloadReport() throws IOException {
        ByteArrayInputStream in = excelService.generateDeploymentsReport();

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=deployments_report.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.ms-excel"))
                .body(new InputStreamResource(in));
    }
}
