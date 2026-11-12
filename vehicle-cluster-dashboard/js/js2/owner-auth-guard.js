/* ==========================================================
   OWNER AUTHENTICATION & SECURITY GUARD
   File Path: js/js2/owner-auth-guard.js
   ========================================================== */

(function () {
  async function verifyOwnerAccessSession() {
    const ownerId = localStorage.getItem("currentClusterOwnerId") || sessionStorage.getItem("currentClusterOwnerId");
    
    // 1. अगर लोकल स्टोरेज में ओनर आईडी ही नहीं है, तो तुरंत इंडेक्स पेज पर भगाओ
    if (!ownerId) {
      window.location.href = "../index.html"; 
      return;
    }

    try {
      // 2. बैकएंड एपीआई से ओनर/क्लस्टर का ताजा डेटा मंगाकर चेक करो
      const response = await window.ClusterAPI.request("GET", `/${encodeURIComponent(ownerId)}`, null, {
        "x-owner-id": ownerId
      });

      const clusterData = response?.data || response;
      if (!clusterData) {
        throw new Error("Owner cluster session invalid.");
      }

      const accountStatus = clusterData.vehicleClusterDetails?.status;
      const kycStatus = clusterData.kyc?.kycStatus;

      // 3. अगर सुपर एडमिन ने अकाउंट Restricted या Rejected कर दिया है
      if (accountStatus === "Restricted" || accountStatus === "Rejected") {
        alert(`Your account access has been ${accountStatus.toLowerCase()} by Super Admin.`);
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = "../index.html";
        return;
      }

      // 4. पेज फ्लो रिस्ट्रिक्शन: अगर यूजर 'dashboard.html' (Cluster Info) या 'vehicle-operators.html' पर है,
      // और उसकी KYC अभी तक Verified नहीं हुई है, तो उसे सीधे KYC submission पर धकेलो।
      const currentPath = window.location.pathname;
      const isRestrictedWithoutKyc = currentPath.includes("dashboard.html") || currentPath.includes("vehicle-operators.html");
      
      if (isRestrictedWithoutKyc && (!kycStatus || kycStatus !== "Verified")) {
        alert("Please complete and get your KYC verified by Super Admin before accessing Cluster Info and Operators.");
        window.location.href = "kyc-submission.html";
        return;
      }

      // यूआई में डेटा बाइंड करना
      document.querySelectorAll("[data-cluster-id]").forEach(el => {
        el.textContent = clusterData._id || clusterData.vehicleClusterOwnerId || "-";
      });

      const ownerIdDisplay = document.getElementById("ownerIdDisplay");
      if (ownerIdDisplay) {
        ownerIdDisplay.textContent = clusterData.vehicleClusterOwnerId || "-";
      }

    } catch (error) {
      console.error("Auth Guard Security Error:", error);
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "../index.html";
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    verifyOwnerAccessSession();
  });
})();