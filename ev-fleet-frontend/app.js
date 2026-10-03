const SERVER_URL = 'http://localhost:5001/api/vehicles';

async function getVehicles() {
    try {
        const response = await fetch(SERVER_URL);
        const data = await response.json();
        document.getElementById('output').textContent = JSON.stringify(data, null, 2);
    } catch (err) {
        document.getElementById('output').textContent = 'Error connecting to server: ' + err.message;
    }
}

async function addVehicle() {
    const payload = {
        vehicleId: document.getElementById('vId').value,
        vehicleType: document.getElementById('vType').value,
        companyName: document.getElementById('vCompany').value,
        vehicleModelName: document.getElementById('vModel').value,
        vehicleNoPlate: document.getElementById('vPlate').value,
        vehicleYearModel: 2026,
        vehicleServiceNo: 1,
        batteryCapacityKwh: 4.0,
        rangeKm: 160,
        topSpeedKmph: 85
    };
    try {
        const response = await fetch(SERVER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        document.getElementById('output').textContent = JSON.stringify(data, null, 2);
        getVehicles();
    } catch (err) {
        document.getElementById('output').textContent = 'Error: ' + err.message;
    }
}
