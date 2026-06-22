import { useEffect, useState } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────
// Change BASE_URL to your Railway URL for production.
const BASE_URL = "http://localhost:8080";
const TODOS_API = `${BASE_URL}/api/todos`;

// ─── Types ────────────────────────────────────────────────────────────────────
/** @typedef {{ id: number, title: string, category?: string, dueDate?: string, completed: boolean }} Todo */

export default function App() {
  /** @type {[Todo[], Function]} */
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTodos = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(TODOS_API);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setTodos(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTodos(); }, []);

  const addTodo = async () => {
    if (!title.trim()) return alert("Title is required");
    try {
      const res = await fetch(TODOS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, dueDate, completed: false }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setTitle(""); setCategory(""); setDueDate("");
      loadTodos();
    } catch (e) {
      alert("Could not add todo: " + e.message);
    }
  };

  const toggle = async (todo) => {
    try {
      const res = await fetch(`${TODOS_API}/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...todo, completed: !todo.completed }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      loadTodos();
    } catch (e) {
      alert("Could not update todo: " + e.message);
    }
  };

  const deleteTodo = async (id) => {
    if (!window.confirm("Delete this todo?")) return;
    try {
      const res = await fetch(`${TODOS_API}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      loadTodos();
    } catch (e) {
      alert("Could not delete todo: " + e.message);
    }
  };

  return (
    <div style={s.page}>
      <h2 style={s.heading}>Matrix — Todos</h2>

      <div style={s.form}>
        <input style={s.input} placeholder="Title *" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input style={s.input} placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <input style={s.input} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <button style={s.btn} onClick={addTodo}>Add</button>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "red" }}>{error} — <button onClick={loadTodos}>Retry</button></p>}

      <ul style={s.list}>
        {todos.map((t) => (
          <li key={t.id} style={s.item}>
            <input type="checkbox" checked={t.completed} onChange={() => toggle(t)} />
            <span style={t.completed ? s.done : undefined}>
              {t.title}
              {t.category ? ` — ${t.category}` : ""}
              {t.dueDate ? ` (${t.dueDate})` : ""}
            </span>
            <button style={s.del} onClick={() => deleteTodo(t.id)}>✕</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

const s = {
  page: { padding: 24, maxWidth: 600, margin: "auto", fontFamily: "sans-serif" },
  heading: { marginBottom: 16 },
  form: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 },
  input: { padding: "8px 10px", borderRadius: 6, border: "1px solid #D1D5DB", fontSize: 14 },
  btn: { padding: "9px 16px", background: "#2563EB", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700 },
  list: { listStyle: "none", padding: 0 },
  item: { display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #F3F4F6" },
  done: { textDecoration: "line-through", color: "#9CA3AF" },
  del: { marginLeft: "auto", background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 16 },
};
