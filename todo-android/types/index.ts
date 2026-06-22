export interface Todo {
  id: number;
  title: string;
  category?: string;
  dueDate?: string;
  completed: boolean;
}

export interface LeetCodeActivity {
  id: number;
  eventType: "LOGIN" | "SUBMISSION";
  problemName?: string;
  status?: string;
  problemUrl?: string;
  eventTime: string;
}
