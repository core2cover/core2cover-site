const fetch = require('node-fetch');

async function login() {
    const url = 'http://localhost:3000/api/login';
    const body = {
        email: 'testuser@example.com',
        password: 'password123'
    };

    console.log(`Attempting login to ${url} with`, body);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

login();
