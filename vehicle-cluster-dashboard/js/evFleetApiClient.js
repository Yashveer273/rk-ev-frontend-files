/**
 * EV Fleet Management - Frontend API Client
 * Uses centralized BASE_URLS and Super Admin headers from api.js
 */

const getEnvConfig = () => {
  const apiConfig = (typeof window !== 'undefined' && window.ClusterAPI) || {};
  
  const baseUrl = apiConfig.BASE_URLS?.VEHICLES || 'http://localhost:5003/api/vehicles';
  const clusterApiBase = apiConfig.BASE_URLS?.CLUSTERS || 'http://localhost:5000/api/clusters';
  const associationApiBase = apiConfig.BASE_URLS?.CLUSTER_ASSOCIATION || 'http://localhost:5003/api/evFleet-Cluster-Association';
  const encryptionKey = "a8f3c9e2b4d1f6a8c5e7b9d2f4a6c8e1b3d5f7a9c2e4b6d8f1a3c5e7b9d2f4a6";

  return { baseUrl, clusterApiBase, associationApiBase, encryptionKey };
};

const encryptToken = (data) => {
  try {
    const { encryptionKey } = getEnvConfig();
    const jsonString = JSON.stringify({ data: data, timestamp: Date.now() });
    let encrypted = '';
    for (let i = 0; i < jsonString.length; i++) {
      const charCode = jsonString.charCodeAt(i) ^ encryptionKey.charCodeAt(i % encryptionKey.length);
      encrypted += String.fromCharCode(charCode);
    }
    return btoa(encrypted);
  } catch (error) {
    console.error('Encryption Error:', error);
    return '';
  }
};

const apiRequest = async (endpoint = '', options = {}, customBaseUrl = null) => {
  const { baseUrl } = getEnvConfig();
  const targetBase = customBaseUrl || baseUrl;
  const url = `${targetBase}${endpoint}`;

  const encryptedHeaderToken = encryptToken({ client: 'EV_Fleet_Frontend', status: 'authorized' });
  const baseHeaders = window.ClusterAPI?.getSuperAdminHeaders
    ? window.ClusterAPI.getSuperAdminHeaders()
    : { "x-user-role": "super-admin" };

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate',
    'x-api-encrypted-key': encryptedHeaderToken,
    ...baseHeaders,
    ...(options.headers || {})
  };

  const config = { ...options, headers };

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

