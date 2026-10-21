(function () {
  const { request, getClusterId } = window.ClusterAPI;

  const getOwnerHeaders = () => ({
    "x-user-role": window.APP_CONFIG?.USER_ROLE || "cluster-owner",
    "x-owner-id": window.APP_CONFIG?.VEHICLE_CLUSTER_OWNER_ID || ""
  });

  window.ClusterOwnerAPI = {
    async getOwnedCluster() {
      return request("GET", "/mine", null, { ...getOwnerHeaders(), "x-user-role": "cluster-owner" });
    },

    async submitKyc(data) {
      return request("PUT", `/${getClusterId()}/submit-kyc`, data, getOwnerHeaders());
    },

    async addVehicleOperator(data) {
      return request("POST", `/${getClusterId()}/operators`, data, getOwnerHeaders());
    },

    async getVehicleOperators() {
      return request("GET", `/${getClusterId()}/operators`, null, getOwnerHeaders());
    },

    async deleteVehicleOperator(operatorRecordId) {
      if (!operatorRecordId) throw new Error("Operator record ID is required.");
      return request("DELETE", `/${getClusterId()}/operators/${encodeURIComponent(operatorRecordId)}`, null, getOwnerHeaders());
    }
  };
})();