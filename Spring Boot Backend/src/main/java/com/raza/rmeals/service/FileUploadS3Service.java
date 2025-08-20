package com.raza.rmeals.service;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

public interface FileUploadS3Service {
    String uploadFile(MultipartFile file);

    boolean deleteFile(String imgUrl);
}
