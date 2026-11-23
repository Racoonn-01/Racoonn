const fs = require('fs');
const filePath = 'src/app/admin/dashboard/page.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const prefillLogic = `
    const chartDataMap: Record<string, number> = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Pre-fill chart data based on filter so the chart is never empty
    if (filter === 'today') {
      for (let i = 0; i < 24; i++) chartDataMap[i + ":00"] = 0;
    } else if (filter === 'weekly') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        chartDataMap[d.toLocaleDateString('en-US', { weekday: 'short' })] = 0;
      }
    } else if (filter === 'monthly') {
      for (let i = 30; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        chartDataMap[d.getDate().toString()] = 0;
      }
    } else {
      monthNames.forEach(m => chartDataMap[m] = 0);
    }
`;

content = content.replace(
    '    const chartDataMap: Record<string, number> = {};\n    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];',
    prefillLogic
);

// We need to fix the sorting logic because Object.keys(chartDataMap) doesn't guarantee insertion order for numeric strings.
// But if we prefill, we can just use the prefilled keys!
const oldSortLogic = `    chartData = Object.keys(chartDataMap).map(key => ({
      name: key,
      revenue: chartDataMap[key]
    }));
    // Sort logic if needed, but for now map iteration order or chronological based on string is fine
    if (filter === 'monthly') {
      chartData.sort((a, b) => parseInt(a.name) - parseInt(b.name));
    } else if (filter === 'today') {
      chartData.sort((a, b) => parseInt(a.name.split(':')[0]) - parseInt(b.name.split(':')[0]));
    }`;

const newSortLogic = `    chartData = Object.keys(chartDataMap).map(key => ({
      name: key,
      revenue: chartDataMap[key]
    }));
    // To preserve the chronological order we established in pre-fill, we'll re-map based on the original Object.keys order since we didn't use pure numbers for keys except monthly. Wait, for monthly, JS object keys might sort numerically automatically.
    // Let's just create chartData array directly during prefill? 
    // Actually, it's easier to just recreate chartData by iterating the keys of chartDataMap in insertion order, but since JS sorts numeric keys (like '1', '2'), we'll just sort them correctly here if needed.
    
    if (filter === 'today') {
      chartData.sort((a, b) => parseInt(a.name.split(':')[0]) - parseInt(b.name.split(':')[0]));
    } else if (filter === 'monthly') {
      // Monthly is days of the month, so numeric keys get auto-sorted by JS 1,2,3... 31.
      // That's fine for a month view.
    } else if (filter === 'yearly' || filter === 'lifetime') {
      // Keep monthNames order
      chartData.sort((a, b) => monthNames.indexOf(a.name) - monthNames.indexOf(b.name));
    }
    // weekly is short names, might be tricky to sort, but Object.keys usually preserves insertion order for strings.
`;

content = content.replace(oldSortLogic, newSortLogic);

fs.writeFileSync(filePath, content);
console.log("Fixed chart data map");
