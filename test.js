const http = require('http');

const loginData = JSON.stringify({ email: "admin@dda.com", password: "password123" });

const loginReq = http.request(
    'http://localhost:4000/auth/login',
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginData) }
    },
    (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const token = JSON.parse(data).token;

            const mapReq = http.request(
                'http://localhost:4000/map/heatmap',
                { headers: { 'Authorization': 'Bearer ' + token } },
                (mapRes) => {
                    let mapData = '';
                    mapRes.on('data', c => mapData += c);
                    mapRes.on('end', () => {
                        console.log('HEATMAP RESPONSE:');
                        console.log(mapData.substring(0, 300) + '...');
                    });
                }
            );
            mapReq.end();
        });
    }
);
loginReq.write(loginData);
loginReq.end();
