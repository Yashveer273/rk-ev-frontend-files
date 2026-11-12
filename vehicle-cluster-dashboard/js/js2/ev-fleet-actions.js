/* ==========================================================
   EV FLEET ACTIONS & API HANDLER (With Cluster & History Support)
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
  const evMinInvestment = $("evMinInvestment");
  const evMinOutboundRate = $("evMinOutboundRate");
  const evLimitSelect = $("evLimitSelect");
  const evSearchBtn = $("evSearchBtn");
  const evRefreshBtn = $("evRefreshBtn");
  const paginationInfo = $("paginationInfo");
  const paginationControls = $("paginationControls");

  const createVehicleForm = $("createVehicleForm");
  const editVehicleForm = $("editVehicleForm");

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
    setTimeout(() => { btnElement.innerHTML = originalHtml; }, 1500);
  }

  // Handle Search / Fetch Cluster History Action (Future API Trigger)
  window.handleSearchClusterHistory = function (historyReferenceId, vehicleId) {
    console.log(`[API Trigger] Fetching cluster history for Vehicle ID: ${vehicleId}, HistoryRefId: ${historyReferenceId}`);
    alert(`[Future API Call] Fetching Cluster History for Ref ID: ${historyReferenceId}`);
    // Future API logic here:
    // fetch(`/api/cluster-server/history/${historyReferenceId}`).then(...)
  };

  // Handle Delete / Unlink Cluster History Action
  window.handleDeleteClusterHistory = async function (vehicleId, historyReferenceId) {
    if (confirm(`Are you sure you want to unlink history reference ID (${historyReferenceId}) from Vehicle: ${vehicleId}?`)) {
      try {
        // API call to delete history link reference
        const res = await fetch(`/api/ev-clusters/history-link/${vehicleId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          alert("Cluster history reference unlinked successfully!");
          fetchAndRenderEVs(currentPage);
        } else {
          alert("Failed to unlink: " + data.error);
        }
      } catch (err) {
        alert("Error unlinking history reference: " + err.message);
      }
    }
  };

  // Fetch & Render Fleet Table (18 Columns including Cluster & History Ref)
  async function fetchAndRenderEVs(page = 1) {
    if (!evTbody) return;

    try {
      currentPage = page;
      evTbody.innerHTML = `<tr><td colspan="18" class="text-center py-5 text-muted"><span class="spinner-border spinner-border-sm me-2"></span>Fetching Fleet Records...</td></tr>`;

      const filterParams = {
        page: currentPage,
        limit: currentLimit
      };

      if (evSearchInput && evSearchInput.value.trim()) filterParams.search = evSearchInput.value.trim();
      if (evStatusFilter && evStatusFilter.value) filterParams.status = evStatusFilter.value;
      if (evMinInvestment && evMinInvestment.value) filterParams.minInvestment = evMinInvestment.value;
      if (evMinOutboundRate && evMinOutboundRate.value) filterParams.minOutboundRentalRate = evMinOutboundRate.value;

      const response = await window.EVFleetService.searchVehicles(filterParams);
      const vehicles = response?.data || [];
      const totalRecords = response?.total || 0;
      totalPages = response?.totalPages || 1;

      if (!Array.isArray(vehicles) || vehicles.length === 0) {
        evTbody.innerHTML = `<tr><td colspan="18" class="text-center py-5 text-muted">No electric vehicles found matching your criteria.</td></tr>`;
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
        
        const price = vehicle.pricing?.purchasePrice !== undefined ? `₹${Number(vehicle.pricing.purchasePrice).toLocaleString('en-IN')}` : "-";
        const investment = vehicle.pricing?.investmentAmount !== undefined ? `₹${Number(vehicle.pricing.investmentAmount).toLocaleString('en-IN')}` : "₹0";
        const investorReturn = vehicle.pricing?.vendorRentalCost !== undefined ? `₹${Number(vehicle.pricing.vendorRentalCost).toLocaleString('en-IN')}` : "₹0";
        const outboundRate = vehicle.pricing?.outboundRentalRate !== undefined ? `₹${Number(vehicle.pricing.outboundRentalRate).toLocaleString('en-IN')}` : "₹0";

        // Active Cluster Object Data
        const clusterId = vehicle.associateCluster?.clusterId || null;
        const assignedAt = vehicle.associateCluster?.assignedAt ? new Date(vehicle.associateCluster.assignedAt).toLocaleDateString() : null;

        // Cluster History Reference ID (String)
        const historyRefId = vehicle.clusterAssociationHistory || null;

        const location = vehicle.companyData?.purchaseLocation || "-";
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;

        const status = vehicle.status || "Non-active";

        let badgeStyle = "bg-secondary text-white";
        if (status === 'Active') badgeStyle = "bg-dark text-white";
        else if (status === 'In Parking') badgeStyle = "bg-warning text-dark";
        else if (status === 'In-service') badgeStyle = "bg-secondary text-white";
        else if (status === 'Non-active') badgeStyle = "bg-danger text-white";

        return `
          <tr>
            <!-- 1. Vehicle ID with Copy Button -->
            <td class="ps-3 border-end">
              <div class="d-inline-flex align-items-center gap-1">
                <span class="font-monospace fw-semibold text-dark truncate-cell" title="${vehicleId}">${vehicleId}</span>
                <button class="btn btn-sm btn-link text-secondary p-0 btn-copy border-0 shadow-none" onclick="copyToClipboard('${vehicleId}', this)" title="Copy Vehicle ID">
                  <i class="bi bi-copy fs-6"></i>
                </button>
              </div>
            </td>

            <!-- 2. Number Plate with Copy Button -->
            <td class="border-end">
              <div class="d-inline-flex align-items-center gap-1">
                <span class="badge bg-light text-dark border font-monospace px-2 py-1">${plate}</span>
                <button class="btn btn-sm btn-link text-secondary p-0 btn-copy border-0 shadow-none" onclick="copyToClipboard('${plate}', this)" title="Copy Number Plate">
                  <i class="bi bi-copy fs-6"></i>
                </button>
              </div>
            </td>

            <td class="border-end">
              <button class="btn btn-sm btn-outline-dark px-2 py-1" onclick="openVehicleImageModal('${vehicleId}', '${plate}')" title="Media Gallery">
                <i class="bi bi-images me-1"></i> Gallery
              </button>
            </td>
            <td class="border-end"><span class="fw-semibold text-dark truncate-cell d-block" title="${company}">${company}</span></td>
            <td class="border-end"><span class="fw-semibold text-dark truncate-cell d-block" title="${model}">${model}</span></td>
            <td class="border-end"><span class="badge bg-light text-dark border">${year}</span></td>
            <td class="border-end"><span class="text-dark"><i class="bi bi-battery-charging me-1"></i>${battery}</span></td>
            <td class="border-end"><span class="text-secondary"><i class="bi bi-speedometer2 me-1"></i>${range}</span></td>
            <td class="border-end"><span class="text-dark fw-medium">${price}</span></td>
            <td class="border-end"><span class="text-primary fw-bold">${investment}</span></td>
            <td class="border-end"><span class="text-secondary">${investorReturn}</span></td>
            <td class="border-end"><span class="text-success fw-bold">${outboundRate}</span></td>
            
            <!-- NEW FIELD 1: Active Cluster (with Copy Button) -->
            <td class="border-end">
              ${clusterId ? `
                <div class="d-flex flex-column gap-1">
                  <div class="d-inline-flex align-items-center gap-1">
                    <span class="badge bg-dark text-white font-monospace" title="${clusterId}">${clusterId}</span>
                    <button class="btn btn-sm btn-link text-secondary p-0 btn-copy border-0 shadow-none" onclick="copyToClipboard('${clusterId}', this)" title="Copy Active Cluster ID">
                      <i class="bi bi-copy fs-6"></i>
                    </button>
                  </div>
                  ${assignedAt ? `<small class="text-muted" style="font-size: 0.7rem;"><i class="bi bi-calendar-event me-1"></i>${assignedAt}</small>` : ''}
                </div>
              ` : `<span class="badge bg-light text-muted border">Not Assigned</span>`}
            </td>

            <!-- NEW FIELD 2: Cluster History Ref ID (with Copy, Search & Delete Actions) -->
            <td class="border-end">
              ${historyRefId ? `
                <div class="d-inline-flex align-items-center gap-1">
                  <span class="font-monospace text-primary fw-medium small" title="${historyRefId}">${historyRefId}</span>
                  <!-- Copy Button -->
                  <button class="btn btn-sm btn-link text-secondary p-0 btn-copy border-0 shadow-none" onclick="copyToClipboard('${historyRefId}', this)" title="Copy History Ref ID">
                    <i class="bi bi-copy fs-6"></i>
                  </button>
                  <!-- Search / Fetch History Icon Button -->
                  <button class="btn btn-sm btn-link text-dark p-0 btn-copy border-0 shadow-none ms-1" onclick="handleSearchClusterHistory('${historyRefId}', '${vehicleId}')" title="Fetch History Logs">
                    <i class="bi bi-search fs-6"></i>
                  </button>
                  <!-- Delete / Unlink History Icon Button -->
                  <button class="btn btn-sm btn-link text-danger p-0 btn-copy border-0 shadow-none ms-1" onclick="handleDeleteClusterHistory('${vehicleId}', '${historyRefId}')" title="Unlink History Reference">
                    <i class="bi bi-trash fs-6"></i>
                  </button>
                </div>
              ` : `<span class="badge bg-light text-muted border">No History Ref</span>`}
            </td>

            <!-- Purchase Location with Truncation (...) & Map Link Icon -->
            <td class="border-end">
              <div class="d-flex align-items-center justify-content-between gap-1">
                <span class="location-cell text-muted" title="${location}">
                  <i class="bi bi-geo-alt me-1 text-danger"></i>${location}
                </span>
                <a href="${mapUrl}" target="_blank" class="btn btn-sm btn-outline-secondary p-1 border-0" title="View on Google Maps">
                  <i class="bi bi-map-fill text-primary"></i>
                </a>
              </div>
            </td>

            <td class="border-end">
              <select onchange="handleEvStatusChange('${vehicleId}', this.value)" class="form-select form-select-sm ${badgeStyle} fw-medium border-0 shadow-none">
                <option value="Non-active" ${status === 'Non-active' ? 'selected' : ''}>Non-active</option>
                <option value="Active" ${status === 'Active' ? 'selected' : ''}>Active</option>
                <option value="In Parking" ${status === 'In Parking' ? 'selected' : ''}>In Parking</option>
                <option value="In-service" ${status === 'In-service' ? 'selected' : ''}>In-service</option>
              </select>
            </td>
            <td class="border-end">
              <button class="btn btn-sm btn-outline-dark px-2 py-1" onclick="openEditVehicleModal('${vehicleId}')" title="Edit Record">
                <i class="bi bi-pencil me-1"></i> Edit
              </button>
            </td>
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
      evTbody.innerHTML = `<tr><td colspan="18" class="text-center py-5 text-danger">Error fetching EV database: ${error.message}</td></tr>`;
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
    buttonsHtml += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}"><button class="page-link" onclick="changePage(${currentPage - 1})">Prev</button></li>`;
    for (let i = 1; i <= totalPages; i++) {
      buttonsHtml += `<li class="page-item ${i === currentPage ? 'active' : ''}"><button class="page-link" onclick="changePage(${i})">${i}</button></li>`;
    }
    buttonsHtml += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}"><button class="page-link" onclick="changePage(${currentPage + 1})">Next</button></li>`;

    paginationControls.innerHTML = buttonsHtml;
  }

  window.changePage = function (newPage) {
    if (newPage >= 1 && newPage <= totalPages) fetchAndRenderEVs(newPage);
  };

  // Edit Modal Handler
  window.openEditVehicleModal = async function (vehicleId) {
    try {
      const response = await window.EVFleetService.getVehicleById(vehicleId);
      const vehicle = response.data;

      $("editVehicleId").value = vehicle.vehicleId;
      $("editNoPlate").value = vehicle.vehicleNoPlate || "";
      $("editModelName").value = vehicle.vehicleModelName || "";
      $("editYearModel").value = vehicle.vehicleYearModel || "";
      $("editCompanyName").value = vehicle.companyData?.companyName || "";
      $("editPurchaseLocation").value = vehicle.companyData?.purchaseLocation || "";
      $("editBatteryCapacity").value = vehicle.batteryCapacityKwh || "";
      $("editRangeKm").value = vehicle.rangeKm || "";
      $("editPurchasePrice").value = vehicle.pricing?.purchasePrice || 0;
      $("editInvestmentAmount").value = vehicle.pricing?.investmentAmount || 0;
      $("editinvestorReturnRate").value = vehicle.pricing?.vendorRentalCost || 0;
      $("editOutboundRentalRate").value = vehicle.pricing?.outboundRentalRate || 0;
      $("editStatus").value = vehicle.status || "Non-active";

      new bootstrap.Modal($("editVehicleModal")).show();
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
          purchaseLocation: $("editPurchaseLocation").value.trim()
        },
        pricing: {
          purchasePrice: Number($("editPurchasePrice").value) || 0,
          investmentAmount: Number($("editInvestmentAmount").value) || 0,
          vendorRentalCost: Number($("editinvestorReturnRate").value) || 0,
          outboundRentalRate: Number($("editOutboundRentalRate").value) || 0
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

  // Image Slider Modal Handler
  window.openVehicleImageModal = async function (vehicleId, plateNo) {
    $("modalVehiclePlate").textContent = plateNo;
    $("targetModalVehicleId").value = vehicleId;
    new bootstrap.Modal($("evImageModal")).show();
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
              <img src="${imageUrl}" class="d-block w-100 rounded" style="height: 300px; object-fit: cover;" alt="${angleName}" onerror="this.src='https://via.placeholder.com/600x300?text=Invalid+Image+URL'">
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
          <button class="carousel-control-prev" type="button" data-bs-target="#evCarouselSlider" data-bs-slide="prev"><span class="carousel-control-prev-icon"></span></button>
          <button class="carousel-control-next" type="button" data-bs-target="#evCarouselSlider" data-bs-slide="next"><span class="carousel-control-next-icon"></span></button>
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
    if (confirm(`Delete image ID: ${imageId}?`)) {
      try {
        await window.EVFleetService.deleteVehicleImage(vehicleId, imageId);
        await renderImageSlider(vehicleId);
      } catch (err) {
        alert("Failed to delete image: " + err.message);
      }
    }
  };

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

  // Event Listeners for Search & Filters
  if (evSearchBtn) evSearchBtn.addEventListener("click", () => fetchAndRenderEVs(1));
  if (evRefreshBtn) evRefreshBtn.addEventListener("click", () => {
    if (evSearchInput) evSearchInput.value = "";
    if (evStatusFilter) evStatusFilter.value = "";
    if (evMinInvestment) evMinInvestment.value = "";
    if (evMinOutboundRate) evMinOutboundRate.value = "";
    fetchAndRenderEVs(1);
  });
  if (evLimitSelect) evLimitSelect.addEventListener("change", function () {
    currentLimit = Number(this.value);
    fetchAndRenderEVs(1);
  });

  if (evTbody) fetchAndRenderEVs(1);
});