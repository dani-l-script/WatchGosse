import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  return defineConfig({
    server: {
      port: parseInt("5173"),
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@reduxjs/toolkit": path.resolve(
          __dirname,
          "node_modules/@reduxjs/toolkit"
        ),
      },
    },
  });
};
