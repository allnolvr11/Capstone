const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = require('./Database/database');
const config = require('./config/config');
const secretKey = config.secretKey;

app.use(bodyParser.json());

const adminRoute = require('./Routes/Admin')(pool, secretKey);
const parkingSesRoute = require('./Routes/ParkingSes')(pool, secretKey);
const receiptRoute = require('./Routes/reciept')(pool, secretKey);
const receiptRetrievalRoute = require('./Routes/recieptRetrival')(pool, secretKey);
const parkedVehiclesRoute = require('./Routes/parkedVehicle')(pool, secretKey);

app.use("/api", adminRoute);
app.use("/api/parkingSession", parkingSesRoute);
app.use("/api/receipt", receiptRoute);
app.use("/api/receiptRetrival", receiptRetrievalRoute);
app.use("/api/parkedVehicles", parkedVehiclesRoute);

app.use(cors());

app.listen(PORT, () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});