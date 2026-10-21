/* ==========================================================
   CLUSTER OWNER & OPERATOR ACTIONS & TABLE RENDER LOGIC
   File Path: js/js2/owner-actions.js
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const $ = (id) => document.getElementById(id);
  const config = ClusterConfig.getConfig();

  // Prefill configuration details on owner pages
  const ownerId = config.VEHICLE_CLUSTER_OWNER_ID || "";
  const clusterId = config.ACTIVE_CLUSTER_ID || "";

  if ($("ownerIdDisplay")) {
    $("ownerIdDisplay").textContent = ownerId || "Not configured";
  }

  document.querySelectorAll("[data-cluster-id]").forEach((el) => {
    el.textContent = clusterId || "Not configured";
  });

  if ($("clusterOwnerOwnerId") && ownerId) {
    $("clusterOwnerOwnerId").value = ownerId;
  }

  /* ----------------------------------------------------------
     1. CLUSTER OWNER PROFILE DETAILS FORM
     ---------------------------------------------------------- */
  const ownerForm = $("clusterOwnerOwnerForm");
  if (ownerForm) {
    ownerForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      const message = $("clusterOwnerOwnerMessage");
      if (message) message.innerHTML = "";

      try {
        const formData = Object.fromEntries(new FormData(ownerForm).entries());
        await ClusterOwnerAPI.submitKyc(formData); // or update handler
        if (message) {
          message.innerHTML = `<div class="alert alert-success">Owner details updated successfully.</div>`;
        }
      } catch (error) {
        if (message) {
          message.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        }
      }
    });
  }

  /* ----------------------------------------------------------
     2. SUBMIT KYC FORM
     ---------------------------------------------------------- */
  const kycForm = $("kycForm");
  if (kycForm) {
    kycForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      const message = $("kycMessage");
      if (message) message.innerHTML = "";

      try {
        const formData = Object.fromEntries(new FormData(kycForm).entries());
        await ClusterOwnerAPI.submitKyc(formData);

        if (message) {
          message.innerHTML = `
            <div class="alert alert-success">
              KYC submitted successfully. Status is now set to Pending.
            </div>
          `;
        }
        kycForm.reset();
      } catch (error) {
        if (message) {
          message.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        }
      }
    });
  }

  /* ----------------------------------------------------------
     3. ADD VEHICLE OPERATOR FORM
     ---------------------------------------------------------- */
  const operatorForm = $("operatorForm");
  if (operatorForm) {
    operatorForm.addEventListener("submit", async function (event) {
      event.preventDefault();
      const message = $("operatorMessage");
      if (message) message.innerHTML = "";

      try {
        const formData = Object.fromEntries(new FormData(operatorForm).entries());
        await ClusterOwnerAPI.addVehicleOperator(formData);

        if (message) {
          message.innerHTML = `<div class="alert alert-success">Vehicle operator added successfully.</div>`;
        }
        operatorForm.reset();
        loadOperatorsTable();
      } catch (error) {
        if (message) {
          message.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        }
      }
    });
  }

  /* ----------------------------------------------------------
     4. RENDER & LOAD OPERATORS TABLE
     ---------------------------------------------------------- */
  async function loadOperatorsTable() {
    const tbody = $("operatorRows");
    if (!tbody) return;

    try {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">Loading operators...</td></tr>`;
      
      const response = await ClusterOwnerAPI.getVehicleOperators();
      const operators = response?.data || response?.operators || [];

      if (!operators.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No vehicle operators assigned yet.</td></tr>`;
        return;
      }

      tbody.innerHTML = operators.map((op) => `
        <tr>
          <td><strong>${op.vehicleId || "-"}</strong></td>
          <td>${op.investorId || "-"}</td>
          <td>${op.operatorId || "-"}</td>
          <td>${op.startDate ? op.startDate.substring(0, 10) : "-"}</td>
          <td>${op.endDate ? op.endDate.substring(0, 10) : "-"}</td>
          <td>₹${Number(op.operatorPaymentAmount || 0).toFixed(2)}</td>
          <td>
            <button type="button" class="btn btn-sm btn-outline-danger delete-operator-btn" data-id="${op._id || op.recordId}">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>
      `).join("");

      // Attach Delete Event Listeners
      document.querySelectorAll(".delete-operator-btn").forEach((btn) => {
        btn.addEventListener("click", async function () {
          const recordId = this.getAttribute("data-id");
          if (confirm("Are you sure you want to remove this operator?")) {
            try {
              await ClusterOwnerAPI.deleteVehicleOperator(recordId);
              loadOperatorsTable();
            } catch (err) {
              alert("Failed to delete operator: " + err.message);
            }
          }
        });
      });

    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-danger">Failed to load operators: ${error.message}</td></tr>`;
    }
  }

  // Initial load if table exists on page
  if ($("operatorRows")) {
    loadOperatorsTable();
  }

  if ($("refreshOperatorsButton")) {
    $("refreshOperatorsButton").addEventListener("click", loadOperatorsTable);
  }
});