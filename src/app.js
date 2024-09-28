require('dotenv').config();
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-2' }); // Set the region here
const express = require('express');
const path = require('path');
const { verifyToken } = require('./auth');

const app = express();
const port = 8080;

// Enable JSON parsing in Express
app.use(express.json());

// Cognito authentication details
const cognito = new AWS.CognitoIdentityServiceProvider();
const poolData = {
  UserPoolId: process.env.COGNITO_USER_POOL_ID,
  ClientId: process.env.APP_CLIENT_ID,
};

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Login route for authentication
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const params = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: poolData.ClientId,
    AuthParameters: {
      EMAIL: email,
      PASSWORD: password,
    },
  };

  try {
    const authResult = await cognito.initiateAuth(params).promise();
    const token = authResult.AuthenticationResult.IdToken;

    res.json({ token });
  } catch (error) {
    console.error('Error authenticating:', error);
    res.status(400).send('Failed to authenticate.');
  }
});

// Middleware to protect routes
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send('Missing Authorization header');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await verifyToken(token);
    req.user = decodedToken; // Attach decoded token data to the request object
    next();
  } catch (error) {
    return res.status(401).send('Invalid or expired token');
  }
}

// Define the Hello World route (protected route)
app.get('/helloworld', authenticate, function (req, res) {
  res.send(`Hello World! User authenticated: ${req.user.email}`);
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../public', '404.html'));
});

// Start the server
app.listen(port, function () {
  console.log(`Live on port: ${port}!`);
});
