const CowData = require('../models/CowData');

// GET: Temperature trends over time
const getTemperatureTrends = async (req, res) => {
  try {
    const { days = 7, cowId } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const matchStage = {
      timestamp: { $gte: startDate }
    };
    
    if (cowId) {
      matchStage.cowId = cowId;
    }

    const trends = await CowData.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            cowId: "$cowId"
          },
          avgTemp: { $avg: "$temperature" },
          maxTemp: { $max: "$temperature" },
          minTemp: { $min: "$temperature" },
          recordCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          cows: {
            $push: {
              cowId: "$_id.cowId",
              avgTemp: { $round: ["$avgTemp", 2] },
              maxTemp: "$maxTemp",
              minTemp: "$minTemp",
              recordCount: "$recordCount"
            }
          },
          overallAvgTemp: { $avg: "$avgTemp" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.status(200).json({
      period: `${days} days`,
      cowId: cowId || "All",
      trends: trends.map(trend => ({
        date: trend._id,
        overallAverage: { $round: [trend.overallAvgTemp, 2] },
        cows: trend.cows
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET: Motion activity analysis
const getMotionAnalysis = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const analysis = await CowData.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: "$cowId",
          avgMotion: { $avg: "$motionChange" },
          maxMotion: { $max: "$motionChange" },
          minMotion: { $min: "$motionChange" },
          totalRecords: { $sum: 1 },
          activityLevels: {
            $push: {
              $cond: [
                { $gt: ["$motionChange", 50] },
                "high",
                {
                  $cond: [
                    { $lt: ["$motionChange", 10] },
                    "low",
                    "medium"
                  ]
                }
              ]
            }
          }
        }
      },
      {
        $project: {
          cowId: "$_id",
          avgMotion: { $round: ["$avgMotion", 2] },
          maxMotion: "$maxMotion",
          minMotion: "$minMotion",
          totalRecords: "$totalRecords",
          highActivity: {
            $size: {
              $filter: {
                input: "$activityLevels",
                cond: { $eq: ["$$this", "high"] }
              }
            }
          },
          mediumActivity: {
            $size: {
              $filter: {
                input: "$activityLevels",
                cond: { $eq: ["$$this", "medium"] }
              }
            }
          },
          lowActivity: {
            $size: {
              $filter: {
                input: "$activityLevels",
                cond: { $eq: ["$$this", "low"] }
              }
            }
          }
        }
      },
      { $sort: { avgMotion: -1 } }
    ]);

    res.status(200).json({
      period: `${days} days`,
      analysis: analysis
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET: Disease prediction accuracy
const getDiseaseAccuracy = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const accuracy = await CowData.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: "$disease",
          count: { $sum: 1 },
          avgTemp: { $avg: "$temperature" },
          avgMotion: { $avg: "$motionChange" }
        }
      },
      {
        $project: {
          disease: "$_id",
          count: "$count",
          percentage: {
            $multiply: [
              { $divide: ["$count", { $sum: "$count" }] },
              100
            ]
          },
          avgTemp: { $round: ["$avgTemp", 2] },
          avgMotion: { $round: ["$avgMotion", 2] }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const totalRecords = accuracy.reduce((sum, item) => sum + item.count, 0);
    const normalCount = accuracy.find(item => item.disease === "Normal")?.count || 0;
    const accuracyPercentage = totalRecords > 0 ? ((normalCount / totalRecords) * 100).toFixed(2) : 0;

    res.status(200).json({
      period: `${days} days`,
      totalRecords,
      accuracyPercentage: parseFloat(accuracyPercentage),
      distribution: accuracy
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET: Hourly activity patterns
const getHourlyPatterns = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const patterns = await CowData.aggregate([
      { $match: { timestamp: { $gte: startDate } } },
      {
        $group: {
          _id: {
            hour: { $hour: "$timestamp" },
            cowId: "$cowId"
          },
          avgMotion: { $avg: "$motionChange" },
          avgTemp: { $avg: "$temperature" },
          recordCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.hour",
          cows: {
            $push: {
              cowId: "$_id.cowId",
              avgMotion: { $round: ["$avgMotion", 2] },
              avgTemp: { $round: ["$avgTemp", 2] },
              recordCount: "$recordCount"
            }
          },
          overallAvgMotion: { $avg: "$avgMotion" },
          overallAvgTemp: { $avg: "$avgTemp" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.status(200).json({
      period: `${days} days`,
      hourlyPatterns: patterns.map(pattern => ({
        hour: pattern._id,
        overallAvgMotion: { $round: [pattern.overallAvgMotion, 2] },
        overallAvgTemp: { $round: [pattern.overallAvgTemp, 2] },
        cows: pattern.cows
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET: Health risk assessment
const getHealthRiskAssessment = async (req, res) => {
  try {
    const { cowId } = req.query;
    
    const matchStage = {};
    if (cowId) {
      matchStage.cowId = cowId;
    }

    const assessment = await CowData.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$cowId",
          latestData: { $last: "$$ROOT" },
          avgTemp: { $avg: "$temperature" },
          maxTemp: { $max: "$temperature" },
          minTemp: { $min: "$temperature" },
          avgMotion: { $avg: "$motionChange" },
          totalRecords: { $sum: 1 },
          diseaseCounts: {
            $push: "$disease"
          }
        }
      },
      {
        $project: {
          cowId: "$_id",
          latestData: "$latestData",
          riskScore: {
            $add: [
              // Temperature risk (0-40 points)
              {
                $multiply: [
                  {
                    $cond: [
                      { $gt: ["$avgTemp", 40] },
                      40,
                      {
                        $cond: [
                          { $gt: ["$avgTemp", 38] },
                          20,
                          {
                            $cond: [
                              { $lt: ["$avgTemp", 35] },
                              30,
                              0
                            ]
                          }
                        ]
                      }
                    ]
                  },
                  1
                ]
              },
              // Motion risk (0-20 points)
              {
                $multiply: [
                  {
                    $cond: [
                      { $lt: ["$avgMotion", 10] },
                      20,
                      {
                        $cond: [
                          { $gt: ["$avgMotion", 100] },
                          10,
                          0
                        ]
                      }
                    ]
                  },
                  1
                ]
              },
              // Disease risk (0-40 points)
              {
                $multiply: [
                  {
                    $size: {
                      $filter: {
                        input: "$diseaseCounts",
                        cond: { $ne: ["$$this", "Normal"] }
                      }
                    }
                  },
                  5
                ]
              }
            ]
          },
          avgTemp: { $round: ["$avgTemp", 2] },
          maxTemp: "$maxTemp",
          minTemp: "$minTemp",
          avgMotion: { $round: ["$avgMotion", 2] },
          totalRecords: "$totalRecords"
        }
      },
      {
        $project: {
          cowId: "$cowId",
          latestData: "$latestData",
          riskScore: "$riskScore",
          riskLevel: {
            $cond: [
              { $gte: ["$riskScore", 70] },
              "High",
              {
                $cond: [
                  { $gte: ["$riskScore", 40] },
                  "Medium",
                  "Low"
                ]
              }
            ]
          },
          avgTemp: "$avgTemp",
          maxTemp: "$maxTemp",
          minTemp: "$minTemp",
          avgMotion: "$avgMotion",
          totalRecords: "$totalRecords"
        }
      },
      { $sort: { riskScore: -1 } }
    ]);

    res.status(200).json({
      assessment: assessment,
      summary: {
        totalCows: assessment.length,
        highRisk: assessment.filter(cow => cow.riskLevel === "High").length,
        mediumRisk: assessment.filter(cow => cow.riskLevel === "Medium").length,
        lowRisk: assessment.filter(cow => cow.riskLevel === "Low").length
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getTemperatureTrends,
  getMotionAnalysis,
  getDiseaseAccuracy,
  getHourlyPatterns,
  getHealthRiskAssessment
};


