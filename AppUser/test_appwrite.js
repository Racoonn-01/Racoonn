fetch('https://sgp.cloud.appwrite.io/v1/databases/6a3cec630035d63ea963/collections/rooms/documents?limit=1', {
  headers: {
    'X-Appwrite-Project': '6a3bce6900381359c3ce'
  }
}).then(r => r.json()).then(data => console.log(JSON.stringify(data.documents[0], null, 2))).catch(console.error);
