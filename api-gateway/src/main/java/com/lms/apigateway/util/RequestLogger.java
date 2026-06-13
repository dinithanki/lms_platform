package com.lms.apigateway.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
public class RequestLogger {

    public void logRequest(ServerHttpRequest request) {
        String path = request.getPath().value();
        String method = request.getMethod().name();
        String remoteAddress = request.getRemoteAddress() != null 
                ? request.getRemoteAddress().toString() 
                : "unknown";
        
        log.info("[{}] Request: {} {} from IP: {}", 
                LocalDateTime.now(), 
                method, 
                path, 
                remoteAddress);
    }
}
