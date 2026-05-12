package backend;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/leetcode")
@CrossOrigin(origins = "*")
public class LeetCodeActivityController {

  private final LeetCodeActivityRepository repo;

  public LeetCodeActivityController(LeetCodeActivityRepository repo) {
    this.repo = repo;
  }

  @GetMapping
  public List<LeetCodeActivity> getAll() {
    return repo.findAll();
  }

  @PostMapping("/event")
  public LeetCodeActivity log(@RequestBody LeetCodeActivity activity) {

    System.out.println("Received event: " + activity.getEventType() + " " + activity.getProblemName());

    if (activity.getEventTime() != null &&
        repo.existsByEventTypeAndProblemNameAndEventTime(
                activity.getEventType(),
                activity.getProblemName(),
                activity.getEventTime())) {

        return activity;
    }
    return repo.save(activity);
  }
}
