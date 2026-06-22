package com.pngbank.agency.repository;

import com.pngbank.agency.entity.Agent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AgentRepository extends JpaRepository<Agent, UUID> {

    Optional<Agent> findByDeviceFingerprintHash(String hash);

    Optional<Agent> findByAgentCode(String agentCode);
}