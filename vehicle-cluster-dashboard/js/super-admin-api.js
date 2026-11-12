(function () {
  const { request } = window.ClusterAPI;

  async function createCluster(data) {
    try {
      const response = await request("POST", "/create", data, { "x-user-role": "super-admin" });
      const cluster = window.ClusterConfig.setClusterFromCreateResponse(response);
      return { response, cluster };
    } catch (error) {
      throw error;
    }
  }

  async function updateCapacity(vehicleClusterOwnerId, capacity) {
    if (!vehicleClusterOwnerId) throw new Error("Vehicle Cluster Owner ID is required.");
    const vehicleCapacity = Number(capacity);
    if (Number.isNaN(vehicleCapacity)) throw new Error("Vehicle capacity must be a valid number.");

    return request(
      "PUT",
      `/${encodeURIComponent(vehicleClusterOwnerId)}/capacity`,
      { vehicleCapacity },
      { "x-user-role": "super-admin" }
    );
  }

  async function updateLocation(vehicleClusterOwnerId, location) {
    if (!vehicleClusterOwnerId) throw new Error("Vehicle Cluster Owner ID is required.");
    return request(
      "PUT",
      `/${encodeURIComponent(vehicleClusterOwnerId)}/location`,
      {
        vehicleClusterLocation: {
          lat: Number(location.lat),
          long: Number(location.long),
          zipCode: location.zipCode,
          state: location.state,
          city: location.city,
          streetAddress: location.streetAddress
        }
      },
      { "x-user-role": "super-admin" }
    );
  }

  async function updateClusterDetails(vehicleClusterOwnerId, data) {
    if (!vehicleClusterOwnerId) throw new Error("Vehicle Cluster Owner ID is required.");
    
    const payload = {
      ownerName: data.ownerName || "",
      email: data.email || "",
      pan: data.pan || "",
      status: data.status || "Active",
      vehicleCapacity: data.vehicleCapacity !== undefined ? Number(data.vehicleCapacity) : undefined
    };

    if (data.password && data.password.trim() !== "") {
      payload.password = data.password.trim();
    }

    return request(
      "PUT",
      `/${encodeURIComponent(vehicleClusterOwnerId)}/owner-details`,
      payload,
      { "x-user-role": "super-admin" }
    );
  }

 async function verifyKyc(kycIdOrClusterId, kycStatus, rejectionReason = "") {
    if (!["Verified", "Rejected"].includes(kycStatus)) {
      throw new Error("kycStatus must be either Verified or Rejected");
    }
    return request(
      "PUT",
      `/admin/kyc-verify/${encodeURIComponent(kycIdOrClusterId)}/status`,
      { kycStatus, rejectionReason },
      { "x-user-role": "super-admin" }
    );
  }

  // Fetch categorized KYC requests with backend pagination
  async function getAllKycRequests(status = "Pending", page = 1, limit = 5) {
    return request("GET", `/admin/kyc-requests?status=${encodeURIComponent(status)}&page=${page}&limit=${limit}`, null, { "x-user-role": "super-admin" });
  }

  async function deleteCluster(id) {
    if (!id) throw new Error("Cluster ID is required.");
    return request("DELETE", `/${encodeURIComponent(id)}`, null, { "x-user-role": "super-admin" });
  }

  window.SuperAdminAPI = {
    createCluster,
    updateCapacity,
    updateLocation,
    updateClusterDetails,
    verifyKyc,
    getAllKycRequests,
    deleteCluster
  };
})();