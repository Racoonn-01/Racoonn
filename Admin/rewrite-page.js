const fs = require('fs');
const filePath = 'src/app/admin/dashboard/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Replace the DashboardPage function definition to include searchParams
content = content.replace(
    'export default async function DashboardPage() {',
    'export default async function DashboardPage({ searchParams }: { searchParams?: { filter?: string } }) {\n  const filter = searchParams?.filter || \'monthly\';'
);

// We need to rewrite the data processing block.
// We'll replace everything from 'const now = new Date();' up to 'kpiData = ['
const replacementLogic = `
    const now = new Date();
    
    let currentPeriodStart = new Date(0);
    let previousPeriodStart = new Date(0);
    let previousPeriodEnd = new Date(0);
    let isLifetime = false;
    
    switch (filter) {
      case 'today':
        currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        previousPeriodStart = new Date(currentPeriodStart.getTime() - 24 * 60 * 60 * 1000);
        previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1);
        break;
      case 'weekly':
        currentPeriodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousPeriodStart = new Date(currentPeriodStart.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1);
        break;
      case 'yearly':
        currentPeriodStart = new Date(now.getFullYear(), 0, 1);
        previousPeriodStart = new Date(currentPeriodStart.getFullYear() - 1, 0, 1);
        previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1);
        break;
      case 'lifetime':
        isLifetime = true;
        break;
      case 'monthly':
      default:
        currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        previousPeriodStart = new Date(currentPeriodStart.getFullYear(), currentPeriodStart.getMonth() - 1, 1);
        previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1);
        break;
    }

    let totalRevenue = 0;
    let currentPeriodRevenue = 0;
    let previousPeriodRevenue = 0;
    let totalCommission = 0;
    let previousPeriodCommission = 0;

    const chartDataMap: Record<string, number> = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    payments.documents.forEach(payment => {
      const amount = payment.totalAmount || 0;
      const commission = payment.serviceFees || (amount * 0.15);
      
      const date = new Date(payment.$createdAt);
      
      if (isLifetime) {
        totalRevenue += amount;
        totalCommission += commission;
        currentPeriodRevenue += amount;
      } else {
        if (date >= currentPeriodStart) {
          currentPeriodRevenue += amount;
          totalRevenue += amount;
          totalCommission += commission;
        } else if (date >= previousPeriodStart && date <= previousPeriodEnd) {
          previousPeriodRevenue += amount;
          previousPeriodCommission += commission;
        }
      }

      // Chart aggregation
      let key = "";
      if (filter === 'today') {
        key = date.getHours() + ":00";
      } else if (filter === 'weekly') {
        key = date.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (filter === 'monthly') {
        key = date.getDate().toString();
      } else {
        key = monthNames[date.getMonth()];
      }
      if (!chartDataMap[key]) chartDataMap[key] = 0;
      if (isLifetime || date >= currentPeriodStart) {
          chartDataMap[key] += amount;
      }
    });

    let currentPeriodBookings = 0;
    let previousPeriodBookings = 0;
    bookings.documents.forEach(b => {
      const date = new Date(b.$createdAt);
      if (isLifetime || date >= currentPeriodStart) currentPeriodBookings++;
      else if (date >= previousPeriodStart && date <= previousPeriodEnd) previousPeriodBookings++;
    });

    let currentPeriodProps = 0;
    let previousPeriodProps = 0;
    properties.documents.forEach(p => {
      if (p.status?.toLowerCase() !== 'approved' && p.status?.toLowerCase() !== 'active') return;
      const date = new Date(p.$createdAt);
      if (isLifetime || date >= currentPeriodStart) currentPeriodProps++;
      else if (date >= previousPeriodStart && date <= previousPeriodEnd) previousPeriodProps++;
    });

`;

const startIdx = content.indexOf('    const now = new Date();');
const endIdx = content.indexOf('    kpiData = [');
if (startIdx !== -1 && endIdx !== -1) {
    content = content.substring(0, startIdx) + replacementLogic + content.substring(endIdx);
}

// Replace KPI data mappings
content = content.replace(
    'change: getChange(totalRevenue, totalRevenue - currentMonthRevenue),',
    'change: getChange(currentPeriodRevenue, previousPeriodRevenue),'
).replace(
    'value: formatCurrency(currentMonthRevenue),',
    'value: formatCurrency(currentPeriodRevenue),'
).replace(
    'change: getChange(currentMonthRevenue, lastMonthRevenue),',
    'change: getChange(currentPeriodRevenue, previousPeriodRevenue),'
).replace(
    'change: getChange(totalCommission, totalCommission - lastMonthCommission),',
    'change: getChange(totalCommission, previousPeriodCommission),'
).replace(
    'change: getChange(currentMonthBookings, lastMonthBookings),',
    'change: getChange(currentPeriodBookings, previousPeriodBookings),'
).replace(
    'value: bookings.total.toString(),',
    'value: isLifetime ? bookings.total.toString() : currentPeriodBookings.toString(),'
).replace(
    'value: activeProperties.toString(),',
    'value: isLifetime ? activeProperties.toString() : currentPeriodProps.toString(),'
).replace(
    'change: getChange(currentMonthProps, lastMonthProps),',
    'change: getChange(currentPeriodProps, previousPeriodProps),'
);

// Chart data logic
const chartLogicStart = content.indexOf('    // Chart Data (Last 7 months)');
const chartLogicEnd = content.indexOf('    // Recent Activity');
const newChartLogic = `    // Chart Data
    chartData = Object.keys(chartDataMap).map(key => ({
      name: key,
      revenue: chartDataMap[key]
    }));
    // Sort logic if needed, but for now map iteration order or chronological based on string is fine
    if (filter === 'monthly') {
      chartData.sort((a, b) => parseInt(a.name) - parseInt(b.name));
    } else if (filter === 'today') {
      chartData.sort((a, b) => parseInt(a.name.split(':')[0]) - parseInt(b.name.split(':')[0]));
    }

`;
if (chartLogicStart !== -1 && chartLogicEnd !== -1) {
    content = content.substring(0, chartLogicStart) + newChartLogic + content.substring(chartLogicEnd);
}

// Rename 'Monthly Revenue' to 'Period Revenue'
content = content.replace('"Monthly Revenue"', '`${filter.charAt(0).toUpperCase() + filter.slice(1)} Revenue`');

fs.writeFileSync(filePath, content);
console.log("Updated page.tsx");
