const express = require("express");
const { ObjectId, MongoClient } = require("mongodb");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const yup = require("yup"); // Import yup for validation

// Initialize express app and middleware

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

let client;

// Initialize the database and start the server

const initializeDBAndServer = async () => {
  const uri = process.env.DATABASE_URL;
  client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB...");

    app.listen(process.env.PORT || 5004, () => {
      console.log("Server running on port 5004");
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

initializeDBAndServer();

const hallSchema = yup
  .object()
  .shape({
    hallName: yup.string().max(200).required("Hall name is required"),
    features: yup
      .array()
      .of(
        yup
          .string()
          .max(100, "Each feature can be a maximum of 100 characters")
          .nullable(true)
          .notRequired()
      ),
    capacity: yup.string().max(50),
    size: yup.string().required("Size is required"),
    pricePerHour: yup
      .number("Price must be a number")
      .transform((value, originalValue) =>
        originalValue === "" ? undefined : value
      )
      .min(0, "Price per hour must be at least 0")
      .nullable(true)
      .notRequired()
      .test("pHourOrpDay", "Price per hour is required", function (value) {
        const { pricePerDay } = this.parent;
        return value !== undefined || pricePerDay !== undefined;
      })
      .test("bothNotZero", "Price per hour cannot be zero", function (value) {
        const { pricePerDay } = this.parent;
        return !(value === 0 && pricePerDay === 0);
      }),
    pricePerDay: yup
      .number("Price must be a number")
      .transform((value, originalValue) =>
        originalValue === "" ? undefined : value
      )
      .min(0, "Price per day must be at least 0")
      .nullable(true)
      .notRequired()
      .test("pDayOrpHour", "Price per day is required", function (value) {
        const { pricePerHour } = this.parent;
        return value !== undefined || pricePerHour !== undefined;
      })
      .test("bothNotZero", "Price per day cannot be zero", function (value) {
        const { pricePerHour } = this.parent;
        return !(value === 0 && pricePerHour === 0);
      }),
  })
  .test(
    "pHourOrpDayRequired",
    "At least one of price per hour or price per day is required",
    function (value) {
      return (
        value.pricePerHour !== undefined || value.pricePerDay !== undefined
      );
    }
  );

// Middleware to validate request body

const validateHallData = async (req, res, next) => {
  try {
    await hallSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(400).json({
      message: "Validation failed",
      errors: error.errors,
    });
  }
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log('authHeader', authHeader)

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send("Unauthorized: Missing or invalid token");
  }

  const token = authHeader.split(" ")[1];
  console.log('token', token)

  jwt.verify(token, "MY_SECRET_TOKEN", (error, decoded) => {
    if (error) {
      return res.status(403).json({ error: "Forbidden: Invalid token" });
    }

    req.user = decoded;
    next();
  });
};

app.post("/signup", async (req, res) => {
  try {
    const collection = client.db("partyHalls").collection("userDetails");
    const userDetails = req.body;
    const { email } = userDetails;
    const isUserExist = await collection.find({ email }).toArray();
    if (isUserExist.length === 0) {
      const hashedPassword = await bcrypt.hash(userDetails.password, 10);
      userDetails.password = hashedPassword;
      const result = await collection.insertOne(userDetails);
      res.status(200);
      res.send({
        yourId: result.insertedId,
        message: "User registered successfuly",
      });
    } else {
      res.status(401);
      res.send({ errorMsg: "User with this Email ID already exists" });
    }
  } catch (error) {
    res.status(500);
    res.send({ "Internal server error:": error });
  }
});

app.post("/signin", async (request, response) => {
  try {
    const collection = client.db("partyHalls").collection("userDetails");
    const userDetails = request.body;
    const { email, password } = userDetails;
    const isUserExist = await collection.findOne({ email });
    if (!isUserExist) {
      response.status(401);
      response.send({ errorMsg: "Email does not exists" });
      return;
    }
    const isPasswordMatched = await bcrypt.compare(
      password,
      isUserExist.password
    );
    if (isPasswordMatched) {
      const token = jwt.sign(
        { userId: isUserExist._id, email: isUserExist.email },
        "MY_SECRET_TOKEN"
      );
      response.status(200).send({ jwtToken: token, userId: isUserExist._id });
    } else {
      response.status(401).send({ errorMsg: "Incorrect password" });
    }
  } catch (error) {
    response.status(500);
    response.send({ "Internal server error:": error });
  }
});

// API endpoint to add hall details with validation

app.post("/hall", validateHallData, authenticateToken, async (req, res) => {
  try {
    const collection = client.db("partyHalls").collection("halls");
    const hallDetails = req.body;
    console.log('hallDetails', hallDetails)

    const { hallName } = hallDetails;
    const isHallExist = await collection.findOne({ hallName });

    if (isHallExist) {
      res.status(401).send({ errorMsg: "Hall Name already exists" });
      return;
    }

    // Data with additional fields
    const newHallData = {
      ...hallDetails,
      c_Id: new ObjectId(req.user.userId),
      cAt: new Date(),
      c_By: req.user.email,
    };

    // Insert the new hall data
    const result = await collection.insertOne(newHallData);
    res.status(200).json({
      yourId: result.insertedId,
      message: "Hall data added successfully",
    });
  } catch (error) {
    console.error("Error adding hall data:", error);
    res.status(500).send("Internal server error");
  }
});

// Get Hall Item API

app.get("/hall", async (req, res) => {
  try {
    const collection = client.db("partyHalls").collection("halls");
    const getAllDetails = await collection.find({}).toArray();
    res.status(200).send(getAllDetails);
  } catch {
    res.status(500).send("Internal Server Error");
  }
});

// app.get("/hall", authenticateToken, async (req, res) => {
//   try {
//     const collection = client.db("partyHalls").collection("halls");

//     // Fetch only halls created by the logged-in user
//     const getAllDetails = await collection
//       .find({ c_Id: new ObjectId(req.user.userId) })
//       .toArray();

//     res.status(200).json(getAllDetails);
//   } catch (error) {
//     console.error("Error fetching hall items:", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// Get Specific Item API

app.get("/hall/:hallItemId", async (req, res) => {
  try {
    const collection = client.db("partyHalls").collection("halls");
    const { hallItemId } = req.params;
    const getOneItem = await collection.findOne({
      _id: new ObjectId(hallItemId),
    });
    res.status(200).send(getOneItem);
  } catch {
    res.status(500).send("Internal Server Error");
  }
});

// Delete Hall Item API

app.delete("/hall/:hallItemId", async (req, res) => {
  try {
    const collection = client.db("partyHalls").collection("halls");
    const { hallItemId } = req.params;
    await collection.deleteOne({
      _id: new ObjectId(hallItemId),
    });
    res.status(200).send("Deleted Successfully");
  } catch {
    res.status(500).send("Internal server error");
  }
});

// Update Hall Item API with validation

app.put(
  "/hall/:hallItemId",
  validateHallData,
  authenticateToken,
  async (req, res) => {
    try {
      const collection = client.db("partyHalls").collection("halls");
      const { hallItemId } = req.params;
      const hallItemDetails = req.body;
      const { hallName, features, capacity, size, addnlFeatures } =
        hallItemDetails;
      const updateQuery = {
        $set: {
          u_Id: new ObjectId(req.user.userId),
          uAt: new Date(),
          u_By: req.user.email,
          hallName,
          features,
          capacity,
          size,
          addnlFeatures,
        },
      };
      await collection.updateOne(
        { _id: new ObjectId(hallItemId) },
        updateQuery
      );
      res.status(200).send("Hall Data Updated Successfully");
    } catch {
      res.status(500).send("Internal Server Error");
    }
  }
);

// Booking Component API

app.post("/booking", authenticateToken, async (req, res) => {
  try {
    const collection = client.db("partyHalls").collection("booking");
    const hallsCollection = client.db("partyHalls").collection("halls");

    const { date, bStartDate, bEndDate, ...bookingDetails } = req.body;
    const hallName = bookingDetails.hallName;

    const { items } = bookingDetails;

    const totalSum = items?.reduce((sum, item) => sum + item.amount, 0) || 0;

    const newBookingDetails = {
      ...bookingDetails,
      bStartDate: new Date(bStartDate),
      bEndDate: new Date(bEndDate),
      date: new Date(date),
      status: "Open",
      totalAmount: totalSum,
      c_Id: new ObjectId(req.user.userId),
      cAt: new Date(),
      c_By: req.user.email,
    };

    const hall = await hallsCollection.findOne({ hallName });

    if (!hall) {
      return res.status(404).send("Hall not found");
    }

    newBookingDetails.hall_id = hall._id;

    const addBookingQuery = await collection.insertOne(newBookingDetails);

    res.status(200).send({
      message: "Booking Details Added Successfully",
      bookings: addBookingQuery,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

// Get Booking Details API

app.get("/booking", async (req, res) => {
  try {
    const collection = client.db("partyHalls").collection("booking");
    const getBookingItems = await collection.find({}).toArray();

    res.status(200).send(getBookingItems);
  } catch {
    res.status(500).send("Internal Server Error");
  }
});

app.get("/booking/:bookingItemId", async (req, res) => {
  try {
    const collection = client.db("partyHalls").collection("booking");
    const { bookingItemId } = req.params;
    const getOneItem = await collection.findOne({
      _id: new ObjectId(bookingItemId),
    });
    res.status(200).send(getOneItem);
  } catch {
    res.status(500).send("Internal Server Error");
  }
});

app.put("/booking/:bookingItemId", authenticateToken, async (req, res) => {
  try {
    const collection = client.db("partyHalls").collection("booking");
    const { bookingItemId } = req.params;
    const bookingDetails = req.body;
    const {
      date,
      hallName,
      customerName,
      mobileNo,
      bStartDate,
      bEndDate,
      items,
      advance,
    } = bookingDetails;

    const totalSum = items?.reduce((sum, item) => sum + item.amount, 0) || 0;

    const updateQuery = {
      $set: {
        u_Id: new ObjectId(req.user.userId),
        uAt: new Date(),
        u_By: req.user.email,
        date: new Date(date),
        hallName,
        customerName,
        mobileNo,
        bStartDate: new Date(bStartDate),
        bEndDate: new Date(bEndDate),
        totalAmount: totalSum,
        items,
        advance,
      },
    };
    await collection.updateOne(
      { _id: new ObjectId(bookingItemId) },
      updateQuery
    );
    res.status(200).send("Booking Data Updated Successfully");
  } catch {
    res.status(500).send("Internal Server Error");
  }
});

app.delete("/booking/:bookingItemId", async (req, res) => {
  try {
    const collection = client.db("partyHalls").collection("booking");
    const { bookingItemId } = req.params;
    await collection.deleteOne({
      _id: new ObjectId(bookingItemId),
    });
    res.status(200).send("Deleted Successfully");
  } catch {
    res.status(500).send("Internal server error");
  }
});

// GET route to fetch only the payment method
app.get("/api/filteredItems", async (req, res) => {
  const { page, limit } = req.query;

  const pageNumber = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 10;

  const skip = (pageNumber - 1) * pageSize;

  try {
    const collection = client.db("partyHalls").collection("booking");
    const totalCount = await collection.countDocuments();

    const pipeline = [
      {
        $skip: skip,
      },
      {
        $limit: pageSize,
      },
    ];

    const result = await collection.aggregate(pipeline).toArray();
    res.json({
      data: result,
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: pageNumber,
      pageSize: pageSize,
    });
  } catch (error) {
    console.error("Error fetching filtered items:", error);
    res.status(500).send("Error fetching filtered items");
  }
});

app.post("/mahal", async (req, res) => {
  try {
    const collection = client.db("partyHalls").collection("halls");
    const mahalDetails = req.body;
    console.log('mahalDetails', mahalDetails)

    const { hallName } = mahalDetails;
    const isHallExist = await collection.findOne({ hallName });

    if (isHallExist) {
      res.status(401).send({ errorMsg: "Hall Name already exists" });
      return;
    }

    // Data with additional fields
    const newHallData = {
      ...mahalDetails,
      cAt: new Date(),
    };

    // Insert the new hall data
    const result = await collection.insertOne(newHallData);
    res.status(200).json({
      yourId: result.insertedId,
      message: "Hall data added successfully",
    });
  } catch (error) {
    console.error("Error adding hall data:", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = app;
