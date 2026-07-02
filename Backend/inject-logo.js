const fs = require('fs');
const path = require('path');

const imgPath = '/Users/haldwani/Documents/Working/Working/Racoonn/User/public/Racoonn Vertical Logo-White BG.png';
const htmlPath = path.join(__dirname, 'templates/emails/verification-code.html');

const b64 = fs.readFileSync(imgPath, 'base64');
let html = fs.readFileSync(htmlPath, 'utf8');

const imgTag = `<img src="data:image/png;base64,${b64}" style="width:140px; height:auto; display:block; margin:0 auto;" alt="Racoonn Logo" />`;

html = html.replace('<span style="font-size: 32px;"></span>', imgTag);

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Logo injected as base64 into HTML.');
