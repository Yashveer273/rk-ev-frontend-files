/**
 * EV Fleet Management - Frontend API Client (Pure Vanilla JavaScript for Browser)
 * - Encryption logic untouched & working properly.
 * - All Backend A-to-Z APIs and Pagination/Filters fully synchronized.
 */

const getEnvConfig = () => {
  const baseUrl = 
    (typeof window !== 'undefined' && window.ENV && window.ENV.API_BASE_URL) ||
    'http://localhost:5003/api/vehicles';

  const encryptionKey = "a8f3c9e2b4d1f6a8c5e7b9d2f4a6c8e1b3d5f7a9c2e4b6d8f1a3c5e7b9d2f4a6";

  return { baseUrl, encryptionKey };
};

/**
 * Payload को एनक्रिप्ट करके Base64 स्ट्रिंग बनाना (एन्क्रिप्शन लॉजिक यथावत है)
 */
const encryptToken = (data) => {
  try {
    const { encryptionKey } = getEnvConfig();
    const jsonString = JSON.stringify({
      data: data,
      timestamp: Date.now()
    });

    let encrypted = '';
    for (let i = 0; i < jsonString.length; i++) {
      const charCode = 
        jsonString.charCodeAt(i) ^ 
        encryptionKey.charCodeAt(i % encryptionKey.length);
      encrypted += String.fromCharCode(charCode);
    }
    return btoa(encrypted);
  } catch (error) {
    console.error('Frontend Encryption Error:', error);
    return '';
  }
};

/**
 * Standard HTTP Fetch Wrapper with Encryption Headers
 */
const apiRequest = async (endpoint = '', options = {}) => {
  const { baseUrl } = getEnvConfig();
  const url = `${baseUrl}${endpoint}`;

  // Security Header Payload Generation
  const encryptedHeaderToken = encryptToken({
    client: 'EV_Fleet_Frontend',
    status: 'authorized'
  });

  const headers = {
    'Content-Type': 'application/json',
    'x-api-encrypted-key': encryptedHeaderToken,
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.message || `HTTP Error! Status: ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error(`[EV Fleet API Error] ${options.method || 'GET'} ${url}:`, error.message);
    throw error;
  }
};

// ==========================================
// EV FLEET API SERVICES (Exported to window for UI JS Files)
// ==========================================

window.EVFleetService = {
  
  // 1. CREATE NEW VEHICLE (POST /)
  createVehicle: async (vehicleData) => {
    return await apiRequest('/', {
      method: 'POST',
      body: JSON.stringify(vehicleData)
    });
  },

  // 2. ADVANCED SEARCH & LIST VEHICLES WITH PAGINATION & FILTERS (GET /)
  searchVehicles: async (queryParams = {}) => {
    const cleanParams = {};
    
    // Pagination Defaults
    cleanParams.page = queryParams.page || 1;
    cleanParams.limit = queryParams.limit || 10;

    // Backend पर समर्थित सभी फिल्टर्स और क्वेरी पैरामीटर्स की लिस्ट
    const allowedFilters = [
      'vehicleId', 'vehicleType', 'vehicleNoPlate', 'companyName', 
      'sellerName', 'purchaseLocation', 'acquisitionType', 'status', 
      'vehicleModelName', 'vehicleYearModel', 'vehicleMotorPowerKw', 
      'batteryCapacityKwh', 'rangeKm', 'topSpeedKmph', 'search'
    ];

    allowedFilters.forEach((key) => {
      const val = queryParams[key];
      if (val !== undefined && val !== null && val !== '') {
        cleanParams[key] = String(val);
      }
    });

    const searchParams = new URLSearchParams(cleanParams).toString();
    const endpoint = `/?${searchParams}`;

    return await apiRequest(endpoint, {
      method: 'GET'
    });
  },

  // 3. GET SINGLE VEHICLE BY ID (GET /:id)
  getVehicleById: async (vehicleId) => {
    return await apiRequest(`/${vehicleId}`, {
      method: 'GET'
    });
  },

  // 4. FULL / PARTIAL UPDATE VEHICLE - PUT or PATCH (PUT/PATCH /:id)
  updateVehicle: async (vehicleId, updateData, method = 'PUT') => {
    return await apiRequest(`/${vehicleId}`, {
      method: method.toUpperCase(),
      body: JSON.stringify(updateData)
    });
  },

  // 5. DELETE ENTIRE VEHICLE RECORD (DELETE /:id)
  deleteVehicle: async (vehicleId) => {
    return await apiRequest(`/${vehicleId}`, {
      method: 'DELETE'
    });
  },

  // ==========================================
  // IMAGE MANAGEMENT APIS
  // ==========================================

  // Get all images for a vehicle (GET /:id/images)
  getVehicleImages: async (vehicleId) => {
    return await apiRequest(`/${vehicleId}/images`, {
      method: 'GET'
    });
  },

  // Add or Update Image in vehicleImage Array - POST or PUT (POST/PUT /:id/images)
  addOrUpdateVehicleImage: async (vehicleId, imageData, method = 'POST') => {
    return await apiRequest(`/${vehicleId}/images`, {
      method: method.toUpperCase(),
      body: JSON.stringify(imageData)
    });
  },

  // Delete specific image by imageId (DELETE /:id/images/:imageId)
  deleteVehicleImage: async (vehicleId, imageId) => {
    return await apiRequest(`/${vehicleId}/images/${imageId}`, {
      method: 'DELETE'
    });
  },

  // ==========================================
  // FIELD-SPECIFIC MODIFIERS (PATCH APIs)
  // ==========================================

  // Update Model Name specifically (PATCH /:id/model-name)
  updateModelName: async (vehicleId, vehicleModelName) => {
    return await apiRequest(`/${vehicleId}/model-name`, {
      method: 'PATCH',
      body: JSON.stringify({ vehicleModelName })
    });
  },

  // Update Year Model specifically (PATCH /:id/year-model)
  updateYearModel: async (vehicleId, vehicleYearModel) => {
    return await apiRequest(`/${vehicleId}/year-model`, {
      method: 'PATCH',
      body: JSON.stringify({ vehicleYearModel })
    });
  },

  // Update Vehicle Status specifically (PATCH /:id/status)
  updateStatus: async (vehicleId, status) => {
    return await apiRequest(`/${vehicleId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }
};