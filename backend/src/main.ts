import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { callRpc } from "./rpc";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8888;

app.get("/", (req, res) => {
  const { key } = req.query;

  if (!key) {
    return res.status(400).json({
      error: "Missing Parameters: key",
    });
  }

  callRpc(key as string, (response) => {
    res.status(response.status).json(response);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
