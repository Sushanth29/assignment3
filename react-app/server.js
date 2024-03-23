const express = require('express');
const mongoose = require('./db');
const cors = require('cors'); 
const inventoryRouter = require('./InventoryRoutes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); 
app.use(express.json());

// Routes
app.use('/inventory', inventoryRouter);

// Serve the static files from the build folder
app.use(express.static(path.join(__dirname, '../inventory-management/build')));

// Handle any other routes by serving the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../inventory-management/build', 'index.html'));
});



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
