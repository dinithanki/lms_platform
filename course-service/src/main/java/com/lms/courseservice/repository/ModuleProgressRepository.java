package com.lms.courseservice.repository;

import com.lms.courseservice.entity.ModuleProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ModuleProgressRepository extends JpaRepository<ModuleProgress, Long> {
    Optional<ModuleProgress> findByStudentIdAndModuleId(Long studentId, Long moduleId);
    List<ModuleProgress> findByStudentIdAndModuleIdIn(Long studentId, List<Long> moduleIds);
    long countByStudentIdAndModuleIdInAndCompletedTrue(Long studentId, List<Long> moduleIds);
    void deleteByModuleIdIn(List<Long> moduleIds);
}
