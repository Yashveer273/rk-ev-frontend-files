(function () {
  const $ = (id) => document.getElementById(id);

  async function createCluster(data) {
    try {
      const response = await ClusterAPI.createCluster(data);

      const cluster =
        ClusterConfig.setClusterFromCreateResponse(response);

      return {
        response,
        cluster
      };
    } catch (error) {
      throw error;
    }
  }

  async function updateCapacity(vehicleClusterOwnerId, capacity) {
    if (!vehicleClusterOwnerId) {
      throw new Error(
        "Vehicle Cluster Owner ID is required."
      );
    }

    const vehicleCapacity = Number(capacity);

    if (Number.isNaN(vehicleCapacity)) {
      throw new Error(
        "Vehicle capacity must be a valid number."
      );
    }

    return ClusterAPI.updateCapacity(
      vehicleClusterOwnerId,
      vehicleCapacity
    );
  }

  async function updateLocation(
    vehicleClusterOwnerId,
    location
  ) {
    if (!vehicleClusterOwnerId) {
      throw new Error(
        "Vehicle Cluster Owner ID is required."
      );
    }

    return ClusterAPI.updateLocation(
      vehicleClusterOwnerId,
      {
        lat: Number(location.lat),
        long: Number(location.long),
        zipCode: location.zipCode,
        state: location.state,
        city: location.city,
        streetAddress: location.streetAddress
      }
    );
  }

  async function updateOwnerDetails(
    vehicleClusterOwnerId,
    data
  ) {
    if (!vehicleClusterOwnerId) {
      throw new Error(
        "Vehicle Cluster Owner ID is required."
      );
    }

    return ClusterAPI.updateOwnerDetails(
      vehicleClusterOwnerId,
      {
        ownerName: data.ownerName || "",
        pan: data.pan || "",
        email: data.email || "",
        image: data.image || "",
        status: data.status || undefined
      }
    );
  }

  async function verifyKyc(status) {
    const validStatuses = [
      "Pending",
      "Verified",
      "Rejected"
    ];

    if (!validStatuses.includes(status)) {
      throw new Error(
        "Invalid KYC status."
      );
    }

    return ClusterAPI.verifyKyc(status);
  }

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

      vehicleCapacity: Number(
        formData.vehicleCapacity || 0
      ),

      vehicleClusterOwnerName:
        formData.vehicleClusterOwnerName,

      vehicleClusterDetails: {
        ownerName:
          formData.ownerName ||
          formData.vehicleClusterOwnerName ||
          "",

        pan: formData.pan || "",

        email: formData.email || "",

        image: formData.image || ""
      }
    };
  }

  async function handleCreateForm(form) {
    const formData = Object.fromEntries(
      new FormData(form).entries()
    );

    const payload =
      buildCreatePayload(formData);

    return createCluster(payload);
  }

  async function handleCapacityForm(form) {
    const formData = Object.fromEntries(
      new FormData(form).entries()
    );

    const ownerId =
      formData.vehicleClusterOwnerId ||
      window.APP_CONFIG.VEHICLE_CLUSTER_OWNER_ID;

    return updateCapacity(
      ownerId,
      formData.vehicleCapacity
    );
  }

  async function handleLocationForm(form) {
    const formData = Object.fromEntries(
      new FormData(form).entries()
    );

    const ownerId =
      formData.vehicleClusterOwnerId ||
      window.APP_CONFIG.VEHICLE_CLUSTER_OWNER_ID;

    return updateLocation(
      ownerId,
      {
        lat: formData.lat,
        long: formData.long,
        zipCode: formData.zipCode,
        state: formData.state,
        city: formData.city,
        streetAddress:
          formData.streetAddress
      }
    );
  }

  async function handleOwnerDetailsForm(form) {
    const formData = Object.fromEntries(
      new FormData(form).entries()
    );

    const ownerId =
      formData.vehicleClusterOwnerId ||
      window.APP_CONFIG.VEHICLE_CLUSTER_OWNER_ID;

    return updateOwnerDetails(
      ownerId,
      {
        ownerName: formData.ownerName,
        pan: formData.pan,
        email: formData.email,
        image: formData.image,
        status: formData.status
      }
    );
  }

  window.SuperAdmin = {
    createCluster,
    updateCapacity,
    updateLocation,
    updateOwnerDetails,
    verifyKyc,

    buildCreatePayload,

    handleCreateForm,
    handleCapacityForm,
    handleLocationForm,
    handleOwnerDetailsForm
  };
})();