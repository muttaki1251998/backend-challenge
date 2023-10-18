const mongoose = require('mongoose');

const vehicleTypeSchema = new mongoose.Schema({
    typeId: Number,
    typeName: String
});

const vehicleDataSchema = new mongoose.Schema({
    makeId: Number,
    makeName: String,
    vehicleTypes: [vehicleTypeSchema]
});
const VehicleData = mongoose.model('VehicleData', vehicleDataSchema);
module.exports = VehicleData;