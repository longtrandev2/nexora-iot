package vn.ptit.iot.nexora.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.ptit.iot.nexora.entity.User;

public interface UserRepository extends JpaRepository<User, Integer> {

    /** Login lookup: `login` must already be trimmed + lowercased (username OR email). */
    @Query("select u from User u where lower(u.username) = :login or lower(u.email) = :login order by u.id")
    List<User> findByLogin(@Param("login") String login);

    boolean existsByUsernameIgnoreCaseAndIdNot(String username, Integer id);
}
