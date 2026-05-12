import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Linking, Switch, Pressable, ToastAndroid } from "react-native";
import * as Clipboard from "expo-clipboard";

const LEETCODE_API = "http://10.71.133.206:8080/api/leetcode";

type Activity = {
  id: number;
  eventType: string;
  problemName?: string;
  status?: string;
  problemUrl?: string;
  eventTime: string;
};

export default function HomeScreen() {
  const [items, setItems] = useState<Activity[]>([]);
  const [acceptedOnly, setAcceptedOnly] = useState(false);

  const load = async () => {
    const res = await fetch(LEETCODE_API);
    const data = await res.json();
    const sorted = data.sort((a: Activity, b: Activity) => +new Date(b.eventTime) - +new Date(a.eventTime));
    setItems(sorted);
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 10000); // auto refresh
    return () => clearInterval(t);
  }, []);

  const colorForStatus = (status?: string) => {
    if (!status) return "#9CA3AF";
    if (status.toLowerCase().includes("accept")) return "#22C55E";
    return "#EF4444";
  };

  const shown = acceptedOnly
    ? items.filter(i => i.eventType === "SUBMISSION" && i.status?.toLowerCase().includes("accept"))
    : items;

    const formatIST = (time: string) =>
    new Date(time + "Z").toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  
  const copyLink = async (url?: string) => {
    if (!url) return;
    await Clipboard.setStringAsync(url);
    ToastAndroid.show("Link copied!", ToastAndroid.SHORT);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>LeetCode Activity</Text>

      <View style={styles.toolbar}>
        <Text style={{ color: "#E5E7EB" }}>Accepted only</Text>
        <Switch value={acceptedOnly} onValueChange={setAcceptedOnly} />
      </View>

      <FlatList
        data={shown}
        keyExtractor={(i) => String(i.id)}
        onRefresh={load}
        refreshing={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.type}>{item.eventType}</Text>
              {item.status && (
                <Text style={[styles.statusBadge, { backgroundColor: colorForStatus(item.status) }]}>
                  {item.status}
                </Text>
              )}
            </View>

            {item.problemName && <Text style={styles.title}>{item.problemName}</Text>}

            <Text style={styles.time}>{formatIST(item.eventTime)}</Text>

            {!!item.problemUrl && (
              <View style={styles.actions}>
                <Pressable onPress={() => Linking.openURL(item.problemUrl!)}>
                  <Text style={styles.link}>Open</Text>
                </Pressable>
                <Pressable onPress={() => copyLink(item.problemUrl!)}>
                  <Text style={styles.link}>Copy</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1220", padding: 16, paddingTop: 40 },
  header: { color: "#E5E7EB", fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  toolbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },

  card: { backgroundColor: "#111827", padding: 12, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: "#1F2937" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  type: { color: "#93C5FD", fontWeight: "600" },

  statusBadge: {
    color: "#0B1220",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
    fontWeight: "800",
  },

  title: { color: "#E5E7EB", fontSize: 16, fontWeight: "600", marginTop: 6 },
  time: { color: "#9CA3AF", fontSize: 12, marginTop: 6 },

  actions: { flexDirection: "row", gap: 16, marginTop: 10 },
  link: { color: "#60A5FA", fontWeight: "700" },
});