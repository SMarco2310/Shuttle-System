import { Router } from "express";
import prisma from "../config/prismaClient.js";
import { nextFriday, updateShuttleAvailability } from "../utils/utils.js";

import authenticate from "../middleware/authMiddleware.js";

const shuttleRouter = Router();

// Create a new shuttle
//
// (create a util and another function to create the shuttles at the backend so that
// we can use it in the frontend so it should only limmite it to only two Shuttles per week)
// bound it by week so that the shuttle of another week will be used twice

// this is not needed anymore
shuttleRouter.post("/", async (req, res) => {
  const { name, capacity, booked_seats, status } = req.body;
  const departureTime = nextFriday();
  const data = {
    name,
    capacity,
    booked_seats,
    departureTime,
    status,
  };

  try {
    const newShuttle = await prisma.shuttle.create({
      data: data,
    });
    res.status(201).json(newShuttle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all the shuttle
shuttleRouter.get("/", async (req, res) => {
  await updateShuttleAvailability();
  try {
    const shuttles = await prisma.shuttle.findMany({
      where: {
        is_available: true,
      },
    });
    res.json(shuttles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get a specific shuttle by ID
shuttleRouter.get("/:id", authenticate, async (req, res) => {
  try {
    const shuttle = await prisma.shuttle.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!shuttle) {
      return res.status(404).json({ error: "Shuttle not found" });
    }
    res.json(shuttle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete a specific shuttle by ID
shuttleRouter.delete("/:id", async (req, res) => {
  try {
    const deletedShuttle = await prisma.shuttle.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json(deletedShuttle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default shuttleRouter;