window.EVFleetService = {
  
  createVehicle: async (vehicleData) => {
    return await apiRequest('/', {
      method: 'POST',
      body: JSON.stringify(vehicleData)
    });
  },

  searchVehicles: async (queryParams = {}) => {
    const cleanParams = {};
    
    cleanParams.page = queryParams.page || 1;
    cleanParams.limit = Math.min(30, Math.max(1, parseInt(queryParams.limit, 10) || 10));

    const allowedFilters = [
      'vehicleId', 'vehicleType', 'vehicleNoPlate', 'companyName', 
      'sellerName', 'purchaseLocation', 'acquisitionType', 'status', 
      'vehicleModelName', 'vehicleYearModel', 'vehicleMotorPowerKw', 
      'batteryCapacityKwh', 'rangeKm', 'topSpeedKmph', 'search',
      'investmentAmount', 'minInvestment', 'maxInvestment',
      'investorReturnRate', 'mininvestorReturnRate', 'maxinvestorReturnRate',
      'outboundRentalRate', 'minOutboundRentalRate', 'maxOutboundRentalRate'
    ];

    allowedFilters.forEach((key) => {
      const val = queryParams[key];
      if (val !== undefined && val !== null && val !== '') {
        cleanParams[key] = String(val);
      }
    });

    const searchParams = new URLSearchParams(cleanParams).toString();
    return await apiRequest(`/?${searchParams}`, { method: 'GET' });
  },

// Cluster Association & Cases API (Enforces max 30 vehicles per batch/page)
  getEvsByCases: async (queryParams = {}) => {
    const { associationApiBase } = getEnvConfig();

    const safeLimit = Math.min(50, Math.max(1, parseInt(queryParams.limit, 10) || 30));
    const safePage = Math.max(1, parseInt(queryParams.page, 10) || 1);

    const cleanParams = {
      page: safePage,
      limit: safeLimit
    };

    if (queryParams.type) cleanParams.type = queryParams.type.trim();
    if (queryParams.clusterId) cleanParams.clusterId = queryParams.clusterId.trim();
    if (queryParams.status) cleanParams.status = queryParams.status.trim();

    const searchParams = new URLSearchParams(cleanParams).toString();
    return await apiRequest(`/evs/filter-cases?${searchParams}`, { method: 'GET' }, associationApiBase);
  },

  // ==========================================
  // CLUSTER VEHICLE MANAGEMENT APIS (GET, POST, PUT, DELETE)
  // ==========================================

  getClusterVehicles: async (clusterId, page = 1, limit = 30, search = '') => {
    const { clusterApiBase } = getEnvConfig();
    if (!clusterId) throw new Error("Cluster ID is required.");

    const params = { page, limit };
    if (search && search.trim() !== '') {
      params.search = search.trim();
    }

    const queryParams = new URLSearchParams(params).toString();
    return await apiRequest(`/${encodeURIComponent(clusterId)}/vehicles?${queryParams}`, { method: 'GET' }, clusterApiBase);
  },

  assignVehiclesBulk: async (clusterId, vehicleIds) => {
    const { clusterApiBase } = getEnvConfig();
    if (!clusterId || !Array.isArray(vehicleIds) || vehicleIds.length === 0) {
      throw new Error("Cluster ID and vehicle IDs array are required.");
    }
    const vehiclesPayload = vehicleIds.map(id => ({ vehicleId: id }));
    return await apiRequest(`/${encodeURIComponent(clusterId)}/vehicles/bulk-assign`, {
      method: 'POST',
      body: JSON.stringify({ vehicles: vehiclesPayload })
    }, clusterApiBase);
  },

  updateAssignedVehicle: async (clusterId, vehicleId, updateData) => {
    const { clusterApiBase } = getEnvConfig();
    if (!clusterId || !vehicleId) throw new Error("Cluster ID and Vehicle ID are required.");
    return await apiRequest(`/${encodeURIComponent(clusterId)}/vehicles/${encodeURIComponent(vehicleId)}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    }, clusterApiBase);
  },

  removeVehicleFromCluster: async (clusterId, vehicleId) => {
    const { clusterApiBase } = getEnvConfig();
    if (!clusterId || !vehicleId) throw new Error("Cluster ID and Vehicle ID are required.");
    return await apiRequest(`/${encodeURIComponent(clusterId)}/vehicles/${encodeURIComponent(vehicleId)}`, {
      method: 'DELETE'
    }, clusterApiBase);
  },

  // ==========================================
  // EXISTING VEHICLE MANAGEMENT METHODS
  // ==========================================

  getVehicleById: async (vehicleId) => {
    return await apiRequest(`/${vehicleId}`, { method: 'GET' });
  },

  updateVehicle: async (vehicleId, updateData, method = 'PUT') => {
    return await apiRequest(`/${vehicleId}`, {
      method: method.toUpperCase(),
      body: JSON.stringify(updateData)
    });
  },

  deleteVehicle: async (vehicleId) => {
    return await apiRequest(`/${vehicleId}`, { method: 'DELETE' });
  },

  getVehicleImages: async (vehicleId) => {
    return await apiRequest(`/${vehicleId}/images`, { method: 'GET' });
  },

  addOrUpdateVehicleImage: async (vehicleId, imageData, method = 'POST') => {
    return await apiRequest(`/${vehicleId}/images`, {
      method: method.toUpperCase(),
      body: JSON.stringify(imageData)
    });
  },

  deleteVehicleImage: async (vehicleId, imageId) => {
    return await apiRequest(`/${vehicleId}/images/${imageId}`, { method: 'DELETE' });
  },

  updateModelName: async (vehicleId, vehicleModelName) => {
    return await apiRequest(`/${vehicleId}/model-name`, {
      method: 'PATCH',
      body: JSON.stringify({ vehicleModelName })
    });
  },

  updateYearModel: async (vehicleId, vehicleYearModel) => {
    return await apiRequest(`/${vehicleId}/year-model`, {
      method: 'PATCH',
      body: JSON.stringify({ vehicleYearModel })
    });
  },

  updateStatus: async (vehicleId, status) => {
    return await apiRequest(`/${vehicleId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }
};