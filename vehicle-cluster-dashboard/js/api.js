(function () {
  const request = async (method, path = "", body = null, headers = {}) => {
    const options = {
      method,
      headers: {
        Accept: "application/json",
        "x-user-role": window.APP_CONFIG?.USER_ROLE || "super-admin",
        ...headers
      }
    };

    if (body !== null && body !== undefined) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }

    const baseUrl = window.APP_CONFIG?.API_BASE_URL || "http://localhost:5000/api/clusters";
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

  window.ClusterAPI = { request, getClusterId, getOwnerId };
})();