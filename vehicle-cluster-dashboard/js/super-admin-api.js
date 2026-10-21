(function () {
  const { request } = window.ClusterAPI;
  const $ = (id) => document.getElementById(id);

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

  async function updateOwnerDetails(vehicleClusterOwnerId, data) {
    if (!vehicleClusterOwnerId) throw new Error("Vehicle Cluster Owner ID is required.");
    return request(
      "PUT",
      `/${encodeURIComponent(vehicleClusterOwnerId)}/owner-details`,
      {
        ownerName: data.ownerName || "",
        pan: data.pan || "",
        email: data.email || "",
        image: data.image || "",
        status: data.status || undefined
      },
      { "x-user-role": "super-admin" }
    );
  }

  async function verifyKyc(targetId, kycStatus) {
    if (!["Verified", "Rejected"].includes(kycStatus)) {
      throw new Error("kycStatus must be either Verified or Rejected");
    }
    return request(
      "PUT",
      `/${encodeURIComponent(targetId)}/kyc-verify/${encodeURIComponent(targetId)}`,
      { kycStatus },
      { "x-user-role": "super-admin" }
    );
  }

  async function deleteCluster(id) {
    if (!id) throw new Error("Cluster ID is required.");
    return request("DELETE", `/${encodeURIComponent(id)}`, null, { "x-user-role": "super-admin" });
  }

  // Form Builders & Handlers
  function buildCreatePayload(formData) {
    return {
      vehicleClusterLocation: {
        lat: Number(formData.lat),
        long: Number(formData.long),
        zipCode: formData.zipCode,
        state: formData.state,
        city: formData.city,
        streetAddress: formData.streetAddress
      },
      vehicleCapacity: Number(formData.vehicleCapacity || 0),
      vehicleClusterOwnerName: formData.vehicleClusterOwnerName,
      vehicleClusterDetails: {
        ownerName: formData.ownerName || formData.vehicleClusterOwnerName || "",
        pan: formData.pan || "",
        email: formData.email || "",
        image: formData.image || ""
      }
    };
  }

  async function handleCreateForm(form) {
    const formData = Object.fromEntries(new FormData(form).entries());
    return createCluster(buildCreatePayload(formData));
  }

  async function handleCapacityForm(form) {
    const formData = Object.fromEntries(new FormData(form).entries());
    const ownerId = formData.vehicleClusterOwnerId || window.APP_CONFIG.VEHICLE_CLUSTER_OWNER_ID;
    return updateCapacity(ownerId, formData.vehicleCapacity);
  }

  async function handleLocationForm(form) {
    const formData = Object.fromEntries(new FormData(form).entries());
    const ownerId = formData.vehicleClusterOwnerId || window.APP_CONFIG.VEHICLE_CLUSTER_OWNER_ID;
    return updateLocation(ownerId, formData);
  }

  async function handleOwnerDetailsForm(form) {
    const formData = Object.fromEntries(new FormData(form).entries());
    const ownerId = formData.vehicleClusterOwnerId || window.APP_CONFIG.VEHICLE_CLUSTER_OWNER_ID;
    return updateOwnerDetails(ownerId, formData);
  }

  window.SuperAdminAPI = {
    createCluster,
    updateCapacity,
    updateLocation,
    updateOwnerDetails,
    verifyKyc,
    deleteCluster,
    buildCreatePayload,
    handleCreateForm,
    handleCapacityForm,
    handleLocationForm,
    handleOwnerDetailsForm
  };
})();