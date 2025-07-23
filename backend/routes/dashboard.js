const express = require('express');
const router = express.Router();

// @route   GET /api/dashboard
// @desc    Get dashboard data
router.get('/', async (req, res) => {
  try {
    // Mock data for dashboard
    const dashboardData = {
      securitySummary: {
        totalScans: 42,
        threatsDetected: 8,
        dataLeaks: 3,
        systemHealth: 95
      },
      recentActivities: [
        { title: 'URL Scan', description: 'Scanned example.com', status: 'completed', time: '2 mins ago' },
        { title: 'System Scan', description: 'Full system scan completed', status: 'completed', time: '1 hour ago' },
        { title: 'Data Leak Alert', description: 'Email found in recent breach', status: 'warning', time: '3 hours ago' },
        { title: 'Firewall Update', description: 'Firewall rules updated', status: 'completed', time: '1 day ago' }
      ]
    };

    res.json(dashboardData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
