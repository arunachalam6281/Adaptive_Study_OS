import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Switch,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { API } from "@/constants/api";
import { Todo } from "@/types";

export default function Todos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTodos = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const res = await fetch(API.TODOS);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: Todo[] = await res.json();
      setTodos(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not load todos";
      setError(msg);
      Alert.alert("Error", msg, [{ text: "Retry", onPress: () => loadTodos() }]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const addTodo = async () => {
    if (!title.trim()) return Alert.alert("Validation", "Title is required");
    try {
      const res = await fetch(API.TODOS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, dueDate, completed: false }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setTitle("");
      setCategory("");
      setDueDate("");
      loadTodos();
    } catch (e) {
      Alert.alert("Error", "Could not add todo");
    }
  };

  const toggle = async (todo: Todo) => {
    try {
      const res = await fetch(`${API.TODOS}/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...todo, completed: !todo.completed }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      loadTodos();
    } catch (e) {
      Alert.alert("Error", "Could not update todo");
    }
  };

  const deleteTodo = async (id: number) => {
    Alert.alert("Delete", "Remove this todo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await fetch(`${API.TODOS}/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            loadTodos();
          } catch (e) {
            Alert.alert("Error", "Could not delete todo");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error && todos.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => loadTodos()}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Title *"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
      />
      <TextInput
        style={styles.input}
        placeholder="Due date (YYYY-MM-DD)"
        value={dueDate}
        onChangeText={setDueDate}
      />
      <TouchableOpacity style={styles.addBtn} onPress={addTodo}>
        <Text style={styles.addBtnText}>Add Todo</Text>
      </TouchableOpacity>

      <FlatList
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        onRefresh={() => loadTodos(true)}
        refreshing={refreshing}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Switch value={item.completed} onValueChange={() => toggle(item)} />
            <View style={styles.itemText}>
              <Text style={[styles.itemTitle, item.completed && styles.completed]}>
                {item.title}
              </Text>
              {item.category ? (
                <Text style={styles.itemMeta}>{item.category}</Text>
              ) : null}
              {item.dueDate ? (
                <Text style={styles.itemMeta}>Due: {item.dueDate}</Text>
              ) : null}
            </View>
            <TouchableOpacity onPress={() => deleteTodo(item.id)}>
              <Text style={styles.deleteBtn}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 20, backgroundColor: "#F9FAFB" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    padding: 10,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  addBtn: {
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  addBtnText: { color: "#fff", fontWeight: "700" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  itemText: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: "600", color: "#111827" },
  completed: { textDecorationLine: "line-through", color: "#9CA3AF" },
  itemMeta: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  deleteBtn: { color: "#EF4444", fontSize: 18, paddingHorizontal: 4 },
  errorText: { color: "#EF4444", marginBottom: 12, fontSize: 14 },
  retryBtn: { backgroundColor: "#2563EB", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: "#fff", fontWeight: "700" },
});
