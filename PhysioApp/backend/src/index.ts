import "dotenv/config";
import { app } from "./app";

const port = process.env.PORT ? Number(process.env.PORT) : 3333;

app.listen(port, () => {
  console.log(`PhysioApp backend rodando em http://localhost:${port}`);
});
