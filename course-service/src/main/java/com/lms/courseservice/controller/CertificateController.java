package com.lms.courseservice.controller;

import com.lms.courseservice.entity.Certificate;
import com.lms.courseservice.service.CertificateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/certificates")
public class CertificateController {

    @Autowired
    private CertificateService certificateService;

    @GetMapping("/{studentId}/{courseId}")
    public ResponseEntity<byte[]> getCertificatePdf(
            @PathVariable Long studentId,
            @PathVariable Long courseId) {
        byte[] pdfBytes = certificateService.getCertificatePdf(studentId, courseId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "certificate_" + studentId + "_" + courseId + ".pdf");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return ResponseEntity.ok()
                .headers(headers)
                .contentLength(pdfBytes.length)
                .body(pdfBytes);
    }

    @GetMapping("/student/{id}")
    public ResponseEntity<List<Certificate>> getCertificatesByStudent(@PathVariable Long id) {
        List<Certificate> certificates = certificateService.getCertificatesByStudent(id);
        return ResponseEntity.ok(certificates);
    }
}
