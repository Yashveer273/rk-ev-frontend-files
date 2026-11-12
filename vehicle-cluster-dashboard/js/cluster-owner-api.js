/* ==========================================================
   CLUSTER OWNER API CLIENT (KYC & AUTH INTEGRATION)
   File Path: js/cluster-owner-api.js
   ========================================================== */

(function () {
  const { request } = window.ClusterAPI;

  // 1. Login ke time jo ID store hui thi, use authenticate karne ke liye fetch karna
  const getActiveOwnerId = () => {
    return localStorage.getItem("currentClusterOwnerId") || window.APP_CONFIG?.VEHICLE_CLUSTER_OWNER_ID || "";
  };

  const getOwnerHeaders = () => ({
    "x-user-role": "cluster-owner",
    "x-owner-id": getActiveOwnerId()
  });

  window.ClusterOwnerAPI = {
    // Get Owned Cluster Information
    async getOwnedCluster() {
      return request("GET", "/mine", null, getOwnerHeaders());
    },

    // NEW: Get KYC Status & Details (Calls router.get('/:id/kyc'))
    async getKycStatus() {
  const clusterId = localStorage.getItem("currentClusterOwnerId") || window.APP_CONFIG?.VEHICLE_CLUSTER_OWNER_ID;
  if (!clusterId) throw new Error("Cluster Owner ID is missing from local storage.");
  return request("GET", `/${encodeURIComponent(clusterId)}/kyc`, null, {
    "x-user-role": "cluster-owner",
    "x-owner-id": clusterId
  });
},

    // Submit or Resubmit KYC Details (Calls router.put('/:id/submit-kyc'))
    async submitKyc(data) {
      const clusterId = getActiveOwnerId();
      if (!clusterId) throw new Error("Cluster Owner ID is missing from local storage. Please login again.");
      return request("PUT", `/${encodeURIComponent(clusterId)}/submit-kyc`, data, getOwnerHeaders());
    },

    async addVehicleOperator(data) {
      const clusterId = getActiveOwnerId();
      if (!clusterId) throw new Error("Cluster Owner ID is missing from local storage. Please login again.");
      return request("POST", `/${encodeURIComponent(clusterId)}/operators`, data, getOwnerHeaders());
    },

    async getVehicleOperators() {
      const clusterId = getActiveOwnerId();
      if (!clusterId) throw new Error("Cluster Owner ID is missing from local storage. Please login again.");
      return request("GET", `/${encodeURIComponent(clusterId)}/operators`, null, getOwnerHeaders());
    },

    async deleteVehicleOperator(operatorRecordId) {
      if (!operatorRecordId) throw new Error("Operator record ID is required.");
      const clusterId = getActiveOwnerId();
      if (!clusterId) throw new Error("Cluster Owner ID is missing from local storage. Please login again.");
      return request("DELETE", `/${encodeURIComponent(clusterId)}/operators/${encodeURIComponent(operatorRecordId)}`, null, getOwnerHeaders());
    }
  };
})();