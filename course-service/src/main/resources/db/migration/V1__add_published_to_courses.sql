-- Migration: add published boolean to courses
ALTER TABLE courses ADD COLUMN published BOOLEAN DEFAULT FALSE;
