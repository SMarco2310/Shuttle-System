import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prismaClient.js";
import sendEmail from "../utils/sendEmail.js";

const authRouter = Router();

// create the auth routes
//
// register

authRouter.post("/register", async (req, res) => {
  const { email, name, password, phone, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        phone,
        role,
      },
    });
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      },
    );
    const html = `
    <body>

       <div class="email-container">
         <h2 class="header">Welcome to ShuttleX!</h2>
         <p>Hi {{name}},</p>

         <p>Thanks for signing up to <strong>ShuttleX</strong> — your trusted shuttle booking platform. We’re thrilled to have you on board!</p>

         <p>With ShuttleX, you can:</p>
         <ul>
           <li>📅 Book shuttles easily from anywhere</li>
           <li>🧾 Receive instant email receipts</li>
           <li>💳 Pay quickly with MoMo</li>
           <li>📊 Access your booking history</li>
         </ul>

         <p style="margin-top: 20px;">
           To get started, click below:
         </p>
         # <p>
         #   <a href="{{dashboard_url}}" class="button">Go to My Dashboard</a>
         # </p>

         <p>If you have any questions, feel free to reply to this email or contact our support team.</p>

         <p>Happy riding!<br>
         — The ShuttleX Team</p>

         <div class="footer">
           &copy; 2025 ShuttleX, All rights reserved.
         </div>
       </div>
     </body>
    `.replace("{{name}}", user.name);
    await sendEmail(email, "Welcome to Shuttle System", html);
    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// login
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      },
    );
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default authRouter;
