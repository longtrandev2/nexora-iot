package vn.ptit.iot.nexora.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/** Table `users`: login account + profile. `password` is a BCrypt hash. */
@Entity
@Table(name = "users")
@Getter
@Setter
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

    /** The FE uploads the avatar as a data: URL (image up to 2MB), hence MEDIUMTEXT. */
    @Column(nullable = false, columnDefinition = "MEDIUMTEXT")
    private String avatarUrl = "";

    @Column(nullable = false)
    private String githubUrl = "";

    @Column(nullable = false)
    private String figmaUrl = "";

    @Column(nullable = false)
    private String postmanUrl = "";

    @Column(nullable = false)
    private String docsUrl = "";

    @Column(nullable = false, length = 500)
    private String bio = "";
}
