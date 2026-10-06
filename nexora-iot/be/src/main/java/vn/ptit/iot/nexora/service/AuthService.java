package vn.ptit.iot.nexora.service;

import java.util.function.Consumer;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.ptit.iot.nexora.dto.ApiDto.LoginRequest;
import vn.ptit.iot.nexora.dto.ApiDto.LoginResponse;
import vn.ptit.iot.nexora.dto.ApiDto.PasswordChange;
import vn.ptit.iot.nexora.dto.ApiDto.ProfileUpdate;
import vn.ptit.iot.nexora.dto.ApiDto.UserDto;
import vn.ptit.iot.nexora.entity.User;
import vn.ptit.iot.nexora.repository.UserRepository;
import vn.ptit.iot.nexora.security.JwtService;

/** Login, current user, profile edit and password change. Messages are shown as-is by the FE. */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwt;

    /** Accepts username OR email, ignoring case and surrounding spaces. */
    public LoginResponse login(LoginRequest req) {
        if (req == null || isBlank(req.username()) || isBlank(req.password())) {
            throw ApiException.badRequest("Vui lòng nhập tên đăng nhập và mật khẩu");
        }
        User user = users.findByLogin(req.username().trim().toLowerCase())
                .filter(u -> passwordEncoder.matches(req.password(), u.getPassword()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Sai tên đăng nhập hoặc mật khẩu"));
        return new LoginResponse(jwt.issue(user.getId()), UserDto.from(user));
    }

    public UserDto me(int userId) {
        return UserDto.from(find(userId));
    }

    /** Only the fields sent are changed; blank fullname/email/username are ignored. */
    public UserDto updateProfile(int userId, ProfileUpdate p) {
        User user = find(userId);
        if (!isBlank(p.username())) {
            String username = p.username().trim();
            if (users.existsByUsernameIgnoreCaseAndIdNot(username, userId)) {
                throw new ApiException(HttpStatus.CONFLICT, "Mã sinh viên đã được sử dụng");
            }
            user.setUsername(username);
        }
        if (!isBlank(p.fullname())) user.setFullname(p.fullname().trim());
        if (!isBlank(p.email())) user.setEmail(p.email().trim());
        set(p.avatarUrl(), user::setAvatarUrl);
        set(p.githubUrl(), user::setGithubUrl);
        set(p.figmaUrl(), user::setFigmaUrl);
        set(p.postmanUrl(), user::setPostmanUrl);
        set(p.docsUrl(), user::setDocsUrl);
        set(p.bio(), user::setBio);
        return UserDto.from(users.save(user));
    }

    public void changePassword(int userId, PasswordChange req) {
        User user = find(userId);
        if (req.oldPassword() == null || !passwordEncoder.matches(req.oldPassword(), user.getPassword())) {
            throw ApiException.badRequest("Mật khẩu hiện tại không đúng");
        }
        if (req.newPassword() == null || req.newPassword().length() < 6) {
            throw ApiException.badRequest("Mật khẩu mới phải có ít nhất 6 ký tự");
        }
        user.setPassword(passwordEncoder.encode(req.newPassword()));
        users.save(user);
    }

    public User find(int userId) {
        return users.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập đã hết hạn"));
    }

    private static void set(String value, Consumer<String> setter) {
        if (value != null) setter.accept(value.trim());
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
