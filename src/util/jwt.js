const jwt = require("jsonwebtoken");

const getToken = (payload, time = "24h") => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: time });

  return token;
};
const checkToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return decoded;
  } catch (err) {
    throw new Error("Invalad/Expired Token.");
  }
};
const getTokenFromContext = (context) => {
  const authHeader = context.req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split("Bearer ")[1];
    if (token) {
      return token;
    } else {
      throw new Error("Authorization token must be 'Bearer [token]'");
    }
  } else {
    throw new Error("Authorization Header must be provided.");
  }
};
module.exports = {
  getToken,
  checkToken,
  getTokenFromContext,
};
