(function () {
  // सेंट्रलाइज्ड बेस URLs (यहीं से पूरे ऐप में मैनेज होंगे)
  const BASE_URLS = {
    CLUSTERS: window.APP_CONFIG?.API_BASE_URL || "http://localhost:5000/api/clusters",
    VEHICLES: window.APP_CONFIG?.VEHICLE_API_BASE_URL || window.ENV?.API_BASE_URL || "http://localhost:5003/api/vehicles",
    CLUSTER_ASSOCIATION: window.APP_CONFIG?.CLUSTER_ASSOCIATION_URL || window.ENV?.CLUSTER_API_BASE_URL || "http://localhost:5003/api/evFleet-Cluster-Association"
  };

  // सुपर एडमिन एक्सेस हेडर
  const getSuperAdminHeaders = (customHeaders = {}) => ({
    Accept: "application/json",
    "x-user-role": window.APP_CONFIG?.USER_ROLE || "super-admin",
    ...customHeaders
  });

  const request = async (method, path = "", body = null, headers = {}, customBaseUrl = null) => {
    const options = {
      method,
      headers: getSuperAdminHeaders(headers)
    };

    if (body !== null && body !== undefined) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }

    const baseUrl = customBaseUrl || BASE_URLS.CLUSTERS;
    const response = await fetch(`${baseUrl}${path}`, options);

    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(
        data.message || data.error || `Request failed with status ${response.status}`
      );
    }

    return data;
  };

  const getClusterId = () => {
    const id = window.APP_CONFIG?.ACTIVE_CLUSTER_ID;
    if (!id) throw new Error("ACTIVE_CLUSTER_ID is not configured.");
    return encodeURIComponent(id);
  };

  const getOwnerId = () => {
    const id = window.APP_CONFIG?.VEHICLE_CLUSTER_OWNER_ID;
    if (!id) throw new Error("VEHICLE_CLUSTER_OWNER_ID is not configured.");
    return encodeURIComponent(id);
  };

  window.ClusterAPI = { 
    BASE_URLS, 
    getSuperAdminHeaders, 
    request, 
    getClusterId, 
    getOwnerId 
  };
})();