import express, { json, Response, Request } from "express";
import cors from "cors";
import { config } from "dotenv";
import { IUser } from "./models";
import { GetCRUDInstance, IEventType } from "./middleware/createCrudoperations";

config();

const PORT = process.env.PORT || 8888;

const app = express();

app.use(json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Server Running" });
});

const onUserTableChanges = (event: IEventType, data: IUser | IUser[]) => {
  console.log(`User Table Event : ${event}\n`, data);
};

app.use(
  "/api/v1/user",
  GetCRUDInstance<IUser>({
    tableName: "Users",
    identifier: "id",
    onEvent: onUserTableChanges,
    addAuditFields: true,
  }).router
);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
