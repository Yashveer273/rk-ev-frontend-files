(function () {
  const $ = (id) =>
    document.getElementById(id);

  const esc =
    window.ClusterUtils?.esc ||
    ((value) => String(value ?? ""));

  function renderOperators(
    operators,
    targetId = "operatorRows"
  ) {
    const target = $(targetId);

    if (!target) {
      return;
    }

    if (!operators.length) {
      target.innerHTML = `
        <tr>
          <td
            colspan="8"
            class="text-center py-4"
          >
            No vehicle operators found.
          </td>
        </tr>
      `;

      return;
    }

    target.innerHTML =
      operators
        .map(
          (operator) => `
            <tr>
              <td>
                ${esc(
                  operator.vehicleId ||
                    "Auto Generated"
                )}
              </td>

              <td>
                ${esc(
                  operator.investorId ||
                    "—"
                )}
              </td>

              <td>
                ${esc(
                  operator.operatorId ||
                    "—"
                )}
              </td>

              <td>
                ${esc(
                  operator.startDate ||
                    "—"
                )}
              </td>

              <td>
                ${esc(
                  operator.endDate ||
                    "—"
                )}
              </td>

              <td>
                ${esc(
                  operator.service
                    ?.status ||
                    "Pending"
                )}
              </td>

              <td>
                ${esc(
                  operator.service
                    ?.operatorPaymentAmount ??
                    "—"
                )}
              </td>

              <td>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger"
                  data-delete-operator="${esc(
                    operator._id
                  )}"
                >
                  Delete
                </button>
              </td>
            </tr>
          `
        )
        .join("");
  }

  async function loadOperators(
    targetId = "operatorRows"
  ) {
    try {
      const response =
        await ClusterOwner.getVehicleOperators();

      const operators =
        response.data || [];

      renderOperators(
        operators,
        targetId
      );

      return operators;
    } catch (error) {
      const target = $(targetId);

      if (target) {
        target.innerHTML = `
          <tr>
            <td
              colspan="8"
              class="text-center text-danger py-4"
            >
              ${esc(error.message)}
            </td>
          </tr>
        `;
      }

      throw error;
    }
  }

  async function deleteOperator(
    operatorRecordId,
    targetId = "operatorRows"
  ) {
    const confirmed =
      window.confirm(
        "Delete this vehicle operator record?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await ClusterOwner.deleteVehicleOperator(
        operatorRecordId
      );

      await loadOperators(
        targetId
      );
    } catch (error) {
      alert(error.message);
    }
  }

  document.addEventListener(
    "click",
    (event) => {
      const button =
        event.target.closest(
          "[data-delete-operator]"
        );

      if (!button) {
        return;
      }

      deleteOperator(
        button.getAttribute(
          "data-delete-operator"
        )
      );
    }
  );

  window.OperatorList = {
    renderOperators,
    loadOperators,
    deleteOperator
  };
})();