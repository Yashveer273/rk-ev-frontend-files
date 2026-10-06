vehicle-cluster-dashboard/
│
├── index.html
│
├── config/
│   └── app-config.js
│
├── css/
│   ├── common.css
│   ├── dashboard.css
│   ├── cluster.css
│   └── operator.css
│
├── js/
│   ├── api.js
│   ├── config-manager.js
│   ├── common.js
│   ├── dashboard.js
│   ├── super-admin.js
│   ├── cluster-owner.js
│   └── operator-list.js
│
├── pages/
│   │
│   ├── dashboard.html
│   │
│   ├── super-admin/
│   │   ├── create-cluster.html
│   │   ├── cluster-management.html
│   │   ├── owner-details.html
│   │   └── kyc-verification.html
│   │
│   └── cluster-owner/
│       ├── cluster.html
│       ├── owner-details.html
│       ├── kyc.html
│       └── operators.html
│
└── assets/
    └── images/



    dashboard.html
│
├── config/app-config.js
│       └── role + clusterId configuration
│
├── js/api.js
│       └── सभी backend requests
│
├── js/config-manager.js
│       └── create के बाद _id / ownerId manage
│
├── js/common.js
│       └── common utilities
│
├── js/dashboard.js
│       └── role के हिसाब से sections
│
├── js/super-admin.js
│       ├── create cluster
│       ├── capacity
│       ├── location
│       ├── owner details
│       └── KYC verification
│
├── js/cluster-owner.js
│       ├── KYC submit
│       ├── add operator
│       ├── get operators
│       └── delete operator
│
└── js/operator-list.js
        └── operator table + delete