package com.lms.apigateway.filters;

import com.lms.apigateway.util.RequestLogger;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Slf4j
@Component
@RequiredArgsConstructor
public class LoggingFilter implements GlobalFilter, Ordered {

    private final RequestLogger requestLogger;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        long startTime = System.currentTimeMillis();
        
        // Log incoming request details using RequestLogger helper
        requestLogger.logRequest(exchange.getRequest());
        
        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            long duration = System.currentTimeMillis() - startTime;
            log.info("Response Sent | Path: {} | Status: {} | Time Elapsed: {} ms", 
                     exchange.getRequest().getPath().value(),
                     exchange.getResponse().getStatusCode(), 
                     duration);
        }));
    }

    @Override
    public int getOrder() {
        // Run as the absolute earliest filter in the chain
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
