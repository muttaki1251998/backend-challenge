const express = require("express");
const axios = require("axios");
const xml2js = require("xml2js");
const VehicleData = require("../models/vehicleDataModel"); // Adjust path if necessary

const router = express.Router();
const parser = new xml2js.Parser();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

router.get("/", async (req, res) => {
  try {
    // Fetch makes and convert to JSON
    const makesURL = "https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=XML";
    const makesResponse = await axios.get(makesURL);
    const makesJson = await parser.parseStringPromise(makesResponse.data);
    const makes = makesJson?.Response?.Results[0]?.AllVehicleMakes || [];

    // Fetch types and save it to database
    const allDataPromises = makes.map(async (make) => {
      const makeId = make.Make_ID[0];
      const typesURL = `https://vpic.nhtsa.dot.gov/api/vehicles/GetVehicleTypesForMakeId/${makeId}?format=xml`;

      try {
        // This the api fetch operation that keeps giving me 403 permission error but I was able to fetch them
        // properly once but I had save to db commented out for testing purposes. 
        const typesResponse = await axios.get(typesURL);
        const typesJson = await parser.parseStringPromise(typesResponse.data);

        // Construct new object for each type
        const vehicleTypes = typesJson.Response.Results[0].VehicleTypes.map(type => ({
          typeId: parseInt(type.VehicleTypeId[0], 10),
          typeName: type.VehicleTypeName[0]
        }));
        
        // Build data into the mongoose model
        const vehicleData = new VehicleData({
          makeId: parseInt(makeId, 10),
          makeName: make.Make_Name[0],
          vehicleTypes: vehicleTypes
        });

        await vehicleData.save();
        return vehicleData;
      } catch (error) {
        console.error(`Failed to fetch types for make: ${make.Make_Name[0]}. Error: ${error.message}`);
      }

      // Added delay to properly fetch data from the api but still got 403 permission denied
      // await delay(1000); // 1 second delay
    });

    const allData = await Promise.all(allDataPromises);

    res.json(allData.filter(Boolean));  // Only send non-null values
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while processing your request.");
  }
});

module.exports = router;
