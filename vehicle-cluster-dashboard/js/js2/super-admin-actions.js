/* ==========================================================
   SUPER ADMIN ACTIONS & FORM HANDLERS (FULL COMPLETE FILE)
   File Path: js/js2/super-admin-actions.js
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const $ = (id) => document.getElementById(id);

  /* ----------------------------------------------------------
     1. CREATE CLUSTER FORM SUBMISSION
     ---------------------------------------------------------- */
  const createForm = $("createClusterForm");
  if (createForm) {
    createForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      const message = $("createClusterMessage");
      if (message) message.innerHTML = "";

      try {
        const result = await SuperAdminAPI.handleCreateForm(createForm);
        const cluster = result.cluster || result.response?.data;

        if (message && cluster) {
          message.innerHTML = `
            <div class="alert alert-success">
              Cluster created successfully!<br>
              <strong>_ID:</strong> ${cluster._id || "N/A"}<br>
              <strong>Owner ID:</strong> ${cluster.vehicleClusterOwnerId || "N/A"}
            </div>
          `;
        }

        if (cluster) {
          if ($("superAdminClusterId")) $("superAdminClusterId").value = cluster._id || "";
          if ($("capacityOwnerId")) $("capacityOwnerId").value = cluster.vehicleClusterOwnerId || "";
          if ($("locationOwnerId")) $("locationOwnerId").value = cluster.vehicleClusterOwnerId || "";
          
          document.querySelectorAll("[data-cluster-id]").forEach((el) => {
            el.textContent = cluster._id || "Not configured";
          });
        }

        createForm.reset();
      } catch (error) {
        if (message) {
          message.innerHTML = `<div class="alert alert-danger">${error.message || "Failed to create cluster."}</div>`;
        }
      }
    });
  }

  /* ----------------------------------------------------------
     2. UPDATE CAPACITY FORM SUBMISSION
     ---------------------------------------------------------- */
  const capacityForm = $("capacityForm");
  if (capacityForm) {
    capacityForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      const message = $("capacityMessage");
      if (message) message.innerHTML = "";

      try {
        await SuperAdminAPI.handleCapacityForm(capacityForm);
        if (message) {
          message.innerHTML = `<div class="alert alert-success">Vehicle capacity updated successfully.</div>`;
        }
      } catch (error) {
        if (message) {
          message.innerHTML = `<div class="alert alert-danger">${error.message || "Failed to update capacity."}</div>`;
        }
      }
    });
  }

  /* ----------------------------------------------------------
     3. UPDATE LOCATION FORM SUBMISSION
     ---------------------------------------------------------- */
  const locationForm = $("locationForm");
  if (locationForm) {
    locationForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      const message = $("locationMessage");
      if (message) message.innerHTML = "";

      try {
        await SuperAdminAPI.handleLocationForm(locationForm);
        if (message) {
          message.innerHTML = `<div class="alert alert-success">Cluster location updated successfully.</div>`;
        }
      } catch (error) {
        if (message) {
          message.innerHTML = `<div class="alert alert-danger">${error.message || "Failed to update location."}</div>`;
        }
      }
    });
  }

  /* ----------------------------------------------------------
     4. KYC VERIFICATION ACTIONS (Verify / Reject)
     ---------------------------------------------------------- */
  async function handleKycVerification(status) {
    const message = $("kycVerificationMessage");
    const clusterIdInput = $("superAdminClusterId");
    if (!message || !clusterIdInput) return;

    message.innerHTML = "";
    const targetId = clusterIdInput.value.trim();

    if (!targetId) {
      message.innerHTML = `<div class="alert alert-danger">Please enter or configure a target Cluster ID.</div>`;
      return;
    }

    try {
      await SuperAdminAPI.verifyKyc(targetId, status);
      message.innerHTML = `
        <div class="alert alert-success">
          KYC status successfully updated to <strong>${status}</strong>.
        </div>
      `;
    } catch (error) {
      message.innerHTML = `<div class="alert alert-danger">${error.message || "Verification failed."}</div>`;
    }
  }

  if ($("verifyKycButton")) {
    $("verifyKycButton").addEventListener("click", () => handleKycVerification("Verified"));
  }

  if ($("rejectKycButton")) {
    $("rejectKycButton").addEventListener("click", () => handleKycVerification("Rejected"));
  }

  /* ----------------------------------------------------------
     5. CLUSTER LIST MANAGEMENT WITH IDs & COPY BUTTONS
     ---------------------------------------------------------- */
  const tbody = $("clusterTableRows");
  const searchInput = $("searchInput");
  const statusFilter = $("statusFilter");
  const searchBtn = $("searchBtn");
  const refreshBtn = $("refreshBtn");
  const paginationInfo = $("paginationInfo");
  const paginationControls = $("paginationControls");

  let currentPage = 1;
  const rowsPerPage = 5;
  let allClustersCache = [];
  let clusterIdToDelete = null;

  async function fetchAndRenderClusters() {
    if (!tbody) return;

    try {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">Loading clusters...</td></tr>`;

      const filterParams = {};
      if (searchInput && searchInput.value.trim()) {
        filterParams.city = searchInput.value.trim();
      }

      const response = await ClusterQueryAPI.getClusters(filterParams);
      allClustersCache = response?.data || response?.clusters || response || [];

      if (!Array.isArray(allClustersCache) || allClustersCache.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No vehicle clusters found.</td></tr>`;
        if (paginationInfo) paginationInfo.textContent = "Showing 0-0 of 0 clusters";
        if (paginationControls) paginationControls.innerHTML = "";
        return;
      }

      currentPage = 1;
      renderTablePage();

    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-danger">Error fetching clusters: ${error.message}</td></tr>`;
    }
  }

  function renderTablePage() {
    const totalItems = allClustersCache.length;
    const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = Math.min(startIdx + rowsPerPage, totalItems);
    const paginatedItems = allClustersCache.slice(startIdx, endIdx);

    tbody.innerHTML = paginatedItems.map((cluster) => {
      const mongoId = cluster._id || "-";
      const ownerId = cluster.vehicleClusterOwnerId || "-";
      const ownerName = cluster.vehicleClusterDetails?.ownerName || cluster.vehicleClusterOwnerName || "-";
      const ownerEmail = cluster.vehicleClusterDetails?.email || "-";
      const pan = cluster.vehicleClusterDetails?.pan || "-";
      
      const city = cluster.vehicleClusterLocation?.city || "-";
      const state = cluster.vehicleClusterLocation?.state || "-";
      const capacity = cluster.vehicleCapacity || 0;
      
      const clusterWorkingStatus = cluster.vehicleClusterDetails?.status || "Pending";
      const kycStatus = cluster.kyc?.kycStatus || "Pending";

      let formattedDate = "N/A";
      if (cluster.createdAt) {
        const d = new Date(cluster.createdAt);
        formattedDate = d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      const lat = cluster.vehicleClusterLocation?.lat;
      const long = cluster.vehicleClusterLocation?.long;

      let mapActionButton = `<span class="text-muted small">No Location</span>`;
      if (lat !== undefined && long !== undefined && lat !== null && long !== null) {
        const safeName = ownerName.replace(/'/g, "\\'");
        mapActionButton = `
          <button type="button" class="btn btn-sm btn-outline-danger px-2 py-1 fw-bold" onclick="openClusterMapPopup(${lat}, ${long}, '${safeName}', '${ownerId}', '${city}')">
            <i class="bi bi-geo-alt-fill"></i> View Location
          </button>
        `;
      }

      const actionsHtml = `
        <div class="d-flex justify-content-end gap-2 align-items-center">
          ${mapActionButton}
          <button type="button" class="btn btn-sm btn-outline-secondary text-danger px-2 py-1 fw-bold trigger-delete-btn" data-id="${mongoId}">
            <i class="bi bi-trash-fill"></i>
          </button>
        </div>
      `;

      return `
        <tr>
          <td>
            <div class="small">
              <span class="text-muted">Owner ID:</span> <strong>${ownerId}</strong> 
              <span class="copy-btn ms-1" onclick="copyToClipboard('${ownerId}', this)" title="Copy Owner ID"><i class="bi bi-clipboard"></i></span>
            </div>
            <div class="small mt-1">
              <span class="text-muted">MongoDB ID:</span> <span class="font-monospace">${mongoId.substring(mongoId.length - 8)}...</span>
              <span class="copy-btn ms-1" onclick="copyToClipboard('${mongoId}', this)" title="Copy Full ID"><i class="bi bi-clipboard"></i></span>
            </div>
          </td>
          <td>
            <div class="fw-bold"><i class="bi bi-person-fill text-primary"></i> ${ownerName}</div>
            <div class="small text-secondary"><i class="bi bi-envelope-fill"></i> ${ownerEmail}</div>
            <div class="small text-muted"><i class="bi bi-card-text"></i> PAN: ${pan}</div>
          </td>
          <td>
            <div><i class="bi bi-geo-alt-fill text-danger"></i> ${city}, ${state}</div>
          </td>
          <td><strong>${capacity}</strong> Vehicles</td>
          <td>
            <span class="badge bg-${clusterWorkingStatus === 'Active' || clusterWorkingStatus === 'Working' ? 'success' : 'warning'} text-dark">
              <i class="bi bi-activity"></i> ${clusterWorkingStatus}
            </span>
          </td>
          <td>
            <span class="badge bg-${kycStatus === 'Verified' ? 'success' : 'secondary'}">
              <i class="bi bi-shield-check"></i> ${kycStatus}
            </span>
          </td>
          <td><span class="small text-muted"><i class="bi bi-clock"></i> ${formattedDate}</span></td>
          <td class="text-end">${actionsHtml}</td>
        </tr>
      `;
    }).join("");

    document.querySelectorAll(".trigger-delete-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        clusterIdToDelete = this.getAttribute("data-id");
        const passwordInput = $("deleteAdminPasswordInput");
        const errorDiv = $("deletePasswordError");
        if (passwordInput) passwordInput.value = "";
        if (errorDiv) errorDiv.classList.add("d-none");

        const modalEl = $("deleteConfirmModal");
        if (modalEl) {
          const modal = new bootstrap.Modal(modalEl);
          modal.show();
        }
      });
    });

    if (paginationInfo) {
      paginationInfo.textContent = `Showing ${totalItems > 0 ? startIdx + 1 : 0}-${endIdx} of ${totalItems} clusters`;
    }

    if (paginationControls) {
      let pagesHtml = `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
          <a class="page-link" href="#" data-page="${currentPage - 1}">Prev</a>
        </li>
      `;

      for (let i = 1; i <= totalPages; i++) {
        pagesHtml += `
          <li class="page-item ${currentPage === i ? 'active' : ''}">
            <a class="page-link" href="#" data-page="${i}">${i}</a>
          </li>
        `;
      }

      pagesHtml += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
          <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
        </li>
      `;

      paginationControls.innerHTML = pagesHtml;

      paginationControls.querySelectorAll(".page-link").forEach((link) => {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          const targetPage = parseInt(this.getAttribute("data-page"));
          if (!isNaN(targetPage) && targetPage >= 1 && targetPage <= totalPages) {
            currentPage = targetPage;
            renderTablePage();
          }
        });
      });
    }
  }

  const confirmDeleteBtn = $("confirmDeleteSubmitBtn");
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", async function () {
      const passwordInput = $("deleteAdminPasswordInput");
      const errorDiv = $("deletePasswordError");
      const password = passwordInput ? passwordInput.value.trim() : "";

      if (password !== "1234") {
        if (errorDiv) errorDiv.classList.remove("d-none");
        return;
      }

      if (!clusterIdToDelete) return;

      try {
        confirmDeleteBtn.disabled = true;
        confirmDeleteBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Deleting...`;

        await SuperAdminAPI.deleteCluster(clusterIdToDelete);

        const modalEl = $("deleteConfirmModal");
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();

        fetchAndRenderClusters();

      } catch (error) {
        alert("Failed to delete cluster: " + error.message);
      } finally {
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.innerHTML = `<i class="bi bi-trash-fill"></i> Delete Cluster`;
      }
    });
  }

  if (tbody) {
    fetchAndRenderClusters();
  }

  if (searchBtn) searchBtn.addEventListener("click", fetchAndRenderClusters);
  if (refreshBtn) refreshBtn.addEventListener("click", fetchAndRenderClusters);
});