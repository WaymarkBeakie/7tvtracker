const isWindows = process.platform === "win32";

function makeApp(name, cwd) {
  if (isWindows) {
    return {
      name,
      cwd,
      script: "cmd.exe",
      args: "/c pnpm start",
      interpreter: "none",
      watch: false,
      autorestart: true,
      max_restarts: 10,
      min_uptime: "30s",
      restart_delay: 5000,
      env: { NODE_ENV: "production" },
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      time: true,
    };
  }

  return {
    name,
    cwd,
    script: "pnpm",
    args: "start",
    interpreter: "none",
    watch: false,
    autorestart: true,
    max_restarts: 10,
    min_uptime: "30s",
    restart_delay: 5000,
    env: { NODE_ENV: "production" },
    out_file: "./logs/out.log",
    error_file: "./logs/error.log",
    time: true,
  };
}

function makeCronApp(name, cwd, args, cronExpr) {
  if (isWindows) {
    return {
      name,
      cwd,
      script: "cmd.exe",
      args: `/c pnpm ${args}`,
      interpreter: "none",
      autorestart: false,
      cron_restart: cronExpr,
      env: { NODE_ENV: "production" },
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      time: true,
    };
  }
  return {
    name,
    cwd,
    script: "pnpm",
    args,
    interpreter: "none",
    autorestart: false,
    cron_restart: cronExpr,
    env: { NODE_ENV: "production" },
    out_file: "./logs/out.log",
    error_file: "./logs/error.log",
    time: true,
  };
}

module.exports = {
  apps: [
    makeApp("emote-bot", "./packages/bot"),   // your existing bot/web makeApp() calls stay as-is
    makeApp("emote-web", "./packages/web"),
    makeCronApp("emote-rollup", "./packages/bot", "run rollup", "0 3 * * *"), // daily at 3am
  ],
};