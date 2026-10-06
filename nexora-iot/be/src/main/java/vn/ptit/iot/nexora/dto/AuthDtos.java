package vn.ptit.iot.nexora.dto;

import vn.ptit.iot.nexora.entity.User;

/**
 * Auth/profile request + response bodies. JSON keys are snake_case via the global naming
 * strategy (userId -> user_id, oldPassword -> old_password), matching `fe/src/types/iot.ts`.
 */
public final class AuthDtos {

    private AuthDtos() {
    }

    /** API-01 body; `username` accepts username OR email. */
    public record LoginRequest(String username, String password) {
    }

    public record LoginResponse(String token, UserDto user) {
    }

    /** FE `User` — whitelist of fields; the password hash is never serialized. */
    public record UserDto(int userId, String username, String email, String fullname, String avatarUrl,
                          String githubUrl, String figmaUrl, String postmanUrl, String docsUrl, String bio) {

        public static UserDto from(User u) {
            return new UserDto(u.getId(), u.getUsername(), u.getEmail(), u.getFullname(), u.getAvatarUrl(),
                    u.getGithubUrl(), u.getFigmaUrl(), u.getPostmanUrl(), u.getDocsUrl(), u.getBio());
        }
    }

    /** E-4 partial update (FE `ProfileUpdate`): null = untouched. */
    public record ProfileUpdateRequest(String fullname, String email, String username, String avatarUrl,
                                       String githubUrl, String figmaUrl, String postmanUrl, String docsUrl,
                                       String bio) {
    }

    /** E-5 body. */
    public record PasswordChangeRequest(String oldPassword, String newPassword) {
    }

    public record MessageResponse(boolean success, String message) {
    }
}
