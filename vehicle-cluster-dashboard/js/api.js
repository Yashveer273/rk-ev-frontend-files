(function () {
  const request = async (method, path = "", body = null, headers = {}) => {
    const options = {
      method,
      headers: {
        Accept: "application/json",
        "x-user-role": window.APP_CONFIG.USER_ROLE,
        ...headers
      }
    };

    if (body !== null && body !== undefined) {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }

    const response = await fetch(
      `${window.APP_CONFIG.API_BASE_URL}${path}`,
      options
    );

    let data = {};

    try {
      data = await response.json();
    } catch (error) {
      data = {};
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          `Request failed with status ${response.status}`
      );
    }

    return data;
  };

  const clusterId = () => {
    const id = window.APP_CONFIG.ACTIVE_CLUSTER_ID;

    if (!id) {
      throw new Error("ACTIVE_CLUSTER_ID is not configured.");
    }

    return encodeURIComponent(id);
  };

  const ownerId = () => {
    const id = window.APP_CONFIG.VEHICLE_CLUSTER_OWNER_ID;

    if (!id) {
      throw new Error(
        "VEHICLE_CLUSTER_OWNER_ID is not configured for this operation."
      );
    }

    return encodeURIComponent(id);
  };

  window.ClusterAPI = {
    request,

    createCluster: (data) =>
      request("POST", "/create", data, {
        "x-user-role": "super-admin"
      }),

    updateCapacity: (vehicleClusterOwnerId, vehicleCapacity) =>
      request(
        "PUT",
        `/${encodeURIComponent(vehicleClusterOwnerId)}/capacity`,
        {
          vehicleCapacity
        },
        {
          "x-user-role": "super-admin"
        }
      ),

    updateLocation: (vehicleClusterOwnerId, vehicleClusterLocation) =>
      request(
        "PUT",
        `/${encodeURIComponent(vehicleClusterOwnerId)}/location`,
        {
          vehicleClusterLocation
        },
        {
          "x-user-role": "super-admin"
        }
      ),

    updateOwnerDetails: (vehicleClusterOwnerId, data) =>
      request(
        "PUT",
        `/${encodeURIComponent(vehicleClusterOwnerId)}/owner-details`,
        data,
        {
          "x-user-role": window.APP_CONFIG.USER_ROLE
        }
      ),

    submitKyc: (data) =>
      request(
        `PUT`,
        `/${clusterId()}/submit-kyc`,
        data,
        {
          "x-user-role": "cluster-owner",
          "x-owner-id":
            window.APP_CONFIG.VEHICLE_CLUSTER_OWNER_ID || ""
        }
      ),

    verifyKyc: (kycStatus) =>
      request(
        "PUT",
        `/${clusterId()}/kyc-verify/${clusterId()}`,
        {
          kycStatus
        },
        {
          "x-user-role": "super-admin"
        }
      ),

    addVehicleOperator: (data) =>
      request(
        "POST",
        `/${clusterId()}/operators`,
        data,
        {
          "x-user-role": window.APP_CONFIG.USER_ROLE,
          "x-owner-id":
            window.APP_CONFIG.VEHICLE_CLUSTER_OWNER_ID || ""
        }
      ),

    getVehicleOperators: () =>
      request(
        "GET",
        `/${clusterId()}/operators`,
        null,
        {
          "x-user-role": window.APP_CONFIG.USER_ROLE,
          "x-owner-id":
            window.APP_CONFIG.VEHICLE_CLUSTER_OWNER_ID || ""
        }
      ),

    deleteVehicleOperator: (operatorRecordId) =>
      request(
        "DELETE",
        `/${clusterId()}/operators/${encodeURIComponent(
          operatorRecordId
        )}`,
        null,
        {
          "x-user-role": window.APP_CONFIG.USER_ROLE,
          "x-owner-id":
            window.APP_CONFIG.VEHICLE_CLUSTER_OWNER_ID || ""
        }
      )
  };
})();