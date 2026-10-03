const SERVER_URL = 'http://localhost:5003/api/analytics';

async function getAnalytics() {
    try {
        const response = await fetch(SERVER_URL);
        const data = await response.json();
        document.getElementById('output').textContent = JSON.stringify(data, null, 2);
    } catch (err) {
        document.getElementById('output').textContent = 'Error connecting to server: ' + err.message;
    }
}
