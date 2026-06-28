// UserGroupRepository.java
package com.pngbank.agency.repository;
import com.pngbank.agency.entity.UserGroup;
import org.springframework.data.jpa.repository.JpaRepository;
public interface UserGroupRepository extends JpaRepository<UserGroup, String> {}