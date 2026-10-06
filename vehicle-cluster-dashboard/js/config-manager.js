
(function () {
  const STORAGE_KEY = "vehicle_cluster_dashboard_config";

  function getConfig() {
    const baseConfig = {
      API_BASE_URL:
        window.APP_CONFIG?.API_BASE_URL ||
        "http://localhost:5000/api/vehicle-clusters",

      ACTIVE_CLUSTER_ID:
        window.APP_CONFIG?.ACTIVE_CLUSTER_ID || "",

      USER_ROLE:
        window.APP_CONFIG?.USER_ROLE || "super-admin",

      VEHICLE_CLUSTER_OWNER_ID:
        window.APP_CONFIG?.VEHICLE_CLUSTER_OWNER_ID || ""
    };

    try {
      const stored = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "{}"
      );

      return {
        ...baseConfig,
        ...stored
      };
    } catch (error) {
      return baseConfig;
    }
  }

  function saveConfig(config) {
    const current = getConfig();

    const updated = {
      ...current,
      ...config
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated)
    );

    window.APP_CONFIG = {
      ...window.APP_CONFIG,
      ...updated
    };

    return updated;
  }

  function setClusterFromCreateResponse(response) {
    const cluster = response?.data;

    if (!cluster) {
      throw new Error(
        "Cluster creation response does not contain cluster data."
      );
    }

    const mongoId = cluster._id;
    const ownerId = cluster.vehicleClusterOwnerId;

    if (!mongoId) {
      throw new Error(
        "MongoDB cluster _id was not returned by backend."
      );
    }

    saveConfig({
      ACTIVE_CLUSTER_ID: mongoId,
      VEHICLE_CLUSTER_OWNER_ID: ownerId || ""
    });

    return cluster;
  }

  function clearCluster() {
    saveConfig({
      ACTIVE_CLUSTER_ID: "",
      VEHICLE_CLUSTER_OWNER_ID: ""
    });
  }

  window.ClusterConfig = {
    getConfig,
    saveConfig,
    setClusterFromCreateResponse,
    clearCluster
  };
})();