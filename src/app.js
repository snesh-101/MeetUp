const express= require("express");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const jwt=require("jsonwebtoken");
const cookieParser=require("cookie-parser");
const cors=require("cors");
const http=require("http");
const app=express();
const allowedOrigins = [
  'http://localhost:5173',
  'https://meetup-frontend-y5rn.onrender.com'
];
app.use(cors({
   origin: allowedOrigins,
   credentials:true,
   methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT']
}));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(express.json());
app.use(cookieParser());

const connectDB=require("./config/db.js")
const User =require("./models/user.js")
   
const authRouter=require("./routes/auth.js")
const profileRouter=require("./routes/profile.js")
const requestRouter=require("./routes/requests.js");
const userRouter = require("./routes/user.js");
const initializeSocket = require("./utils/socket.js");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

const chatRouter = require("./routes/chat.js"); // Import the chat route
app.use("/chat", chatRouter); // Mount the chat router at /chat path

const server=http.createServer(app);
initializeSocket(server)

// VideoSDK Configuration
const API_KEY = process.env.VIDEOSDK_API_KEY;
const SECRET_KEY = process.env.VIDEOSDK_SECRET_KEY;

// Validate VideoSDK environment variables
if (!API_KEY || !SECRET_KEY) {
  console.error('Missing VideoSDK environment variables: VIDEOSDK_API_KEY and VIDEOSDK_SECRET_KEY');
}

/**
 * Validate JWT token for VideoSDK
 */
const validateVideoSDKToken = (token) => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return { valid: true, decoded };
  } catch (error) {
    console.error('VideoSDK token validation error:', error.message);
    return { valid: false, error: error.message };
  }
};

/**
 * Make authenticated request to VideoSDK API
 */
const makeVideoSDKRequest = async (endpoint, method = 'GET', data = null, token = null) => {
  try {
    const config = {
      method,
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`https://api.videosdk.live${endpoint}`, config);
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(`VideoSDK API error: ${response.status} - ${JSON.stringify(responseData)}`);
    }
    
    return { success: true, data: responseData };
  } catch (error) {
    console.error(`VideoSDK API error for ${endpoint}:`, error.message);
    return { 
      success: false, 
      error: error.message
    };
  }
};

// VideoSDK Routes

/**
 * POST /get-token - Generate JWT token for VideoSDK
 */
app.post("/get-token", (req, res) => {
  try {
    const payload = {
      apikey: API_KEY,
      permissions: ["allow_join", "allow_mod"],
      version: 2
    };
    
    const token = jwt.sign(payload, SECRET_KEY, {
      expiresIn: "24h",
      algorithm: "HS256",
    });
    
    res.json({ 
      success: true,
      token,
      expiresIn: "24h"
    });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate token',
      message: error.message
    });
  }
});

/**
 * POST /validate-token - Validate VideoSDK JWT token
 */
app.post("/validate-token", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      valid: false,
      error: 'Token is required'
    });
  }

  const validation = validateVideoSDKToken(token);
  
  if (validation.valid) {
    res.json({
      success: true,
      valid: true,
      decoded: validation.decoded
    });
  } else {
    res.status(401).json({
      success: false,
      valid: false,
      error: validation.error
    });
  }
});

/**
 * POST /create-room - Create new meeting room
 */
app.post("/create-room", async (req, res) => {
  try {
    const { token } = req.body;

    // Validate token if provided, otherwise generate new one
    let authToken = token;
    if (token) {
      const validation = validateVideoSDKToken(token);
      if (!validation.valid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token provided'
        });
      }
    } else {
      // Generate new token if not provided
      const payload = {
        apikey: API_KEY,
        permissions: ["allow_join", "allow_mod"],
        version: 2
      };
      authToken = jwt.sign(payload, SECRET_KEY, {
        expiresIn: "24h",
        algorithm: "HS256",
      });
    }

    const response = await fetch("https://api.videosdk.live/v2/rooms", {
      method: "POST",
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to create room: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    res.json({ 
      success: true,
      roomId: data.roomId,
      room: data
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create room',
      message: error.message
    });
  }
});

/**
 * POST /validate-room - Validate if room exists and is accessible
 */
app.post("/validate-room", async (req, res) => {
  try {
    const { token, roomId } = req.body;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        valid: false,
        error: 'Room ID is required'
      });
    }

    // Validate token if provided, otherwise generate new one
    let authToken = token;
    if (token) {
      const validation = validateVideoSDKToken(token);
      if (!validation.valid) {
        return res.status(401).json({
          success: false,
          valid: false,
          error: 'Invalid token provided'
        });
      }
    } else {
      // Generate new token if not provided
      const payload = {
        apikey: API_KEY,
        permissions: ["allow_join", "allow_mod"],
        version: 2
      };
      authToken = jwt.sign(payload, SECRET_KEY, {
        expiresIn: "24h",
        algorithm: "HS256",
      });
    }

    // Check if room exists
    const result = await makeVideoSDKRequest(`/v2/rooms/${roomId}`, 'GET', null, authToken);

    if (result.success) {
      res.json({
        success: true,
        valid: true,
        room: result.data
      });
    } else {
      // Room doesn't exist or other error
      res.json({
        success: false,
        valid: false,
        error: 'Room not found or inaccessible',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Validate room error:', error);
    res.status(500).json({
      success: false,
      valid: false,
      error: 'Failed to validate room',
      message: error.message
    });
  }
});

/**
 * GET /room-info/:roomId - Get room information
 */
app.get("/room-info/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header required'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const validation = validateVideoSDKToken(token);
    
    if (!validation.valid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    const result = await makeVideoSDKRequest(`/v2/rooms/${roomId}`, 'GET', null, token);

    if (result.success) {
      res.json({
        success: true,
        room: result.data
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Room not found',
        details: result.error
      });
    }
  } catch (error) {
    console.error('Get room info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get room info',
      message: error.message
    });
  }
});

/**
 * POST /end-room - End a meeting room
 */
app.post("/end-room", async (req, res) => {
  try {
    const { token, roomId } = req.body;

    if (!roomId) {
      return res.status(400).json({
        success: false,
        error: 'Room ID is required'
      });
    }

    // Validate token if provided, otherwise generate new one
    let authToken = token;
    if (token) {
      const validation = validateVideoSDKToken(token);
      if (!validation.valid) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token provided'
        });
      }
    } else {
      // Generate new token if not provided
      const payload = {
        apikey: API_KEY,
        permissions: ["allow_join", "allow_mod"],
        version: 2
      };
      authToken = jwt.sign(payload, SECRET_KEY, {
        expiresIn: "24h",
        algorithm: "HS256",
      });
    }

    const result = await makeVideoSDKRequest(`/v2/rooms/${roomId}/end`, 'POST', {}, authToken);

    if (result.success) {
      res.json({
        success: true,
        message: 'Room ended successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to end room',
        details: result.error
      });
    }
  } catch (error) {
    console.error('End room error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end room',
      message: error.message
    });
  }
});

/**
 * GET /health - Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Video Call Backend',
    videosdk: {
      configured: !!(API_KEY && SECRET_KEY)
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: error.message
  });
});

connectDB().then(
   ()=>{
      console.log("database connected successfully")
      const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

   }
).catch((err)=>{
   console.error("database couldn't be connected")
})
