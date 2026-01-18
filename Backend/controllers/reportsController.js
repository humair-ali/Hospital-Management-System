const { pool } = require('../config/db');

const getDayRange = (dateStr) => {
  const start = new Date(dateStr);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10)
  };
};

const getWeekRange = (dateStr) => {
  const end = new Date(dateStr);
  end.setDate(end.getDate() + 1);
  const start = new Date(dateStr);
  start.setDate(start.getDate() - 6);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10)
  };
};

const getMonthRange = (monthStr) => {
  const start = new Date(monthStr + '-01');
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10)
  };
};

const getYearRange = (yearStr) => {
  const start = new Date(yearStr + '-01-01');
  const end = new Date(parseInt(yearStr) + 1, 0, 1);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10)
  };
};

async function getDailyReport(req, res) {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, error: 'date parameter required (YYYY-MM-DD)' });
    }

    const { start, end } = getDayRange(date);
    const { start: weekStart, end: weekEnd } = getWeekRange(date);
    const userRole = req.user.role;

    const [appointmentsRes, revenueRes, totalPatientsRes, staffCountRes, weeklyActivityRes, recentActivityRes] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) as total_appointments,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
         FROM appointments
         WHERE scheduled_at >= ? AND scheduled_at < ?`,
        [start, end]
      ),
      pool.query(
        `SELECT SUM(amount) as total_paid
         FROM payments
         WHERE paid_at >= ? AND paid_at < ?`,
        [start, end]
      ),
      pool.query('SELECT COUNT(*) as count FROM patients'),
      pool.query(
        `SELECT COUNT(*) as count
          FROM users u
          JOIN roles r ON u.role_id = r.id
          WHERE r.name = 'doctor'`
      ),
      pool.query(
        `SELECT DATE(scheduled_at) as date, COUNT(*) as count
         FROM appointments
         WHERE scheduled_at >= ? AND scheduled_at < ?
         GROUP BY DATE(scheduled_at)
         ORDER BY DATE(scheduled_at)`,
        [weekStart, weekEnd]
      ),
      pool.query(
        `SELECT a.id, u_p.name as patient_name, u_d.name as doctor_name, a.scheduled_at, a.status, dr.specialty as specialization
         FROM appointments a
         JOIN patients p ON a.patient_id = p.id
         JOIN users u_p ON p.user_id = u_p.id
         JOIN doctors dr ON a.doctor_id = dr.id
         JOIN users u_d ON dr.user_id = u_d.id
         ORDER BY a.created_at DESC
         LIMIT 6`
      )
    ]);

    const apptData = appointmentsRes[0][0] || {};
    const revData = revenueRes[0][0] || {};
    const patCount = totalPatientsRes[0][0]?.count || 0;
    const staff = staffCountRes[0][0]?.count || 0;
    const weeklyData = weeklyActivityRes[0] || [];
    const recentAppts = recentActivityRes[0] || [];

    
    let data;
    if (userRole === 'doctor') {
      
      data = {
        appointments_count: apptData.total_appointments || 0,
        appointments_completed: Number(apptData.completed || 0),
        appointments_confirmed: Number(apptData.confirmed || 0),
        appointments_cancelled: Number(apptData.cancelled || 0),
        patients_count: patCount,
        staff_on_duty: staff,
        trends: weeklyData.map(d => ({
          date: d.date instanceof Date ? d.date.toISOString().slice(0, 10) : d.date,
          label: d.date instanceof Date ? d.date.toISOString().slice(0, 10) : d.date,
          appointments: d.count,
        })),
        recent_activity: recentAppts.map(a => ({
          id: a.id,
          patient: a.patient_name,
          doctor: a.doctor_name,
          specialization: a.specialization,
          time: a.scheduled_at,
          status: a.status
        }))
      };
    } else if (userRole === 'accountant') {
      
      data = {
        revenue: parseFloat(revData.total_paid || 0),
        trends: weeklyData.map(d => ({
          date: d.date instanceof Date ? d.date.toISOString().slice(0, 10) : d.date,
          label: d.date instanceof Date ? d.date.toISOString().slice(0, 10) : d.date,
          revenue: 0 
        }))
      };
    } else {
      
      data = {
        appointments_count: apptData.total_appointments || 0,
        appointments_completed: Number(apptData.completed || 0),
        appointments_confirmed: Number(apptData.confirmed || 0),
        appointments_cancelled: Number(apptData.cancelled || 0),
        revenue: parseFloat(revData.total_paid || 0),
        patients_count: patCount,
        staff_on_duty: staff,
        trends: weeklyData.map(d => ({
          date: d.date instanceof Date ? d.date.toISOString().slice(0, 10) : d.date,
          label: d.date instanceof Date ? d.date.toISOString().slice(0, 10) : d.date,
          appointments: d.count,
          revenue: 0
        })),
        recent_activity: recentAppts.map(a => ({
          id: a.id,
          patient: a.patient_name,
          doctor: a.doctor_name,
          specialization: a.specialization,
          time: a.scheduled_at,
          status: a.status
        }))
      };
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching daily report:', err);
    res.status(500).json({ success: false, error: 'Internal Analytical Computation Failure' });
  }
}

async function getMonthlyReport(req, res) {
  try {
    const { month } = req.query;
    if (!month) {
      return res.status(400).json({ success: false, error: 'month parameter required (YYYY-MM)' });
    }

    const { start, end } = getMonthRange(month);

    const [appointmentsRes, revenueRes, newPatientsRes, billsRes, dailyTrendsRes, dailyRevenueRes] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) as total_appointments,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
         FROM appointments
         WHERE scheduled_at >= ? AND scheduled_at < ?`,
        [start, end]
      ),
      pool.query(
        `SELECT SUM(amount) as total_paid
         FROM payments
         WHERE paid_at >= ? AND paid_at < ?`,
        [start, end]
      ),
      pool.query(
        `SELECT COUNT(*) as new_patients
         FROM patients
         WHERE created_at >= ? AND created_at < ?`,
        [start, end]
      ),
      pool.query(
        `SELECT SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) as paid_amount,
                SUM(CASE WHEN status IN ('issued', 'partial', 'overdue') THEN total_amount ELSE 0 END) as outstanding_amount
         FROM bills
         WHERE issued_at >= ? AND issued_at < ?`,
        [start, end]
      ),
      pool.query(
        `SELECT DATE(scheduled_at) as date, COUNT(*) as count
         FROM appointments
         WHERE scheduled_at >= ? AND scheduled_at < ?
         GROUP BY DATE(scheduled_at)
         ORDER BY DATE(scheduled_at)`,
        [start, end]
      ),
      pool.query(
        `SELECT DATE(paid_at) as date, SUM(amount) as revenue
         FROM payments
         WHERE paid_at >= ? AND paid_at < ?
         GROUP BY DATE(paid_at)
         ORDER BY DATE(paid_at)`,
        [start, end]
      )
    ]);

    const apptData = appointmentsRes[0][0] || {};
    const revData = revenueRes[0][0] || {};
    const patData = newPatientsRes[0][0] || {};
    const billData = billsRes[0][0] || {};
    const dailyTrends = dailyTrendsRes[0];
    const dailyRevenue = dailyRevenueRes[0];

    const data = {
      appointments_count: apptData.total_appointments || 0,
      appointments_completed: Number(apptData.completed || 0),
      appointments_confirmed: Number(apptData.confirmed || 0),
      appointments_cancelled: Number(apptData.cancelled || 0),
      revenue: parseFloat(revData.total_paid || 0),
      patients_count: Number(patData.new_patients || 0),
      paid_amount: parseFloat(billData.paid_amount || 0),
      pending_amount: parseFloat(billData.outstanding_amount || 0),
      trends: dailyTrends.map(t => ({
        label: t.date instanceof Date ? t.date.toISOString().split('T')[0] : t.date,
        appointments: t.count,
        revenue: dailyRevenue.find(r => {
          const rDate = r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date;
          const tDate = t.date instanceof Date ? t.date.toISOString().split('T')[0] : t.date;
          return rDate === tDate;
        })?.revenue || 0
      }))
    };

    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching monthly report:', err);
    res.status(500).json({ success: false, error: 'Internal Monthly Tabulation Failure' });
  }
}

