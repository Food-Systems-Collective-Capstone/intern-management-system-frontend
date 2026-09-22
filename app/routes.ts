import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("status", "./routes/status.tsx"),
  route("application", "./routes/applicationForm.tsx"),
  route("mentor/tasks/assign", "./routes/mentor-task-assignment.tsx"),
  route("mentor/review", "./routes/mentor-review-progress.tsx"),
  route("intern/tasks", "./routes/intern-tasks.tsx"),
  route("intern/tasks/:taskId", "./routes/intern-task-detail.tsx"),
] satisfies RouteConfig;