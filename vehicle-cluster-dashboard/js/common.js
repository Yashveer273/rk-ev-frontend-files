(function () {
  window.ClusterUtils = {
    esc(value) {
      return String(value ?? "").replace(
        /[&<>'"]/g,
        (char) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;"
          })[char]
      );
    },

    badge(value) {
      const status = String(value || "").toLowerCase();

      if (
        status === "verified" ||
        status === "active" ||
        status === "completed"
      ) {
        return "badge-ok";
      }

      if (
        status === "rejected" ||
        status === "expired"
      ) {
        return "badge-bad";
      }

      return "badge-warn";
    },

    getRole() {
      return window.APP_CONFIG?.USER_ROLE || "";
    },

    getClusterId() {
      return window.APP_CONFIG?.ACTIVE_CLUSTER_ID || "";
    },

    isSuperAdmin() {
      return this.getRole() === "super-admin";
    },

    isClusterOwner() {
      return this.getRole() === "cluster-owner";
    },

    requireClusterId() {
      const id = this.getClusterId();

      if (!id) {
        throw new Error(
          "Please configure ACTIVE_CLUSTER_ID first."
        );
      }

      return id;
    },

    showMessage(elementId, message, type = "danger") {
      const element = document.getElementById(elementId);

      if (!element) {
        return;
      }

      element.innerHTML = `
        <div class="alert alert-${type}">
          ${this.esc(message)}
        </div>
      `;
    }
  };
})();