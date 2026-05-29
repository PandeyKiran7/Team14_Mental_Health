import express from 'express';
import cors from 'cors';

const  app = express();
const PORT = 4000;

app.use(cors({origin:'http://localhost:3000'}));
app.use(express.json());


app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "Team14 MindWell API" });
});

app.post("/api/auth/login", (request, response) => {
  const { email, password } = request.body ?? {};
  if (!email || !password) {
    return response.status(400).json({ message: "Email and password required" });
  }
  return response.json({
    success: true,
    message: "Login stub — database coming next",
    user: { email, role: "PATIENT" },
  });
});

app.post("/api/auth/register", (request, response) => {
  const { email, fullName, role } = request.body ?? {};
  if (!email || !fullName) {
    return response.status(400).json({ message: "Missing fields" });
  }
  return response.json({
    success: true,
    message: "Register stub",
    user: { email, fullName, role: role ?? "PATIENT" },
  });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});