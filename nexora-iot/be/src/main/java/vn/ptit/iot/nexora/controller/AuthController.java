package vn.ptit.iot.nexora.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.ptit.iot.nexora.dto.AuthDtos.LoginRequest;
import vn.ptit.iot.nexora.dto.AuthDtos.LoginResponse;
import vn.ptit.iot.nexora.dto.AuthDtos.MessageResponse;
import vn.ptit.iot.nexora.dto.AuthDtos.PasswordChangeRequest;
import vn.ptit.iot.nexora.dto.AuthDtos.ProfileUpdateRequest;
import vn.ptit.iot.nexora.dto.AuthDtos.UserDto;
import vn.ptit.iot.nexora.service.AuthService;

/** API-01..03 + E-4 (profile) + E-5 (password). Principal = user id from the JWT. */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody(required = false) LoginRequest request) {
        return authService.login(request);
    }

    /** Stateless JWT: nothing to revoke server-side; the FE drops its token. */
    @PostMapping("/logout")
    public MessageResponse logout() {
        return new MessageResponse(true, "Đăng xuất thành công");
    }

    @GetMapping("/me")
    public UserDto me(@AuthenticationPrincipal Integer userId) {
        return authService.me(userId);
    }

    @PutMapping("/me")
    public UserDto updateProfile(@AuthenticationPrincipal Integer userId,
                                 @RequestBody(required = false) ProfileUpdateRequest patch) {
        return authService.updateProfile(userId, patch);
    }

    @PatchMapping("/password")
    public MessageResponse changePassword(@AuthenticationPrincipal Integer userId,
                                          @RequestBody(required = false) PasswordChangeRequest request) {
        authService.changePassword(userId, request);
        return new MessageResponse(true, "Đổi mật khẩu thành công");
    }
}
