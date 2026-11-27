package com.lms.authservice.config;

import com.lms.authservice.service.AdminSeedService;
import com.lms.authservice.service.AdminSeedService.SeedResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class AdminSeeder implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final Environment environment;
    private final AdminSeedService adminSeedService;

    public AdminSeeder(Environment environment, AdminSeedService adminSeedService) {
        this.environment = environment;
        this.adminSeedService = adminSeedService;
    }

    @Override
    public void run(ApplicationArguments args) {
        String enabledValue = environment.getProperty("LMS_ADMIN_SEED_ENABLED", "false");
        if (!"true".equalsIgnoreCase(enabledValue) && !"false".equalsIgnoreCase(enabledValue)) {
            throw new IllegalStateException("LMS_ADMIN_SEED_ENABLED must be either true or false");
        }
        if (!Boolean.parseBoolean(enabledValue)) {
            log.info("Admin seeder is disabled.");
            return;
        }

        String email = required("LMS_ADMIN_EMAIL");
        String name = required("LMS_ADMIN_NAME");
        String password = required("LMS_ADMIN_PASSWORD");

        SeedResult result = adminSeedService.createAdminIfMissing(email.trim(), name.trim(), password);
        if (result == SeedResult.CREATED) {
            log.info("Configured admin account and User Service profile created.");
        } else {
            log.info("Configured admin email already exists; no account or profile fields were changed.");
        }
    }

    private String required(String propertyName) {
        String value = environment.getProperty(propertyName);
        if (!StringUtils.hasText(value)) {
            throw new IllegalStateException(propertyName + " is required when LMS_ADMIN_SEED_ENABLED=true");
        }
        return value;
    }
}
