import express from "express";
import cors from "cors"
import 'dotenv/config'
import connectToDatabase from "./config/mongodb.js";
import connectToCloudinary from "./config/cloudinary.js";
import adminRouter from "./routes/adminRoute.js";
import instruktorRouter from "./routes/instruktorRoute.js";
import korisnikRouter from "./routes/korisnikRoute.js";

//konfiguracija aplikacije
const app = express();
const port = process.env.PORT || 4000;
connectToDatabase()
connectToCloudinary()

//middlewareovi
app.use("/api/korisnik/stripe-webhook", express.raw({ type: "application/json" }))
app.use(express.json())
app.use(cors())

//api endpointovi
app.use("/api/admin", adminRouter)

app.use("/api/instruktor", instruktorRouter)

app.use("/api/korisnik", korisnikRouter)

app.get("/", (req, res) => {
  res.send("Radi!");
})

app.listen(port, () => console.log("Server running on port ", port));