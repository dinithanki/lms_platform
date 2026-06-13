package com.lms.apigateway.exception;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lms.apigateway.model.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.reactive.error.ErrorWebExceptionHandler;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Slf4j
@Component
@Order(-1) // Registers with high precedence to intercept errors before default spring handlers
@RequiredArgsConstructor
public class GatewayExceptionHandler implements ErrorWebExceptionHandler {

    private final ObjectMapper objectMapper;

    @Override
    public Mono<Void> handle(ServerWebExchange exchange, Throwable ex) {
        ServerHttpResponse response = exchange.getResponse();

        if (response.isCommitted()) {
            return Mono.error(ex);
        }

        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        String message = "Internal Gateway Error";

        if (ex instanceof ResponseStatusException) {
            HttpStatus resolved = HttpStatus.resolve(((ResponseStatusException) ex).getStatusCode().value());
            if (resolved != null) {
                status = resolved;
            }
            message = ((ResponseStatusException) ex).getReason();
            if (message == null) {
                message = ex.getMessage();
            }
        } else {
            message = ex.getMessage();
        }

        response.setStatusCode(status);
        log.error("Gateway Exception Caught: {} | Status Code: {}", message, status, ex);

        ApiResponse<Object> apiResponse = ApiResponse.error(message);

        try {
            byte[] bytes = objectMapper.writeValueAsBytes(apiResponse);
            DataBuffer buffer = response.bufferFactory().wrap(bytes);
            return response.writeWith(Mono.just(buffer));
        } catch (JsonProcessingException e) {
            log.error("Failed to write exception response JSON", e);
            return response.setComplete();
        }
    }
}
