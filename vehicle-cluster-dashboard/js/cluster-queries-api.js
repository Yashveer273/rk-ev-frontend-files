(function () {
  const { request } = window.ClusterAPI;

  window.ClusterQueryAPI = {
    async getClusters(filterParams = {}) {
      const queryParts = Object.entries(filterParams)
        .filter(([_, value]) => value !== undefined && value !== null && value !== "")
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);

      const queryString = queryParts.length ? `?${queryParts.join("&")}` : "";
      return request("GET", queryString, null, { "x-user-role": "super-admin" });
    },

    async getClusterById(id) {
      if (!id) throw new Error("Cluster ID or Owner ID is required.");
      return request("GET", `/${encodeURIComponent(id)}`, null, { "x-user-role": "super-admin" });
    },

    async getClustersByKycStatus() {
      return request("GET", "/kyc-status", null, { "x-user-role": "super-admin" });
    }
  };
})();