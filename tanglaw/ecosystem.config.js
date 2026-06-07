module.exports = {
  apps: [
    {
      name: "tanglaw-backend",
      cwd: "./backend",
      script: "bash",
      args: ["-c", "npm run dev"],
      exec_interpreter: "none",
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      env: {
        NODE_ENV: "development",
      },
    },
    {
      name: "tanglaw-frontend",
      cwd: "./frontend",
      script: "bash",
      args: ["-c", "npm run dev"],
      exec_interpreter: "none",
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
