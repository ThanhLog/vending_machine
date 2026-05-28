require("dotenv").config();
const db = require("./src/config/firebase");

const machines = [
  {
    id: "VM-001",
    name: "VM-001",
    location: "Floor 3, Building A",
    latitude: 21.0288,
    longitude: 105.854,
    isOnline: true,
    products: 12,
    temperature: 5.0,
    mode: "normal",
  },
  {
    id: "VM-002",
    name: "VM-002",
    location: "Building B, Lobby",
    latitude: 21.0295,
    longitude: 105.855,
    isOnline: false,
    products: 7,
    temperature: 8.0,
    mode: "normal",
  },
  {
    id: "VM-003",
    name: "VM-003",
    location: "Canteen, Floor 1",
    latitude: 21.03,
    longitude: 105.853,
    isOnline: true,
    products: 9,
    temperature: 4.0,
    mode: "normal",
  },
];

const slots = [
  // 9 slots A1-C3 for each machine
  { slot: "A1", name: "Coca Cola", price: "$1.50", priceETH: 0.001, status: "available" },
  { slot: "A2", name: "Pepsi", price: "$1.50", priceETH: 0.001, status: "available" },
  { slot: "A3", name: "7-Up", price: "$1.25", priceETH: 0.001, status: "available" },
  { slot: "B1", name: "Lay's Chips", price: "$1.00", priceETH: 0.001, status: "available" },
  { slot: "B2", name: "Oreo", price: "$0.75", priceETH: 0.001, status: "sold" },
  { slot: "B3", name: "Snickers", price: "$1.00", priceETH: 0.001, status: "locked" },
  { slot: "C1", name: "Water", price: "$0.50", priceETH: 0.001, status: "available" },
  { slot: "C2", name: "Red Bull", price: "$2.00", priceETH: 0.001, status: "empty" },
  { slot: "C3", name: "Green Tea", price: "$1.25", priceETH: 0.001, status: "error" },
];

async function seed() {
  console.log("Seeding database...");

  for (const machine of machines) {
    const ref = db.collection("vending_machines").doc(machine.id);
    await ref.set({
      name: machine.name,
      location: machine.location,
      latitude: machine.latitude,
      longitude: machine.longitude,
      isOnline: machine.isOnline,
      products: machine.products,
      temperature: machine.temperature,
      mode: machine.mode,
      createdAt: new Date().toISOString(),
    });

    console.log(`Created machine: ${machine.id}`);

    // Seed slots for each machine
    for (const slot of slots) {
      await ref.collection("slots").doc(slot.slot).set({
        slot: slot.slot,
        name: slot.name,
        price: slot.price,
        priceETH: slot.priceETH,
        status: slot.status,
        updatedAt: new Date().toISOString(),
      });
    }

    console.log(`  -> Seeded ${slots.length} slots`);
  }

  console.log("Seeding complete!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  });
