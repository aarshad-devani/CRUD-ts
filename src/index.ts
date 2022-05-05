import express, { json, Response, Request } from "express";
import cors from "cors";
import {config} from "dotenv";




const PORT = process.env.PORT || 8888;

const app = express();

app.use(json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Server Running" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
