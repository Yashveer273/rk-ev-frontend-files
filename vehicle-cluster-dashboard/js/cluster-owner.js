(function () {
  async function submitKyc(aadhaar) {
    if (!aadhaar) {
      throw new Error(
        "Aadhaar is required."
      );
    }

    return ClusterAPI.submitKyc({
      aadhaar: String(aadhaar).trim()
    });
  }

  async function addVehicleOperator(data) {
    const payload = {
      vehicleId:
        data.vehicleId?.trim() || undefined,

      investorId:
        data.investorId?.trim() || "",

      operatorId:
        data.operatorId?.trim() || "",

      startDate:
        data.startDate || "",

      endDate:
        data.endDate || "",

      service: {
        startDate:
          data.service?.startDate || "",

        endDate:
          data.service?.endDate || "",

        status:
          data.service?.status || "Pending",

        operatorPaymentAmount:
          data.service?.operatorPaymentAmount === ""
            ? undefined
            : Number(
                data.service?.operatorPaymentAmount || 0
              ),

        investorPaymentAmount:
          data.service?.investorPaymentAmount === ""
            ? undefined
            : Number(
                data.service?.investorPaymentAmount || 0
              )
      }
    };

    return ClusterAPI.addVehicleOperator(
      payload
    );
  }

  async function getVehicleOperators() {
    return ClusterAPI.getVehicleOperators();
  }

  async function deleteVehicleOperator(
    operatorRecordId
  ) {
    if (!operatorRecordId) {
      throw new Error(
        "Operator record ID is required."
      );
    }

    return ClusterAPI.deleteVehicleOperator(
      operatorRecordId
    );
  }

  function buildOperatorPayload(formData) {
    return {
      vehicleId:
        formData.vehicleId || "",

      investorId:
        formData.investorId || "",

      operatorId:
        formData.operatorId || "",

      startDate:
        formData.startDate || "",

      endDate:
        formData.endDate || "",

      service: {
        startDate:
          formData.serviceStartDate || "",

        endDate:
          formData.serviceEndDate || "",

        status:
          formData.serviceStatus || "Pending",

        operatorPaymentAmount:
          Number(
            formData.operatorPaymentAmount || 0
          ),

        investorPaymentAmount:
          Number(
            formData.investorPaymentAmount || 0
          )
      }
    };
  }

  async function handleOperatorForm(form) {
    const formData = Object.fromEntries(
      new FormData(form).entries()
    );

    const payload =
      buildOperatorPayload(formData);

    return addVehicleOperator(payload);
  }

  async function handleKycForm(form) {
    const formData = Object.fromEntries(
      new FormData(form).entries()
    );

    return submitKyc(
      formData.aadhaar
    );
  }

  window.ClusterOwner = {
    submitKyc,
    addVehicleOperator,
    getVehicleOperators,
    deleteVehicleOperator,

    buildOperatorPayload,

    handleOperatorForm,
    handleKycForm
  };
})();