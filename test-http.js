require('dotenv').config();
const https = require('https');

console.log('Starting HTTP test...');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);

const options = {
    hostname: process.env.SUPABASE_URL.replace('https://', ''),
    path: '/rest/v1/ai_memory?select=count',
    method: 'GET',
    headers: {
        'apikey': process.env.SUPABASE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_KEY}`
    }
};

const req = https.request(options, (res) => {
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', res.headers);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response:', data);
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.end(); 