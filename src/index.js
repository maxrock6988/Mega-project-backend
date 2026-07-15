import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./database/index.js";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.log("MONGO DB CONNECTION ERROR", err);
    process.exit(1);
  });




