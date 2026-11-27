package com.lms.authservice;

import com.lms.authservice.config.AdminSeeder;
import com.lms.authservice.service.AdminSeedService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.mock.env.MockEnvironment;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

class AdminSeederTests {

    @Test
    void disabledSeederDoesNotCallSeedService() {
        MockEnvironment environment = new MockEnvironment()
                .withProperty("LMS_ADMIN_SEED_ENABLED", "false");
        AdminSeedService seedService = mock(AdminSeedService.class);

        new AdminSeeder(environment, seedService).run(new DefaultApplicationArguments(new String[0]));

        verifyNoInteractions(seedService);
    }

    @Test
    void enabledSeederRequiresAllConfiguration() {
        MockEnvironment environment = new MockEnvironment()
                .withProperty("LMS_ADMIN_SEED_ENABLED", "true")
                .withProperty("LMS_ADMIN_EMAIL", "admin@example.test")
                .withProperty("LMS_ADMIN_PASSWORD", "test-password");
        AdminSeedService seedService = mock(AdminSeedService.class);

        assertThrows(IllegalStateException.class,
                () -> new AdminSeeder(environment, seedService).run(new DefaultApplicationArguments(new String[0])));

        verifyNoInteractions(seedService);
    }
}
