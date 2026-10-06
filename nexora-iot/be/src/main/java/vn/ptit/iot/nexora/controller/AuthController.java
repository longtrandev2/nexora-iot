package vn.ptit.iot.nexora.controller;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.ptit.iot.nexora.dto.ApiDto.LoginRequest;
import vn.ptit.iot.nexora.dto.ApiDto.LoginResponse;
import vn.ptit.iot.nexora.dto.ApiDto.Message;
import vn.ptit.iot.nexora.dto.ApiDto.PasswordChange;
import vn.ptit.iot.nexora.dto.ApiDto.ProfileUpdate;
import vn.ptit.iot.nexora.dto.ApiDto.UserDto;
import vn.ptit.iot.nexora.service.AuthService;

/** Health check + login/logout + profile. `userId` comes from the JWT. */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService auth;

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "up");
    }

    @PostMapping("/auth/login")
    public LoginResponse login(@RequestBody LoginRequest req) {
        return auth.login(req);
    }

    /** JWT is stateless: nothing to revoke, the FE just drops its token. */
    @PostMapping("/auth/logout")
    public Message logout() {
        return new Message(true, "Đăng xuất thành công");
    }

    @GetMapping("/auth/me")
    public UserDto me(@AuthenticationPrincipal Integer userId) {
        return auth.me(userId);
    }

    @PutMapping("/auth/me")
    public UserDto updateProfile(@AuthenticationPrincipal Integer userId, @RequestBody ProfileUpdate patch) {
        return auth.updateProfile(userId, patch);
    }

    @PatchMapping("/auth/password")
    public Message changePassword(@AuthenticationPrincipal Integer userId, @RequestBody PasswordChange req) {
        auth.changePassword(userId, req);
        return new Message(true, "Đổi mật khẩu thành công");
    }
}
