# 🚗 Vehicle Cluster Frontend API Architecture

Yeh repository vehicle cluster management system ke frontend API calls aur state management ko handle karne ke liye banayi gayi hai. Iska main objective saare API routes ko modular, clean aur maintainable rakhte hue 500 lines ke limit ke andar alag-alag files mein divide karna hai.

---

## 📁 File Structure & Purpose Overview

Aapke project mein total **5 main JavaScript files** hain:

1. **`config-manager.js`**
   * **Purpose:** Iska kaam application ki dynamic settings (`API_BASE_URL`, `ACTIVE_CLUSTER_ID`, `USER_ROLE`, `VEHICLE_CLUSTER_OWNER_ID`) ko `localStorage` aur `window.APP_CONFIG` mein maintain aur persistent rakhna hai.
   * **Key Methods:** `getConfig()`, `saveConfig()`, `setClusterFromCreateResponse()`, `clearCluster()`.

2. **`api.js`**
   * **Purpose:** Yeh pure architecture ka **Central Core Network Engine** hai. Isme generic `fetch` wrapper hai jo har request ke saath sahi Headers (`Content-Type`, `x-user-role`, `x-owner-id`) attach karta hai aur network errors ko catch karta hai.
   * **Key Methods:** `request(method, path, body, headers)`, `getClusterId()`, `getOwnerId()`.

3. **`cluster-queries-api.js`**
   * **Purpose:** Yeh file saari **Read-Only / Search / Filter APIs** ko handle karti hai. Iska use Super Admin ya System dwara clusters ko query karne ke liye hota hai.

4. **`super-admin-api.js`**
   * **Purpose:** Yeh file **Super Admin Actions & Mutations** ke liye hai. Iska backend authorization `verifySuperAdmin` middleware se linked hai.

5. **`cluster-owner-api.js`**
   * **Purpose:** Yeh file **Cluster Owner & Manager Operations** ke liye hai. Iska backend authorization `verifyClusterOwner` middleware se linked hai.

---

## 🔗 Complete API Endpoints & Mapping

Humare backend (`clusterRoutes.js` aur `clusterController.js`) ki **sabhi 14 APIs** in teen specialized API files mein cover ki gayi hain:

### 1️⃣ Cluster Query APIs (`cluster-queries-api.js`)

| S.No. | HTTP Method | Endpoint Path | Function Name | Purpose / Description |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `GET` | `/` | `getClusters(filterParams)` | Multiple filters (city, state, zipCode, status, kycStatus, date range) ke aadhar par clusters fetch karna. |
| 2 | `GET` | `/:id` | `getClusterById(id)` | Kisi specific Cluster ki details uski MongoDB `_id` ya `vehicleClusterOwnerId` se laana. |
| 3 | `GET` | `/kyc-status` | `getClustersByKycStatus()` | Verified, Pending, aur Rejected status ke aadhar par clusters ke counts aur lists lana. |

---

### 2️⃣ Super Admin APIs (`super-admin-api.js`)

| S.No. | HTTP Method | Endpoint Path | Function Name | Purpose / Description |
| :--- | :--- | :--- | :--- | :--- |
| 4 | `POST` | `/create` | `createCluster(data)` | Naya cluster create karna. System auto `VCO-` owner ID aur `KYC-` ID generate karta hai. |
| 5 | `PUT` | `/:id/capacity` | `updateCapacity(ownerId, capacity)` | Cluster ki vehicle holding capacity ko update karna. |
| 6 | `PUT` | `/:id/location` | `updateLocation(ownerId, location)` | Cluster ka address, city, state, zipCode, aur Lat/Long update karna. |
| 7 | `PUT` | `/:id/owner-details` | `updateOwnerDetails(ownerId, data)` | Owner ka Name, PAN, Email, Image aur status update karna. |
| 8 | `PUT` | `/:id/kyc-verify/:clusterId` | `verifyKyc(targetId, kycStatus)` | Owner ki KYC status ko `Verified` ya `Rejected` mark karna. |
| 9 | `DELETE` | `/:id` | `deleteCluster(id)` | Database se cluster aur uska associated record delete karna. |

---

### 3️⃣ Cluster Owner APIs (`cluster-owner-api.js`)

| S.No. | HTTP Method | Endpoint Path | Function Name | Purpose / Description |
| :--- | :--- | :--- | :--- | :--- |
| 10 | `GET` | `/mine` | `getOwnedCluster()` | Login owner ki `x-owner-id` header ke aadhar par uska khudka cluster fetch karna. |
| 11 | `PUT` | `/:clusterId/submit-kyc` | `submitKyc(data)` | Owner dwara identity details submit karna (status 'Pending' set ho jata hai). |
| 12 | `POST` | `/:clusterId/operators` | `addVehicleOperator(data)` | Cluster mein naya Vehicle Operator add karna (auto-generated `EV-` vehicleId ke saath). |
| 13 | `GET` | `/:clusterId/operators` | `getVehicleOperators()` | Cluster ke saare vehicle operators ki list fetch karna. |
| 14 | `DELETE` | `/:clusterId/operators/:operatorRecordId` | `deleteVehicleOperator(recordId)` | Cluster se kisi specific vehicle operator record ko remove karna. |

---

## ⚙️ How Authentication & Middleware works

Backend mein do middlewares hain (`authMiddleware.js`):
1. **`verifySuperAdmin`**: Request mein `x-user-role: super-admin` header hona mandatory hai.
2. **`verifyClusterOwner`**: Request mein `x-user-role: cluster-owner` (ya `super-admin`) aur `x-owner-id` headers hona mandatory hai.

Humari `api.js` file yeh headers automatically `window.APP_CONFIG` se pick karke har request mein attach kar deti hai.

---

## 🚀 Correct Script Loading Order in HTML

Dependency mismatch se bachne ke liye apne HTML page par script files ko hamesha is order mein load karein:

```html
<!-- 1. Config Manager first -->
<script src="config-manager.js"></script>

<!-- 2. Central API Core -->
<script src="api.js"></script>

<!-- 3. Specialized API Files -->
<script src="cluster-queries-api.js"></script>
<script src="super-admin-api.js"></script>
<script src="cluster-owner-api.js"></script>