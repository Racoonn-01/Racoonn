import 'dotenv/config';

async function run() {
    const res = await fetch('http://localhost:3000/api/invoices');
    const json = await res.json();
    console.log("Invoices:", JSON.stringify(json.invoices, null, 2));
}

run();
