// Switch BASE_URL to your local machine's LAN IP when running locally,
// or to the Railway URL for production.
//
// Local:      "http://192.168.x.x:8080"  (your machine's LAN IP)
// Production: "https://matrix-production-d793.up.railway.app"

const BASE_URL = "http://10.0.2.2:8080";

export const API = {
  TODOS: `${BASE_URL}/api/todos`,
  LEETCODE: `${BASE_URL}/api/leetcode`,
} as const;
