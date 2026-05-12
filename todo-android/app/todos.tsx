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

const API = "http://10.71.133.206:8080/api/todos";

export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);

  //Get
  const loadTodos = async () => {
    try {
      setLoading(true);
      const res = await fetch(API);
      const data = await res.json();
      setTodos(data);
    } catch (error) {
      Alert.alert("Error", "Could not load todos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, []);


  //Post
  const addTodo = async () => {
    if (!title) return Alert.alert("Title required");

    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, category, dueDate, completed: false }),
    });

    setTitle("");
    setCategory("");
    setDueDate("");
    loadTodos();
  };

  //Put
  const toggle = async (todo:any) => {
    await fetch(`${API}/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...todo, completed: !todo.completed }),
    });
    loadTodos();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo List</Text>

      <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle}/>
      <TextInput style={styles.input} placeholder="Category" value={category} onChangeText={setCategory}/>
      <TextInput style={styles.input} placeholder="YYYY-MM-DD" value={dueDate} onChangeText={setDueDate}/>

      <Button title="Add Todo" onPress={addTodo} />

      <FlatList
        data={todos}
        keyExtractor={(item:any) => item.id.toString()}
        renderItem={({ item }:any) => (
          <View style={styles.item}>
            <Switch value={item.completed} onValueChange={() => toggle(item)} />
            <Text>{item.title} — {item.category}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,padding:20,paddingTop:40},
  center:{flex:1,justifyContent:"center",alignItems:"center"},
  title:{fontSize:22,fontWeight:"bold",marginBottom:10},
  input:{borderWidth:1,padding:8,marginBottom:8,borderRadius:6},
  item:{flexDirection:"row",alignItems:"center",marginVertical:6,gap:8}
});