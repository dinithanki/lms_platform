package com.lms.courseservice.controller;

import com.lms.courseservice.entity.Certificate;
import com.lms.courseservice.service.CertificateService;
import com.lms.courseservice.security.LmsPrincipal;
import com.lms.courseservice.security.OwnershipChecks;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;

@RestController
@RequestMapping("/certificates")
public class CertificateController {

    @Autowired
    private CertificateService certificateService;

    @GetMapping("/{studentId}/{courseId}")
    public ResponseEntity<byte[]> getCertificatePdf(
            @PathVariable Long studentId,
            @PathVariable Long courseId,
            @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
            @CookieValue(name = "jwt", required = false) String cookieToken,
            @AuthenticationPrincipal LmsPrincipal principal) {
        OwnershipChecks.requireSelfOrAdmin(principal, studentId);
        if ((authorization == null || authorization.isBlank()) && cookieToken != null) {
            authorization = "Bearer " + cookieToken;
        }
        byte[] pdfBytes = certificateService.getCertificatePdf(studentId, courseId, authorization);

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
    public ResponseEntity<List<Certificate>> getCertificatesByStudent(
            @PathVariable Long id, @AuthenticationPrincipal LmsPrincipal principal) {
        OwnershipChecks.requireSelfOrAdmin(principal, id);
        List<Certificate> certificates = certificateService.getCertificatesByStudent(id);
        return ResponseEntity.ok(certificates);
    }
}
