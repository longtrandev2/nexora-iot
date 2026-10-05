package vn.ptit.iot.nexora.controller;

import static org.hamcrest.Matchers.blankOrNullString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import vn.ptit.iot.nexora.MySqlIntegrationTest;

/** API-01..03, E-4, E-5 + the security chain, against the seeded admin/admin123 user. */
@AutoConfigureMockMvc
class AuthApiTest extends MySqlIntegrationTest {

    private static final String SEED_HASH = "$2a$10$zgu6ktPfmfQS/hiFwAWRWeGQh4gpB0ZfOAmt1wJk5vw9eUJfVObH2";

    @Autowired
    private MockMvc mvc;

    @BeforeEach
    void resetPassword() {
        jdbc.update("UPDATE users SET password = ? WHERE id = 1", SEED_HASH);
    }

    private String login(String username, String password) throws Exception {
        String body = mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"" + username + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(body, "$.token");
    }

    @Test
    void loginByUsernameOrEmailIsTrimmedAndCaseInsensitive() throws Exception {
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"  ADMIN \",\"password\":\"admin123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", not(blankOrNullString())))
                .andExpect(jsonPath("$.user.user_id").value(1))
                .andExpect(jsonPath("$.user.fullname").value("Trần Khắc Long"))
                .andExpect(jsonPath("$.user.password").doesNotExist());
        login("TranKhacLong285@gmail.com", "admin123");
    }

    @Test
    void wrongCredentialsAre401WithMockMessage() throws Exception {
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"admin\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Sai tên đăng nhập hoặc mật khẩu"));
        mvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void protectedEndpointsDistinguishMissingAndInvalidToken() throws Exception {
        mvc.perform(get("/api/v1/sensors"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Chưa đăng nhập"));
        mvc.perform(get("/api/v1/auth/me").header("Authorization", "Bearer bogus"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Phiên đăng nhập đã hết hạn"));
        mvc.perform(get("/api/v1/health")).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("up"));
        mvc.perform(post("/api/v1/auth/logout")).andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void profilePatchIgnoresBlankRequiredFieldsAndTrimsOthers() throws Exception {
        String token = login("admin", "admin123");
        mvc.perform(put("/api/v1/auth/me").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullname\":\"   \",\"bio\":\"  BE test  \",\"username\":\"B21DCCN001\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullname").value("Trần Khắc Long"))
                .andExpect(jsonPath("$.bio").value("BE test"))
                .andExpect(jsonPath("$.username").value("B21DCCN001"));
        // Login compares against the CURRENT username (mock semantics).
        login("b21dccn001", "admin123");
        mvc.perform(get("/api/v1/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(jsonPath("$.bio").value("BE test"));
    }

    @Test
    void profileLinksMustBeHttpButAvatarAcceptsUploadedDataUrl() throws Exception {
        String auth = "Bearer " + login("admin", "admin123");
        mvc.perform(put("/api/v1/auth/me").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"github_url\":\"javascript:alert(1)\"}"))
                .andExpect(status().isBadRequest());
        String avatar = "data:image/png;base64," + "A".repeat(600_000); // ~450KB upload, > VARCHAR(255)
        mvc.perform(put("/api/v1/auth/me").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"avatar_url\":\"" + avatar + "\",\"figma_url\":\"https://figma.com/x\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.figma_url").value("https://figma.com/x"));
        mvc.perform(get("/api/v1/auth/me").header("Authorization", auth))
                .andExpect(jsonPath("$.avatar_url").value(avatar));
        mvc.perform(put("/api/v1/auth/me").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"avatar_url\":\"\",\"figma_url\":\"\"}"))
                .andExpect(status().isOk());
        mvc.perform(post("/api/v1/devices/control").header("Authorization", auth)
                        .contentType(MediaType.TEXT_PLAIN).content("x"))
                .andExpect(status().isUnsupportedMediaType());
    }

    @Test
    void changePasswordRulesAndRoundTrip() throws Exception {
        String token = login("admin", "admin123");
        String auth = "Bearer " + token;
        mvc.perform(patch("/api/v1/auth/password").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"old_password\":\"nope\",\"new_password\":\"abcdef\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Mật khẩu hiện tại không đúng"));
        mvc.perform(patch("/api/v1/auth/password").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"old_password\":\"admin123\",\"new_password\":\"abc\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Mật khẩu mới phải có ít nhất 6 ký tự"));
        mvc.perform(patch("/api/v1/auth/password").header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"old_password\":\"admin123\",\"new_password\":\"newpass1\"}"))
                .andExpect(status().isOk());
        login("admin", "newpass1");
    }
}
