import express from 'express';
import 'dotenv/config';
import fs from 'fs';
import cors from "cors";
import uploadRoutes from "./src/routes/upload-routes.js"
import apiRoutes from "./src/routes/Github-repo_api.js";

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}

const app = express();


app.use(cors());
app.use(express.json());

app.use('/uploads', express.static("uploads"));

//Routes 
app.use('/api/v1', uploadRoutes);
app.use('/api/v1',apiRoutes);

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  const status = err.status || 400;
  res.status(status).json({ message: err.message || 'Something went wrong' });
});
//ai
// Catches promises that were rejected but not handled with .catch()
// e.g., a failed DB query without error handling — logs it instead of silently failing
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
//ai
// Catches synchronous errors that weren't caught by try/catch anywhere
// This is the last line of defense — without it, the process crashes with no useful log
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Connect to MongoDB, then start Express server
app.listen(process.env.PORT, () => {
  console.log(` 🚀 Server running on port ${process.env.PORT}`);
});

export default app;
