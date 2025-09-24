require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const WebSocket = require('ws'); // <-- Yeh add kiya gaya hai

const { connectDB, checkDBHealth, getDBStats } = require('./config/db');
const cowDataRoutes = require('./routes/cowData');
const analyticsRoutes = require('./routes/analytics');
const mlRoutes = require('./routes/ml');
const alertRoutes = require('./routes/alerts');
const reportRoutes = require('./routes/reports');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/cow/data', cowDataRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/reports', reportRoutes);



app.get('/', (req, res) => {
  res.send('Backend is running!');
});



// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await checkDBHealth();
    const dbStats = await getDBStats();
    
    res.status(200).json({
      status: 'OK',
      message: 'Cow Belt API is running',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      database: dbHealth,
      databaseStats: dbStats,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (err) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Cow Belt API - IoT Cattle Monitoring System',
    version: '2.0.0',
    // ... (baaki ka documentation object waisa hi rahega) ...
  });
});

// Start server
const PORT = process.env.PORT || 5000;

// Yahan app.listen ko 'server' variable mein store kiya gaya hai
const server = app.listen(PORT, () => {
  console.log(`🚀 Cow Belt API Server running on port ${PORT}`);
  console.log(`📊 Analytics endpoints available at /api/analytics`);
  console.log(`🐄 Cow data endpoints available at /api/cow/data`);
  console.log(`📚 API documentation available at /api`);
});


// === YAHAN SE WEBSOCKET KA PURA CODE ADD KIYA GAYA HAI ===

// WebSocket server banakar use existing HTTP server se joda gaya hai
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  // Sirf '/live' path ke connections ko handle karega
  if (req.url === '/live') {
    console.log('✅ WebSocket client connected to /live');

    // Har 3 second mein client ko message bhejega
    const heartBeat = setInterval(() => {
      const liveData = {
        type: 'heartbeat',
        timestamp: new Date().toISOString()
      };
      // Data ko JSON string mein convert karke bheja jayega
      ws.send(JSON.stringify(liveData));
    }, 3000);

    ws.on('message', (message) => {
      console.log('Received message from client:', message);
    });

    ws.on('close', () => {
      console.log('❌ WebSocket client disconnected from /live');
      clearInterval(heartBeat); // Connection band hone par message bhejna band
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  } else {
    // Agar path '/live' nahi hai, toh connection band kar dega
    ws.close();
  }
});

console.log('⚡️ WebSocket server is ready and listening on /live');
