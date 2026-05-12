import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Switch
} from "react-native";

const LEETCODE_API =
  "http://10.71.133.206:8080/api/leetcode";

export default function Leetcode() {
  const [items, setItems] = useState([]);
  const [acceptedOnly, setAcceptedOnly] = useState(false);

  const load = async () => {
    const res = await fetch(LEETCODE_API);
    const data = await res.json();
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>LeetCode Activity</Text>

      <Switch
        value={acceptedOnly}
        onValueChange={setAcceptedOnly}
      />

      <FlatList
        data={items}
        keyExtractor={(i:any) => String(i.id)}
        renderItem={({ item }:any) => (
          <View style={styles.card}>
            <Text>{item.problemName}</Text>
            <Text>{item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  header: {
    fontSize: 22,
    fontWeight: "bold"
  },
  card: {
    padding: 10,
    marginVertical: 5,
    borderWidth: 1
  }
}); //abc