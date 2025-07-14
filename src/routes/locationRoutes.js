import { Router } from "express";
import prisma from "../config/prismaClient.js";

const locationRouter = Router();

// get all locations
locationRouter.get("/", async (req, res) => {
  try {
    const locations = await prisma.location.findMany();
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// create a new location
locationRouter.post("/", async (req, res) => {
  try {
    const { location_name, price } = req.body;
    const location = await prisma.location.create({
      data: {
        location_name,
        price,
      },
    });
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// update a location
locationRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { location_name, price } = req.body;
    const location = await prisma.location.update({
      where: { id: Number(id) },
      data: {
        location_name,
        price,
      },
    });
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// delete a location
locationRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const location = await prisma.location.delete({
      where: { id: Number(id) },
    });
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default locationRouter;
