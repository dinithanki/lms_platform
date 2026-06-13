package com.lms.courseservice.util;

public class ProgressCalculator {

    public static double calculatePercentage(long completed, long total) {
        if (total <= 0) {
            return 0.0;
        }
        double percentage = ((double) completed / total) * 100.0;
        // Round to 2 decimal places
        return Math.round(percentage * 100.0) / 100.0;
    }
}
