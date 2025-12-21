import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.route";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

//auth route
app.use("/routes/auth.route", authRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
