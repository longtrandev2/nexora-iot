package vn.ptit.iot.nexora.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/** users table. `password` is a BCrypt hash and never leaves the service layer. */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 100)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 150)
    private String fullname;

    @Column(nullable = false, length = 100)
    private String email;

    /** http(s) link or an uploaded image as `data:image/...;base64,...` (MEDIUMTEXT). */
    @Column(name = "avatar_url", nullable = false, columnDefinition = "MEDIUMTEXT")
    private String avatarUrl = "";

    @Column(name = "github_url", nullable = false)
    private String githubUrl = "";

    @Column(name = "figma_url", nullable = false)
    private String figmaUrl = "";

    @Column(name = "postman_url", nullable = false)
    private String postmanUrl = "";

    @Column(name = "docs_url", nullable = false)
    private String docsUrl = "";

    @Column(nullable = false, length = 500)
    private String bio = "";

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Integer getId() { return id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFullname() { return fullname; }
    public void setFullname(String fullname) { this.fullname = fullname; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
    public String getFigmaUrl() { return figmaUrl; }
    public void setFigmaUrl(String figmaUrl) { this.figmaUrl = figmaUrl; }
    public String getPostmanUrl() { return postmanUrl; }
    public void setPostmanUrl(String postmanUrl) { this.postmanUrl = postmanUrl; }
    public String getDocsUrl() { return docsUrl; }
    public void setDocsUrl(String docsUrl) { this.docsUrl = docsUrl; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
