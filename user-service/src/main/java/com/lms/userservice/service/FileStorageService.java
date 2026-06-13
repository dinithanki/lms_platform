package com.lms.userservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Optional;
import java.util.stream.Stream;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService(@Value("${app.upload.dir:uploads/profile-pictures}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeFile(Long userId, MultipartFile file) {
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        
        String extension = "";
        int i = originalFilename.lastIndexOf('.');
        if (i > 0) {
            extension = originalFilename.substring(i + 1);
        }
        if (extension.isEmpty()) {
            extension = "jpg";
        }

        String targetFileName = "profile-" + userId + "." + extension;

        try {
            if (originalFilename.contains("..")) {
                throw new RuntimeException("Filename contains invalid path sequence " + originalFilename);
            }

            // Delete existing files for this user ID on disk to avoid duplicates
            deleteFile(userId);

            Path targetLocation = this.fileStorageLocation.resolve(targetFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return targetFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + targetFileName + ". Please try again!", ex);
        }
    }

    public Resource loadFileAsResource(Long userId) {
        try {
            Optional<Path> filePathOpt = findFileByUserId(userId);
            if (filePathOpt.isPresent()) {
                Resource resource = new UrlResource(filePathOpt.get().toUri());
                if (resource.exists()) {
                    return resource;
                }
            }
            return null;
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found for user " + userId, ex);
        }
    }

    public void deleteFile(Long userId) {
        try {
            Optional<Path> filePathOpt = findFileByUserId(userId);
            if (filePathOpt.isPresent()) {
                Files.deleteIfExists(filePathOpt.get());
            }
        } catch (IOException ex) {
            throw new RuntimeException("Could not delete file for user " + userId, ex);
        }
    }

    private Optional<Path> findFileByUserId(Long userId) {
        String prefix = "profile-" + userId + ".";
        try (Stream<Path> files = Files.list(this.fileStorageLocation)) {
            // Find any file in the upload directory matching the prefix "profile-{userId}."
            return files
                    .filter(p -> p.getFileName().toString().startsWith(prefix))
                    .findFirst();
        } catch (IOException e) {
            return Optional.empty();
        }
    }
}
