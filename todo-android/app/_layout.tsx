import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function RootLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen
        name="todos"
        options={{
          title: "Todos",
          tabBarIcon: ({ color }) => (
            <Ionicons name="checkbox-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leetcode"
        options={{
          title: "LeetCode",
          tabBarIcon: ({ color }) => (
            <Ionicons name="code-slash-outline" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
