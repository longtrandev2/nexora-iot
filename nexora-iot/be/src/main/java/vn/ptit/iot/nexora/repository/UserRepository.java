package vn.ptit.iot.nexora.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import vn.ptit.iot.nexora.entity.User;

public interface UserRepository extends JpaRepository<User, Integer> {

    /** Login by username OR email; `login` must already be trimmed + lowercased. */
    @Query("select u from User u where lower(u.username) = :login or lower(u.email) = :login")
    Optional<User> findByLogin(String login);

    boolean existsByUsernameIgnoreCaseAndIdNot(String username, Integer id);
}