async function getAnnualReport(req, res) {
  try {
    const { year } = req.query;
    if (!year) {
      return res.status(400).json({ success: false, error: 'year parameter required (YYYY)' });
    }

    const { start, end } = getYearRange(year);

    const [appointmentsRes, revenueRes, patientsRes, billsRes, monthlyTrendsRes, monthlyRevenueRes] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) as total_appointments,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
         FROM appointments
         WHERE scheduled_at >= ? AND scheduled_at < ?`,
        [start, end]
      ),
      pool.query(
        `SELECT SUM(amount) as total_paid
         FROM payments
         WHERE paid_at >= ? AND paid_at < ?`,
        [start, end]
      ),
      pool.query(
        `SELECT COUNT(*) as new_patients FROM patients WHERE created_at >= ? AND created_at < ?`,
        [start, end]
      ),
      pool.query(
        `SELECT SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) as paid_amount,
                SUM(CASE WHEN status IN ('issued', 'partial', 'overdue') THEN total_amount ELSE 0 END) as outstanding_amount
         FROM bills
         WHERE issued_at >= ? AND issued_at < ?`,
        [start, end]
      ),
      pool.query(
        `SELECT MONTH(scheduled_at) as month, COUNT(*) as count
         FROM appointments
         WHERE scheduled_at >= ? AND scheduled_at < ?
         GROUP BY 1
         ORDER BY 1`,
        [start, end]
      ),
      pool.query(
        `SELECT MONTH(paid_at) as month, SUM(amount) as revenue
         FROM payments
         WHERE paid_at >= ? AND paid_at < ?
         GROUP BY 1
         ORDER BY 1`,
        [start, end]
      )
    ]);

    const apptData = appointmentsRes[0][0] || {};
    const revData = revenueRes[0][0] || {};
    const patData = patientsRes[0][0] || {};
    const billData = billsRes[0][0] || {};
    const monthlyTrends = monthlyTrendsRes[0];
    const monthlyRevenue = monthlyRevenueRes[0];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const data = {
      appointments_count: apptData.total_appointments || 0,
      appointments_completed: Number(apptData.completed || 0),
      appointments_confirmed: Number(apptData.confirmed || 0),
      appointments_cancelled: Number(apptData.cancelled || 0),
      revenue: parseFloat(revData.total_paid || 0),
      patients_count: Number(patData.new_patients || 0),
      paid_amount: parseFloat(billData.paid_amount || 0),
      pending_amount: parseFloat(billData.outstanding_amount || 0),
      trends: monthlyTrends.map(t => ({
        label: monthNames[t.month - 1] || 'Unknown',
        appointments: t.count,
        revenue: monthlyRevenue.find(r => r.month === t.month)?.revenue || 0
      }))
    };

    res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching annual report:', err);
    res.status(500).json({ success: false, error: 'Internal Annual Audit Failure' });
  }
}

module.exports = { getDailyReport, getMonthlyReport, getAnnualReport };