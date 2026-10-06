package vn.ptit.iot.nexora.service;

import java.util.Locale;
import java.util.function.Consumer;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.ptit.iot.nexora.dto.AuthDtos.LoginRequest;
import vn.ptit.iot.nexora.dto.AuthDtos.LoginResponse;
import vn.ptit.iot.nexora.dto.AuthDtos.PasswordChangeRequest;
import vn.ptit.iot.nexora.dto.AuthDtos.ProfileUpdateRequest;
import vn.ptit.iot.nexora.dto.AuthDtos.UserDto;
import vn.ptit.iot.nexora.entity.User;
import vn.ptit.iot.nexora.repository.UserRepository;
import vn.ptit.iot.nexora.security.JwtService;

/**
 * Login / me / profile / password. The Vietnamese messages are shown verbatim by the FE
 * (login page, profile modals), so keep them user-facing.
 */
@Service
public class AuthService {

    static final int MIN_PASSWORD_LENGTH = 6;
    private static final String BAD_CREDENTIALS = "Sai tên đăng nhập hoặc mật khẩu";
    private static final String SESSION_EXPIRED = "Phiên đăng nhập đã hết hạn";
    private static final Pattern HTTP_URL = Pattern.compile("(?i)^https?://\\S+$");
    private static final Pattern DATA_IMAGE = Pattern.compile("^data:image/[a-z0-9.+-]+;base64,");
    private static final int MAX_AVATAR_CHARS = 3_000_000;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    /** API-01: username OR email, trimmed + case-insensitive; compared to CURRENT stored values. */
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        if (request == null || isBlank(request.username()) || request.password() == null
                || request.password().isEmpty()) {
            throw ApiException.badRequest("Vui lòng nhập tên đăng nhập và mật khẩu");
        }
        String login = request.username().trim().toLowerCase(Locale.ROOT);
        User user = userRepository.findByLogin(login).stream()
                .filter(u -> passwordEncoder.matches(request.password(), u.getPassword()))
                .findFirst()
                .orElseThrow(() -> ApiException.unauthorized(BAD_CREDENTIALS));
        return new LoginResponse(jwtService.issue(user.getId()), UserDto.from(user));
    }

    /** API-02. */
    @Transactional(readOnly = true)
    public UserDto me(int userId) {
        return UserDto.from(requireUser(userId));
    }

    /** E-4: partial patch; blank fullname/email/username are ignored, other fields trimmed. */
    @Transactional
    public UserDto updateProfile(int userId, ProfileUpdateRequest patch) {
        if (patch == null) throw ApiException.badRequest("Dữ liệu gửi lên không hợp lệ");
        User user = requireUser(userId);
        applyRequired(patch.fullname(), 150, "Họ tên", user::setFullname);
        applyRequired(patch.email(), 100, "Email", user::setEmail);
        if (!isBlank(patch.username())) {
            String username = checkLength(patch.username().trim(), 100, "Mã sinh viên");
            if (userRepository.existsByUsernameIgnoreCaseAndIdNot(username, user.getId())) {
                throw new ApiException(HttpStatus.CONFLICT, "Mã sinh viên đã được sử dụng");
            }
            user.setUsername(username);
        }
        applyAvatar(patch.avatarUrl(), user::setAvatarUrl);
        applyUrl(patch.githubUrl(), "Link GitHub", user::setGithubUrl);
        applyUrl(patch.figmaUrl(), "Link Figma", user::setFigmaUrl);
        applyUrl(patch.postmanUrl(), "Link Postman", user::setPostmanUrl);
        applyUrl(patch.docsUrl(), "Link tài liệu", user::setDocsUrl);
        applyOptional(patch.bio(), 500, "Giới thiệu", user::setBio);
        return UserDto.from(userRepository.save(user));
    }

    /** E-5: old password must match; new one >= 6 chars. */
    @Transactional
    public void changePassword(int userId, PasswordChangeRequest request) {
        if (request == null || request.oldPassword() == null || request.newPassword() == null) {
            throw ApiException.badRequest("Vui lòng nhập đủ mật khẩu hiện tại và mật khẩu mới");
        }
        User user = requireUser(userId);
        if (!passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
            throw ApiException.badRequest("Mật khẩu hiện tại không đúng");
        }
        if (request.newPassword().length() < MIN_PASSWORD_LENGTH) {
            throw ApiException.badRequest("Mật khẩu mới phải có ít nhất " + MIN_PASSWORD_LENGTH + " ký tự");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    /** Token user must still exist (single user, but keep the check honest). */
    public User requireUser(int userId) {
        return userRepository.findById(userId).orElseThrow(() -> ApiException.unauthorized(SESSION_EXPIRED));
    }

    private static void applyRequired(String value, int max, String label, Consumer<String> setter) {
        if (!isBlank(value)) setter.accept(checkLength(value.trim(), max, label));
    }

    private static void applyOptional(String value, int max, String label, Consumer<String> setter) {
        if (value != null) setter.accept(checkLength(value.trim(), max, label));
    }

    /** FE uploads the avatar as a data: URL (file <= 2MB -> ~2.8M base64 chars); links also allowed. */
    private static void applyAvatar(String value, Consumer<String> setter) {
        if (value == null) return;
        String avatar = checkLength(value.trim(), MAX_AVATAR_CHARS, "Ảnh đại diện");
        if (!avatar.isEmpty() && !DATA_IMAGE.matcher(avatar).lookingAt() && !HTTP_URL.matcher(avatar).matches()) {
            throw ApiException.badRequest("Ảnh đại diện phải là ảnh tải lên hoặc link http(s)");
        }
        setter.accept(avatar);
    }

    /** Links are rendered as href by the FE: empty or http(s) only (blocks javascript: URLs). */
    private static void applyUrl(String value, String label, Consumer<String> setter) {
        if (value == null) return;
        String url = checkLength(value.trim(), 255, label);
        if (!url.isEmpty() && !HTTP_URL.matcher(url).matches()) {
            throw ApiException.badRequest(label + " phải bắt đầu bằng http:// hoặc https://");
        }
        setter.accept(url);
    }

    private static String checkLength(String value, int max, String label) {
        if (value.length() > max) throw ApiException.badRequest(label + " tối đa " + max + " ký tự");
        return value;
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
