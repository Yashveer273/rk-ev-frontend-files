(function () {
  function initializeRole() {
    const role =
      window.APP_CONFIG?.USER_ROLE;

    const superAdminSection =
      document.getElementById(
        "superAdminSection"
      );

    const clusterOwnerSection =
      document.getElementById(
        "clusterOwnerSection"
      );

    if (superAdminSection) {
      superAdminSection.style.display =
        role === "super-admin"
          ? ""
          : "none";
    }

    if (clusterOwnerSection) {
      clusterOwnerSection.style.display =
        role === "cluster-owner"
          ? ""
          : "none";
    }

    const roleElements =
      document.querySelectorAll(
        "[data-dashboard-role]"
      );

    roleElements.forEach((element) => {
      const requiredRole =
        element.getAttribute(
          "data-dashboard-role"
        );

      element.style.display =
        requiredRole === role
          ? ""
          : "none";
    });

    const roleLabels =
      document.querySelectorAll(
        "[data-user-role]"
      );

    roleLabels.forEach((element) => {
      element.textContent = role;
    });

    const clusterLabels =
      document.querySelectorAll(
        "[data-cluster-id]"
      );

    clusterLabels.forEach((element) => {
      element.textContent =
        window.APP_CONFIG
          ?.ACTIVE_CLUSTER_ID || "Not configured";
    });
  }

  function validateConfiguration() {
    const config =
      ClusterConfig.getConfig();

    if (!config.USER_ROLE) {
      throw new Error(
        "USER_ROLE is not configured."
      );
    }

    if (
      ![
        "super-admin",
        "cluster-owner"
      ].includes(config.USER_ROLE)
    ) {
      throw new Error(
        "Invalid USER_ROLE."
      );
    }

    if (
      config.USER_ROLE ===
        "cluster-owner" &&
      !config.ACTIVE_CLUSTER_ID
    ) {
      throw new Error(
        "ACTIVE_CLUSTER_ID is required for Cluster Owner."
      );
    }

    return config;
  }

  document.addEventListener(
    "DOMContentLoaded",
    () => {
      try {
        validateConfiguration();
        initializeRole();
      } catch (error) {
        console.error(error);

        const errorBox =
          document.getElementById(
            "configurationError"
          );

        if (errorBox) {
          errorBox.textContent =
            error.message;
          errorBox.style.display = "";
        }
      }
    }
  );

  window.ClusterDashboard = {
    initializeRole,
    validateConfiguration
  };
})();