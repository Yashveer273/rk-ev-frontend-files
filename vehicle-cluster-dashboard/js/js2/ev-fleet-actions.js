/* ==========================================================
   EV FLEET ACTIONS & API HANDLER (13-COLUMN PERFECT ALIGNMENT)
   File Path: js/js2/ev-fleet-actions.js
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const $ = (id) => document.getElementById(id);

  let currentPage = 1;
  let currentLimit = 10;
  let totalPages = 1;

  const evTbody = $("evFleetTableRows");
  const evSearchInput = $("evSearchInput");
  const evStatusFilter = $("evStatusFilter");
  const evLimitSelect = $("evLimitSelect");
  const evSearchBtn = $("evSearchBtn");
  const evRefreshBtn = $("evRefreshBtn");
  const paginationInfo = $("paginationInfo");
  const paginationControls = $("paginationControls");

  const createVehicleForm = $("createVehicleForm");
  const editVehicleForm = $("editVehicleForm");

  // Helper: Copy Vehicle ID cleanly without borders
  window.copyToClipboard = function (text, btnElement) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showCopyFeedback(btnElement);
      }).catch(() => fallbackCopy(text, btnElement));
    } else {
      fallbackCopy(text, btnElement);
    }
  };

  function fallbackCopy(text, btnElement) {
    const input = document.createElement("input");
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
    showCopyFeedback(btnElement);
  }

  function showCopyFeedback(btnElement) {
    if (!btnElement) return;
    const originalHtml = btnElement.innerHTML;
    btnElement.innerHTML = `<i class="bi bi-check2 text-success"></i>`;
    setTimeout(() => {
      btnElement.innerHTML = originalHtml;
    }, 1500);
  }

  // 1. Fetch & Render Table (Exactly 13 <td> matching 13 <th> columns)
  async function fetchAndRenderEVs(page = 1) {
    if (!evTbody) return;

    try {
      currentPage = page;
      evTbody.innerHTML = `<tr><td colspan="13" class="text-center py-5 text-muted"><span class="spinner-border spinner-border-sm me-2"></span>Fetching Fleet Records...</td></tr>`;

      const filterParams = {
        page: currentPage,
        limit: currentLimit
      };

      if (evSearchInput && evSearchInput.value.trim()) {
        filterParams.search = evSearchInput.value.trim();
      }
      if (evStatusFilter && evStatusFilter.value) {
        filterParams.status = evStatusFilter.value;
      }

      const response = await window.EVFleetService.searchVehicles(filterParams);
      const vehicles = response?.data || [];
      const totalRecords = response?.total || 0;
      totalPages = response?.totalPages || 1;

      if (!Array.isArray(vehicles) || vehicles.length === 0) {
        evTbody.innerHTML = `<tr><td colspan="13" class="text-center py-5 text-muted">No electric vehicles found.</td></tr>`;
        if (paginationInfo) paginationInfo.textContent = "Showing 0 of 0 records";
        if (paginationControls) paginationControls.innerHTML = "";
        return;
      }

      evTbody.innerHTML = vehicles.map((vehicle) => {
        const vehicleId = vehicle.vehicleId || "-";
        const plate = vehicle.vehicleNoPlate || "-";
        const company = vehicle.companyData?.companyName || "N/A";
        const model = vehicle.vehicleModelName || "-";
        const year = vehicle.vehicleYearModel || "-";
        const battery = vehicle.batteryCapacityKwh ? `${vehicle.batteryCapacityKwh} kWh` : "-";
        const range = vehicle.rangeKm ? `${vehicle.rangeKm} KM` : "-";
        const price = vehicle.pricing?.purchasePrice ? `₹${Number(vehicle.pricing.purchasePrice).toLocaleString('en-IN')}` : "-";
        const location = vehicle.companyData?.purchaseLocation || "Main Hub";
        const status = vehicle.status || "Active";

        let badgeStyle = "bg-secondary text-white";
        if (status === 'Active') badgeStyle = "bg-dark text-white";
        else if (status === 'In Parking') badgeStyle = "bg-warning text-dark";
        else if (status === 'In-service') badgeStyle = "bg-secondary text-white";
        else if (status === 'Non-active') badgeStyle = "bg-danger text-white";

        return `
          <tr>
            <!-- 1. Vehicle ID -->
            <td class="ps-3 border-end">
              <div class="d-inline-flex align-items-center gap-1">
                <span class="font-monospace fw-semibold text-dark truncate-cell" title="${vehicleId}">${vehicleId}</span>
                <button class="btn btn-sm btn-link text-secondary p-0 btn-copy border-0 shadow-none" onclick="copyToClipboard('${vehicleId}', this)" title="Copy ID">
                  <i class="bi bi-copy fs-6"></i>
                </button>
              </div>
            </td>

            <!-- 2. Number Plate -->
            <td class="border-end">
              <span class="badge bg-light text-dark border font-monospace px-2 py-1">${plate}</span>
            </td>

            <!-- 3. Gallery / Media -->
            <td class="border-end">
              <button class="btn btn-sm btn-outline-dark px-2 py-1" onclick="openVehicleImageModal('${vehicleId}', '${plate}')" title="Media Gallery">
                <i class="bi bi-images me-1"></i> Gallery
              </button>
            </td>

            <!-- 4. Manufacturer -->
            <td class="border-end">
              <span class="fw-semibold text-dark truncate-cell d-block" title="${company}">${company}</span>
            </td>

            <!-- 5. Model Name -->
            <td class="border-end">
              <span class="fw-semibold text-dark truncate-cell d-block" title="${model}">${model}</span>
            </td>

            <!-- 6. Year -->
            <td class="border-end">
              <span class="badge bg-light text-dark border">${year}</span>
            </td>

            <!-- 7. Battery Capacity -->
            <td class="border-end">
              <span class="text-dark"><i class="bi bi-battery-charging me-1 text-dark"></i>${battery}</span>
            </td>

            <!-- 8. Max Range -->
            <td class="border-end">
              <span class="text-secondary"><i class="bi bi-speedometer2 me-1"></i>${range}</span>
            </td>

            <!-- 9. Purchase Price -->
            <td class="border-end">
              <span class="fw-bold text-dark">${price}</span>
            </td>

            <!-- 10. Hub / Location -->
            <td class="border-end">
              <span class="text-muted truncate-cell d-block" title="${location}"><i class="bi bi-geo-alt me-1"></i>${location}</span>
            </td>

            <!-- 11. Operational Status -->
            <td class="border-end">
              <select onchange="handleEvStatusChange('${vehicleId}', this.value)" class="form-select form-select-sm ${badgeStyle} fw-medium border-0 shadow-none">
                <option value="Active" ${status === 'Active' ? 'selected' : ''}>Active</option>
                <option value="In Parking" ${status === 'In Parking' ? 'selected' : ''}>In Parking</option>
                <option value="In-service" ${status === 'In-service' ? 'selected' : ''}>In-service</option>
                <option value="Non-active" ${status === 'Non-active' ? 'selected' : ''}>Inactive</option>
              </select>
            </td>

            <!-- 12. Edit Record -->
            <td class="border-end">
              <button class="btn btn-sm btn-outline-dark px-2 py-1" onclick="openEditVehicleModal('${vehicleId}')" title="Edit Record">
                <i class="bi bi-pencil me-1"></i> Edit
              </button>
            </td>

            <!-- 13. Delete Asset -->
            <td class="text-end pe-3">
              <button class="btn btn-sm btn-outline-danger px-2 py-1" onclick="handleEvDelete('${vehicleId}')" title="Delete Asset">
                <i class="bi bi-trash me-1"></i> Delete
              </button>
            </td>
          </tr>
        `;
      }).join("");

      renderPagination(totalRecords);

    } catch (error) {
      evTbody.innerHTML = `<tr><td colspan="13" class="text-center py-5 text-danger">Error fetching EV database: ${error.message}</td></tr>`;
    }
  }

  function renderPagination(totalRecords) {
    if (paginationInfo) {
      const start = (currentPage - 1) * currentLimit + 1;
      const end = Math.min(currentPage * currentLimit, totalRecords);
      paginationInfo.textContent = `Showing ${start}-${end} of ${totalRecords} records (Page ${currentPage} of ${totalPages})`;
    }

    if (!paginationControls) return;

    let buttonsHtml = '';

    buttonsHtml += `
      <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <button class="page-link" onclick="changePage(${currentPage - 1})">Previous</button>
      </li>
    `;

    for (let i = 1; i <= totalPages; i++) {
      buttonsHtml += `
        <li class="page-item ${i === currentPage ? 'active' : ''}">
          <button class="page-link" onclick="changePage(${i})">${i}</button>
        </li>
      `;
    }

    buttonsHtml += `
      <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <button class="page-link" onclick="changePage(${currentPage + 1})">Next</button>
      </li>
    `;

    paginationControls.innerHTML = buttonsHtml;
  }

  window.changePage = function (newPage) {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchAndRenderEVs(newPage);
    }
  };

  // 2. Edit Vehicle Modal Handler
  window.openEditVehicleModal = async function (vehicleId) {
    try {
      const response = await window.EVFleetService.getVehicleById(vehicleId);
      const vehicle = response.data;

      $("editVehicleId").value = vehicle.vehicleId;
      $("editNoPlate").value = vehicle.vehicleNoPlate || "";
      $("editModelName").value = vehicle.vehicleModelName || "";
      $("editYearModel").value = vehicle.vehicleYearModel || "";
      $("editCompanyName").value = vehicle.companyData?.companyName || "";
      $("editPurchaseLocation").value = vehicle.companyData?.purchaseLocation || ""; // <-- Added here
      $("editBatteryCapacity").value = vehicle.batteryCapacityKwh || "";
      $("editRangeKm").value = vehicle.rangeKm || "";
      $("editPurchasePrice").value = vehicle.pricing?.purchasePrice || "";
      $("editStatus").value = vehicle.status || "Active";

      const modalEl = $("editVehicleModal");
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    } catch (err) {
      alert("Failed to load vehicle details: " + err.message);
    }
  };

  if (editVehicleForm) {
    editVehicleForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const vehicleId = $("editVehicleId").value;

      const updatePayload = {
        vehicleNoPlate: $("editNoPlate").value.trim(),
        vehicleModelName: $("editModelName").value.trim(),
        vehicleYearModel: Number($("editYearModel").value),
        batteryCapacityKwh: Number($("editBatteryCapacity").value) || 0,
        rangeKm: Number($("editRangeKm").value) || 0,
        companyData: {
          companyName: $("editCompanyName").value.trim(),
          purchaseLocation: $("editPurchaseLocation").value.trim() // <-- Added here
        },
        pricing: {
          purchasePrice: Number($("editPurchasePrice").value) || 0
        },
        status: $("editStatus").value
      };

      try {
        await window.EVFleetService.updateVehicle(vehicleId, updatePayload, 'PUT');
        alert("Vehicle updated successfully!");
        bootstrap.Modal.getInstance($("editVehicleModal")).hide();
        fetchAndRenderEVs(currentPage);
      } catch (err) {
        alert("Failed to update vehicle: " + err.message);
      }
    });
  }

  // 3. Image Slider Modal Handler
  window.openVehicleImageModal = async function (vehicleId, plateNo) {
    $("modalVehiclePlate").textContent = plateNo;
    $("targetModalVehicleId").value = vehicleId;

    const modalEl = $("evImageModal");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    await renderImageSlider(vehicleId);
  };

  async function renderImageSlider(vehicleId) {
    const carouselContainer = $("evImageCarouselContainer");
    if (!carouselContainer) return;

    try {
      carouselContainer.innerHTML = `<div class="text-center py-4 text-muted"><span class="spinner-border spinner-border-sm me-2"></span>Loading Media...</div>`;

      const response = await window.EVFleetService.getVehicleImages(vehicleId);
      const images = response?.data || [];

      if (!Array.isArray(images) || images.length === 0) {
        carouselContainer.innerHTML = `<div class="alert alert-light text-center border mb-0">No images found. Please add an image URL below.</div>`;
        return;
      }

      let indicatorsHtml = '';
      let itemsHtml = '';

      images.forEach((img, index) => {
        const activeClass = index === 0 ? 'active' : '';
        const imageId = img.imageId || img._id;
        const imageUrl = img.imgurl || img.imageUrl || '';
        const angleName = img.angle || `Angle ${index + 1}`;

        indicatorsHtml += `<button type="button" data-bs-target="#evCarouselSlider" data-bs-slide-to="${index}" class="${activeClass}"></button>`;

        itemsHtml += `
          <div class="carousel-item ${activeClass}">
            <div class="card bg-dark text-white border-0">
              <img src="${imageUrl}" class="d-block w-100 rounded" style="height: 320px; object-fit: cover;" alt="${angleName}" onerror="this.src='https://via.placeholder.com/600x300?text=Invalid+Image+URL'">
              <div class="carousel-caption d-flex justify-content-between align-items-center bg-dark bg-opacity-75 p-2 rounded-bottom">
                <div>
                  <span class="badge bg-light text-dark fw-bold">${angleName}</span>
                  <small class="ms-2 font-monospace text-muted">ID: ${imageId}</small>
                </div>
                <button class="btn btn-sm btn-danger px-2 py-1" onclick="handleDeleteVehicleImage('${vehicleId}', '${imageId}')">
                  <i class="bi bi-trash-fill"></i> Delete
                </button>
              </div>
            </div>
          </div>
        `;
      });

      carouselContainer.innerHTML = `
        <div id="evCarouselSlider" class="carousel slide shadow rounded" data-bs-ride="carousel">
          <div class="carousel-indicators">${indicatorsHtml}</div>
          <div class="carousel-inner">${itemsHtml}</div>
          <button class="carousel-control-prev" type="button" data-bs-target="#evCarouselSlider" data-bs-slide="prev">
            <span class="carousel-control-prev-icon"></span>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#evCarouselSlider" data-bs-slide="next">
            <span class="carousel-control-next-icon"></span>
          </button>
        </div>
      `;
    } catch (err) {
      carouselContainer.innerHTML = `<div class="alert alert-danger">Failed to load media: ${err.message}</div>`;
    }
  }

  window.handleAddVehicleImage = async function (event) {
    event.preventDefault();
    const vehicleId = $("targetModalVehicleId").value;
    const angle = $("newImageAngle").value.trim();
    const imgurl = $("newImageUrl").value.trim();

    try {
      await window.EVFleetService.addOrUpdateVehicleImage(vehicleId, { angle, imgurl }, 'POST');
      $("newImageAngle").value = "";
      $("newImageUrl").value = "";
      await renderImageSlider(vehicleId);
    } catch (err) {
      alert("Failed to add image: " + err.message);
    }
  };

  window.handleDeleteVehicleImage = async function (vehicleId, imageId) {
    if (confirm(`Are you sure you want to delete image ID: ${imageId}?`)) {
      try {
        await window.EVFleetService.deleteVehicleImage(vehicleId, imageId);
        await renderImageSlider(vehicleId);
      } catch (err) {
        alert("Failed to delete image: " + err.message);
      }
    }
  };

  // 4. Status Modifier & Delete Asset Handlers
  window.handleEvStatusChange = async function (vehicleId, newStatus) {
    try {
      await window.EVFleetService.updateStatus(vehicleId, newStatus);
      fetchAndRenderEVs(currentPage);
    } catch (err) {
      alert("Failed to update status: " + err.message);
      fetchAndRenderEVs(currentPage);
    }
  };

  window.handleEvDelete = async function (vehicleId) {
    if (confirm(`Are you sure you want to delete vehicle ID: ${vehicleId}?`)) {
      try {
        await window.EVFleetService.deleteVehicle(vehicleId);
        fetchAndRenderEVs(currentPage);
      } catch (err) {
        alert("Failed to delete vehicle: " + err.message);
      }
    }
  };

  // 5. Create Vehicle Form Listener
  if (createVehicleForm) {
    createVehicleForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const getVal = (id, isNumber = false, defaultValue = "") => {
        const el = document.getElementById(id);
        if (!el) return defaultValue;
        const val = el.value.trim();
        return isNumber ? (Number(val) || 0) : val;
      };

      const payload = {
        vehicleServiceNo: getVal("createVehicleServiceNo", true, 0),
        vehicleNoPlate: getVal("createVehicleNoPlate"),
        vehicleType: getVal("createVehicleType", false, "2-Wheeler"),
        vehicleModelName: getVal("createVehicleModelName"),
        vehicleYearModel: getVal("createVehicleYearModel", true, 2026),
        vehicleMotorPowerKw: getVal("createMotorPower", true),
        batteryCapacityKwh: getVal("createBatteryCapacity", true),
        rangeKm: getVal("createRangeKm", true),
        topSpeedKmph: getVal("createTopSpeed", true),
        companyData: {
          companyName: getVal("createCompanyName"),
          purchaseLocation: getVal("createPurchaseLocation")
        },
        pricing: {
          purchasePrice: getVal("createPurchasePrice", true)
        },
        status: getVal("createStatus", false, "Active")
      };

      try {
        const response = await window.EVFleetService.createVehicle(payload);
        if (response.success) {
          alert("Vehicle Registered Successfully!");
          window.location.href = "ev-fleet.html";
        }
      } catch (err) {
        alert("Registration Failed: " + err.message);
      }
    });
  }

  // Global Listeners
  if (evSearchBtn) evSearchBtn.addEventListener("click", () => fetchAndRenderEVs(1));
  if (evRefreshBtn) evRefreshBtn.addEventListener("click", () => {
    if (evSearchInput) evSearchInput.value = "";
    if (evStatusFilter) evStatusFilter.value = "";
    fetchAndRenderEVs(1);
  });
  if (evLimitSelect) evLimitSelect.addEventListener("change", function () {
    currentLimit = Number(this.value);
    fetchAndRenderEVs(1);
  });

  if (evTbody) fetchAndRenderEVs(1);
});