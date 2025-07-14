import prisma from "../config/prismaClient.js";

import cron from "node-cron";

// this method is used to calculate the price of a shuttle ride
export const calculatePrice = async (dropOff, pickup) => {
  const loc1 = await prisma.location.findUnique({
    where: { id: dropOff },
  });
  const loc2 = await prisma.location.findUnique({
    where: { id: pickup },
  });

  const price = loc1.price - loc2.price;
  return price;
};

export const nextFriday = () => {
  const today = new Date();
  const nextFriday = new Date(today);
  nextFriday.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7));
  return nextFriday;
};

export const updateShuttleAvailability = async () => {
  await prisma.shuttle.updateMany({
    where: {
      departureDate: {
        lt: new Date(), // past date
      },
      available: true,
    },
    data: {
      available: false,
    },
  });
};

function generateThreeDigitCode() {
  const digit1 = Math.floor(Math.random() * 10); // 0–9
  const digit2 = Math.floor(Math.random() * 10);
  const digit3 = Math.floor(Math.random() * 10);
  const digit4 = Math.floor(Math.random() * 10);

  return `${digit1}${digit2}${digit3}${digit4}`;
}

export const createWeeklyShuttles = async () => {
  await prisma.shuttle.createMany({
    data: [
      {
        name: "Shuttle#" + generateThreeDigitCode(),
        departureDate: nextFriday(),
        available: true,
        capacity: 20,
        // Add other required fields
      },
      {
        name: "Shuttle#" + generateThreeDigitCode(),
        departureDate: nextFriday(),
        available: true,
        capacity: 20,
        // Add other required fields
      },
    ],
  });

  console.log("✅ Two new shuttles created for the week.");
};

// Run every Monday at 00:00 (midnight)
cron.schedule("0 0 * * 1", async () => {
  await createWeeklyShuttles();
});
