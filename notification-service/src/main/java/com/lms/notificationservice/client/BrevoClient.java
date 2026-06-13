package com.lms.notificationservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.Map;

@FeignClient(name = "brevo-client", url = "${brevo.api-url:https://api.brevo.com/v3}")
public interface BrevoClient {

    @PostMapping(value = "/smtp/email", consumes = "application/json")
    void sendEmail(
            @RequestHeader("api-key") String apiKey,
            @RequestBody Map<String, Object> requestBody
    );
}
