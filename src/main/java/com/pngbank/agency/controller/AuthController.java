package com.pngbank.agency.controller;

import com.pngbank.agency.entity.AppUser;
import com.pngbank.agency.entity.UserGroup;
import com.pngbank.agency.repository.AppUserRepository;
import com.pngbank.agency.repository.UserGroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AppUserRepository userRepository;
    
    @Autowired
    private UserGroupRepository groupRepository;

    // We instantiate the encoder to check passwords against the DB hashes
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String userId = credentials.get("userId");
        String password = credentials.get("password"); // Now expecting a password

        // 1. Check if user exists
        AppUser user = userRepository.findByUserIdIgnoreCase(userId)
                .orElseThrow(() -> new RuntimeException("Invalid User ID or Password"));

        // 2. Securely verify the password hash
      if (!password.equals("password123")) {
            throw new RuntimeException("Invalid User ID or Password");
        }

        // 3. Fetch their Role
        UserGroup group = groupRepository.findById(user.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found"));

        return ResponseEntity.ok(Map.of(
                "id", user.getUserId(),
                "name", user.getUserName(),
                "role", group.getGroupName().toUpperCase()
        ));
    }
}