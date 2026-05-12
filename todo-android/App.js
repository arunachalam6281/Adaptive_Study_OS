import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  Switch,
  StyleSheet,
  Alert,
  ActivityIndicator
} from "react-native";

const API = "https://matrix-production-d793.up.railway.app/api/todos";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);

  // Load todos from backend
  const loadTodos = async () => {
    try {
      setLoading(true);

      const res = await fetch(API);
      const data = await res.json();

      setTodos(data);
    } catch (error) {
      console.log("Fetch error:", error);
      Alert.alert("Error", "Could not load todos from server");
    } finally {
      setLoading(false);
    }
  };

  // Run once when app loads
  useEffect(() => {
    loadTodos();
  }, []);

  // Add todo
  const addTodo = async () => {
    if (!title) {
      Alert.alert("Validation", "Title is required");
      return;
    }

    try {
      await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          category,
          dueDate,
          completed: false
        })
      });

      setTitle("");
      setCategory("");
      setDueDate("");

      loadTodos();
    } catch (error) {
      console.log("Add error:", error);
      Alert.alert("Error", "Failed to add todo");
    }
  };

  // Toggle completion
  const toggleTodo = async (todo) => {
    try {
      await fetch(`${API}/${todo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...todo,
          completed: !todo.completed
        })
      });

      loadTodos();
    } catch (error) {
      console.log("Toggle error:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading todos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mini Notion – To-Do (Android)</Text>

      <TextInput
        style={styles.input}
        placeholder="Title"
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
        placeholder="YYYY-MM-DD"
        value={dueDate}
        onChangeText={setDueDate}
      />

      <Button title="Add To-Do" onPress={addTodo} />

      <FlatList
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        refreshing={loading}
        onRefresh={loadTodos}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Switch
              value={item.completed}
              onValueChange={() => toggleTodo(item)}
            />

            <Text style={item.completed ? styles.done : styles.text}>
              {item.title} — {item.category} — {item.dueDate}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15
  },

  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 8
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    gap: 10
  },

  text: {
    fontSize: 16
  },

  done: {
    fontSize: 16,
    textDecorationLine: "line-through",
    color: "gray"
  }
});