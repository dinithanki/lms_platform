package com.lms.courseservice.service;

import com.lms.courseservice.entity.Certificate;
import java.util.List;

public interface CertificateService {
    byte[] getCertificatePdf(Long studentId, Long courseId);
    List<Certificate> getCertificatesByStudent(Long studentId);
}
