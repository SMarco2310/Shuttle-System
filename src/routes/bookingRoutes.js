import { Router } from "express";
import prisma from "../config/prismaClient.js";
import { calculatePrice } from "../utils/utils.js";
import sendEmail from "../utils/sendEmail.js";
import initiatePayment from "../utils/momo/momo.js";
import authenticate from "../middleware/authMiddleware.js";

const bookingRouter = Router();

// get all the bookings
bookingRouter.get("/", async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// get a booking by id
bookingRouter.get("/:id", async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// create a new booking
//
// I think I should add information about the shuttle here too
bookingRouter.post("/", async (req, res) => {
  const { userId, pickupLocation_Id, dropoffLocation_Id, shuttleId } = req.body;

  const price = (
    await calculatePrice(dropoffLocation_Id, pickupLocation_Id)
  ).valueOf();

  try {
    const booking = await prisma.booking.create({
      data: {
        price,
        userId,
        pickupLocation_Id,
        dropoffLocation_Id,
        bookingTime: new Date(),
        shuttleId,
      },
    });

    // Run all the dependent queries in parallel
    const [pickupLocation, dropoffLocation, shuttle, user] = await Promise.all([
      prisma.location.findUnique({ where: { id: pickupLocation_Id } }),
      prisma.location.findUnique({ where: { id: dropoffLocation_Id } }),
      prisma.shuttle.findUnique({ where: { id: shuttleId } }),
      prisma.user.findUnique({ where: { id: booking.userId } }),
    ]);
    //
    // const reference = Math.random().toString(36).substring(2, 15);
    // const payment = await initiatePayment(
    //   user.phone,
    //   price,
    //   reference + booking.id,
    // );
    // if (payment.status === "success") {
    // Build email HTML
    const html = `<div>
      <h2>Booking Confirmation</h2>
      <p>Shuttle ID: ${shuttle?.name || "Unknown"}</p>
      <p>User ID: ${booking.userId}</p>
      <p>Pickup Location: ${pickupLocation?.location_name || "Unknown"}</p>
      <p>Dropoff Location: ${dropoffLocation?.location_name || "Unknown"}</p>
      <p>Booking Time: ${booking?.bookingTime}</p>
      <p>Price: ${price}</p>
    </div>`;
    const currentShuttle = await prisma.shuttle.findUnique({
      where: { id: parseInt(shuttleId) },
    });
    if (currentShuttle.booked_seats == currentShuttle.capacity) {
      await prisma.shuttle.update({
        where: { id: parseInt(shuttleId) },
        data: { status: { set: "FULL" } },
      });
      res.status(400).json({ error: "Shuttle is full" });
      throw new Error("Shuttle is full");
    }
    await prisma.shuttle.update({
      where: { id: parseInt(shuttleId) },
      data: { booked_seats: { increment: 1 } },
    });

    // Respond immediately
    res.json(booking);

    // Send email in background
    if (user?.email) {
      sendEmail(user?.email, "Booking Receipt", html).catch((err) =>
        console.error("Email failed:", err),
      );
    }
    // } else {
    //   // Handle payment failure
    //   console.error("Payment failed:", payment.error);
    //   res.status(400).json({ error: "Payment Failed" });
    // }
  } catch (error) {
    console.error("Booking creation error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// update a booking
bookingRouter.put("/:id", async (req, res) => {
  const { userId, pickupLocation, dropoffLocation } = req.body;
  const price = calculatePrice(dropoffLocation, pickupLocation);
  try {
    const booking = await prisma.booking.update({
      where: { id: parseInt(req.params.id) },
      data: {
        userId,
        pickupLocation,
        dropoffLocation,
        bookingTime: new Date(),
        price,
      },
    });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// delete a booking
bookingRouter.delete("/:id", async (req, res) => {
  try {
    const booking = await prisma.booking.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// get all the booking of one user
bookingRouter.get("/user/:userId", async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: parseInt(req.params.userId) },
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default bookingRouter;
