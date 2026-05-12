package backend;

import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;


@Entity
@Table(name = "leetcode_activity")
@Data
public class LeetCodeActivity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String eventType;   // LOGIN / SUBMISSION

  private String problemName;

  private String status;      // Accepted / Wrong Answer / TLE

  @Column(columnDefinition = "TEXT")
  private String problemUrl;

  private Instant eventTime;
}