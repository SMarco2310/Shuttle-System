import express from "express";
import dotenv from "dotenv";
import authRouter from "./src/routes/authRoutes.js";
import userRouter from "./src/routes/userRoutes.js";
import locationRouter from "./src/routes/locationRoutes.js";
import bookingRouter from "./src/routes/bookingRoutes.js";
import authenticate from "./src/middleware/authMiddleware.js";
import shuttleRouter from "./src/routes/shuttleRoutes.js";
import "./src/utils/utils.js";
import cors from "cors";
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

// this to allow the parsing of JSON data in the request body

app.get("/", (req, res) => {
  res.send("<h1>Hello World!</h1>");
});

app.use(express.json());
// This make sure that all the enpoint of  authroute is under  auth
app.use("/auth", authRouter);
// this is for the scheduling of the shuttle
// app.use("/schedule", scheduleRouter);
app.use(cors());
// This make sure that all the enpoint of  userroute is under  user
app.use("/user", userRouter);
// This make sure that all the enpoint of  userroute that are only for admin is under  admin
app.use("/admin/users", userRouter);
// This make sure that all the endpoint of bookingroute is under booking
app.use("/booking", authenticate, bookingRouter);
// this make sure that all the enpoint of  location that are only for admin is under  admin
app.use("/admin/locations", locationRouter);
// This make sure that all the enpoint of  shuttleroute is under  shuttle
app.use("/shuttle", shuttleRouter);
// This make sure that all the enpoint of  shuttleroute that are only for admin is under  admin
app.use("/admin/shuttles", shuttleRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
