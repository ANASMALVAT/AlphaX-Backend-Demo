const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./src/routes/api');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({ origin:process.env.CORS_ORIGIN,credentials : true }));

app.use(cors());

// Routes
app.use(routes);

// Start the server on port 5000
const port = 5001;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
