const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "../.env") });

const Testimonial = require("../models/Testimonial");

const clientData = [
  {
    name: "Tata Consultancy Services",
    fileName: "tcs.svg",
    order: 1,
    status: "Active",
  },
  {
    name: "Infosys",
    fileName: "infosys.svg",
    order: 2,
    status: "Active",
  },
  {
    name: "HCL Technologies",
    fileName: "hcl.svg",
    order: 3,
    status: "Active",
  },
  {
    name: "Wipro",
    fileName: "wipro.svg",
    order: 4,
    status: "Active",
  },
  {
    name: "Accenture",
    fileName: "accenture.svg",
    order: 5,
    status: "Active",
  },
  {
    name: "Microsoft",
    fileName: "microsoft.svg",
    order: 6,
    status: "Active",
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding testimonials...");

    const count = await Testimonial.countDocuments();
    if (count > 0) {
      console.log(`Testimonials collection already has ${count} records. Skipping seed.`);
      process.exit(0);
    }

    const svgDir = path.join(__dirname, "../../Akash-food/src/assets/clients");

    const toInsert = clientData.map((item) => {
      const filePath = path.join(svgDir, item.fileName);
      let svgContent = "";
      if (fs.existsSync(filePath)) {
        svgContent = fs.readFileSync(filePath, "utf8");
      }
      const dataUri = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString("base64")}`;

      return {
        name: item.name,
        logo: {
          url: dataUri,
          public_id: "",
        },
        description: "",
        order: item.order,
        status: item.status,
      };
    });

    await Testimonial.insertMany(toInsert);
    console.log(`Successfully seeded ${toInsert.length} testimonials into MongoDB!`);
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

seed();
