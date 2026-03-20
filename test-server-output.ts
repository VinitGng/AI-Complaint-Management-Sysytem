import { spawn } from "child_process";

const child = spawn("npx", ["tsx", "server.ts"]);

child.stdout.on("data", (data) => {
  console.log("STDOUT:", data.toString());
});

child.stderr.on("data", (data) => {
  console.log("STDERR:", data.toString());
});

setTimeout(() => {
  child.kill();
  process.exit(0);
}, 10000);
