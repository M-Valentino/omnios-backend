// auth.js
const AWS = require("aws-sdk");
const jwt = require("jsonwebtoken");
const jwkToPem = require("jwk-to-pem");
const axios = require("axios");

const poolData = {
  UserPoolId: "YOUR_COGNITO_USER_POOL_ID",  // Replace with your Cognito User Pool ID
  ClientId: "YOUR_COGNITO_APP_CLIENT_ID",    // Replace with your Cognito App Client ID
};

// Initialize Cognito Identity Provider
const cognito = new AWS.CognitoIdentityServiceProvider();

const poolRegion = "YOUR_REGION";  // Replace with your Cognito Pool's Region
const jwksUrl = `https://cognito-idp.${poolRegion}.amazonaws.com/${poolData.UserPoolId}/.well-known/jwks.json`;

let cachedJWKs = null;

async function getJWKS() {
  if (!cachedJWKs) {
    const response = await axios.get(jwksUrl);
    cachedJWKs = response.data.keys;
  }
  return cachedJWKs;
}

async function verifyToken(token) {
  const jwks = await getJWKS();
  const decodedHeader = jwt.decode(token, { complete: true });

  if (!decodedHeader || !decodedHeader.header) {
    throw new Error("Invalid token");
  }

  const key = jwks.find((k) => k.kid === decodedHeader.header.kid);
  if (!key) {
    throw new Error("Public key not found");
  }

  const pem = jwkToPem(key);

  return new Promise((resolve, reject) => {
    jwt.verify(token, pem, { algorithms: ["RS256"] }, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}

module.exports = { verifyToken };
