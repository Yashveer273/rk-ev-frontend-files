window.APP_CONFIG = {
  API_BASE_URL: "http://localhost:5002/api/clusters",

  // MongoDB document _id
  ACTIVE_CLUSTER_ID: "",

  // Role:
  // "super-admin"
  // "cluster-owner"
  USER_ROLE: "super-admin",

  // Backend के कुछ existing routes vehicleClusterOwnerId मांगते हैं।
  // Create cluster के बाद यह value response से automatically store की जा सकती है।
  VEHICLE_CLUSTER_OWNER_ID: ""
};