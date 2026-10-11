async function test() {
    try {
        const res = await fetch('https://sgp.cloud.appwrite.io/v1/databases/6a3cec630035d63ea963/collections/properties/documents', {
            headers: {
                'X-Appwrite-Project': '6a3bce6900381359c3ce',
                'Content-Type': 'application/json'
            }
        });
        const json = await res.json();
        const property = json.documents.find(d => d.propertyName && d.propertyName.includes('Kainchidham'));
        if (property) {
            let errorCount = 0;
            for (const photo of property.photos) {
                let url = photo;
                if (url.includes('/view')) {
                    url = url.replace('/view', '/preview');
                    url += (url.includes('?') ? '&' : '?') + 'output=webp';
                }
                const photoRes = await fetch(url, { method: 'GET' });
                if (photoRes.status === 404) {
                    console.log("GET 404:", url);
                    errorCount++;
                }
            }
            if (errorCount === 0) console.log("All GET requests returned 200/2xx!");
        }
    } catch (e) {
        console.error(e);
    }
}
test();
