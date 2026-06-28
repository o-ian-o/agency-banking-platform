package com.pngbank.agency.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_groups")
public class UserGroup {
    @Id
    @Column(name = "group_id")
    private String groupId;
    
    @Column(name = "group_name")
    private String groupName;
    
    private String description;

    // Getters and Setters
    public String getGroupId() { return groupId; }
    public void setGroupId(String groupId) { this.groupId = groupId; }
    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}