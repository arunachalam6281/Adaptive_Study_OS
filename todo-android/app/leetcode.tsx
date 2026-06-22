import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Switch,
  Pressable,
  Linking,
  ToastAndroid,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { API } from "@/constants/api";
import { LeetCodeActivity } from "@/types";

const STATUS_COLOR: Record<string, string> = {
  accepted: "#22C55E",
  default: "#EF4444",
};

function getStatusColor(status?: string): string {
  if (!status) return "#9CA3AF";
  return status.toLowerCase().includes("accept")
    ? STATUS_COLOR.accepted
    : STATUS_COLOR.default;
}

function formatIST(time: string): string {
  return new Date(time).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function LeetCode() {
  const [items, setItems] = useState<LeetCodeActivity[]>([]);
  const [acceptedOnly, setAcceptedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const res = await fetch(API.LEETCODE);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: LeetCodeActivity[] = await res.json();
      const sorted = data.sort(
        (a, b) => new Date(b.eventTime).getTime() - new Date(a.eventTime).getTime()
      );
      setItems(sorted);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not load activity";
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), 10_000);
    return () => clearInterval(interval);
  }, [load]);

  const copyLink = async (url: string) => {
    await Clipboard.setStringAsync(url);
    if (Platform.OS === "android") {
      ToastAndroid.show("Link copied!", ToastAndroid.SHORT);
    } else {
      Alert.alert("Copied", "Link copied to clipboard");
    }
  };

  const shown = acceptedOnly
    ? items.filter(
        (i) =>
          i.eventType === "SUBMISSION" &&
          i.status?.toLowerCase().includes("accept")
      )
    : items;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#60A5FA" />
      </View>
    );
  }

  if (error && items.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryBtn} onPress={() => load()}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.label}>Accepted only</Text>
        <Switch value={acceptedOnly} onValueChange={setAcceptedOnly} />
      </View>

      <FlatList
        data={shown}
        keyExtractor={(item) => String(item.id)}
        onRefresh={() => load(true)}
        refreshing={refreshing}
        ListEmptyComponent={
          <Text style={styles.empty}>No activity found.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.eventType}>{item.eventType}</Text>
              {item.status ? (
                <Text
                  style={[
                    styles.badge,
                    { backgroundColor: getStatusColor(item.status) },
                  ]}
                >
                  {item.status}
                </Text>
              ) : null}
            </View>

            {item.problemName ? (
              <Text style={styles.problemName}>{item.problemName}</Text>
            ) : null}

            <Text style={styles.time}>{formatIST(item.eventTime)}</Text>

            {item.problemUrl ? (
              <View style={styles.actions}>
                <Pressable onPress={() => Linking.openURL(item.problemUrl!)}>
                  <Text style={styles.link}>Open</Text>
                </Pressable>
                <Pressable onPress={() => copyLink(item.problemUrl!)}>
                  <Text style={styles.link}>Copy</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1220", padding: 16 },
  center: { flex: 1, backgroundColor: "#0B1220", justifyContent: "center", alignItems: "center" },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: { color: "#E5E7EB", fontSize: 14 },
  card: {
    backgroundColor: "#111827",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  eventType: { color: "#93C5FD", fontWeight: "600", fontSize: 13 },
  badge: {
    color: "#0B1220",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: "hidden",
    fontWeight: "800",
    fontSize: 12,
  },
  problemName: { color: "#E5E7EB", fontSize: 15, fontWeight: "600", marginTop: 6 },
  time: { color: "#9CA3AF", fontSize: 12, marginTop: 6 },
  actions: { flexDirection: "row", gap: 16, marginTop: 10 },
  link: { color: "#60A5FA", fontWeight: "700" },
  empty: { color: "#6B7280", textAlign: "center", marginTop: 40 },
  errorText: { color: "#EF4444", marginBottom: 12 },
  retryBtn: { backgroundColor: "#2563EB", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: "#fff", fontWeight: "700" },
});
