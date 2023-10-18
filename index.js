const express = require('express');
const cors = require('cors');
const xml2js = require('xml2js');
const connectDB = require('./config/db');
const dataRoute = require('./routes/dataRoute');

const app = express();
app.use(cors());
const port = 3001;

// Connecting to MongoDB
connectDB();
app.use('/data', dataRoute);
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});