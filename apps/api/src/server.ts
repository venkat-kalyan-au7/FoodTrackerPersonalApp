import { app } from "./app.js";
import { config } from "./config/index.js";

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`[API] Server running on port ${PORT} in ${config.nodeEnv} mode`);
  console.log(`[API] AI food matching: ${config.ai.enabled ? `enabled (${config.ai.model})` : "disabled"}`);
});
