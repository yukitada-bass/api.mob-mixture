import express from "express";
import cors from "cors";
import webhookRouter from "./routes/webhook.js";
import formRouter from "./routes/form.js";

import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use("/webhook", webhookRouter);

app.use(
  cors({
    origin: "https://mob-mixture.com",
    origin: "http://localhost:4321",
    methods: "POST",
    credentials: true,
  })
);

// app.use("/form", formRouter);

const port = 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
