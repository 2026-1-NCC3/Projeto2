package com.beholders.projeto_maya_rpg.repository;

import com.beholders.projeto_maya_rpg.model.Token;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TokenRepository extends JpaRepository<Token, Long> {
    Optional<Token> findByEmail(String email);
}
