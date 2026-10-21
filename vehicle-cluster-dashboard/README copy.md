/vehicle-cluster-dashboard
│
├── index.html                               # होम / रोल सिलेक्शन पेज (डिफ़ॉल्ट: सुपर एडमिन)
│
├── components/                              # रीयूज़ेबल UI कॉम्पोनेंट्स
│   └── sidebar.html                         # साइडबार / स्लाइडर कॉम्पोनेंट
│
├── super-admin/                             # 👑 सुपर एडमिन के अलग पेजेस
│   ├── dashboard.html
│   ├── create-cluster.html
│   ├── cluster-management.html
│   └── kyc-verification.html
│
├── cluster-owner/                           # 👤 क्लस्टर ओनर के अलग पेजेस
│   ├── dashboard.html
│   ├── kyc-submission.html
│   └── vehicle-operators.html
│
├── css/
│   ├── app.css
│   └── dashboard.css
│
└── js/
    ├── api.js                               # 📌 ओरिजिनल सेंट्रल API कोर फाइल (बिना नाम बदले)
    ├── cluster-queries-api.js               # 📌 ओरिजिनल क्लस्टर क्वेरी API फाइल
    ├── super-admin-api.js                   # 📌 ओरिजिनल सुपर एडमिन API फाइल
    ├── cluster-owner-api.js                 # 📌 ओरिजिनल क्लस्टर ओनर API फाइल
    ├── config-manager.js                    # 📌 ओरिजिनल कॉन्फिग मैनेजमेंट फाइल
    │
    └── js2/                                 # 🚀 नया एक्शन फोल्डर (जहाँ सारे फॉर्म्स और एक्शंस का लॉजिक रहेगा)
        ├── super-admin-actions.js           # सुपर एडमिन के फॉर्म सबमिशन और एक्शंस
        └── owner-actions.js                 # ओनर और ऑपरेटर के एक्शंस और टेबल रेंडरिंग लॉजिक

        https://share.gemini.google/w9SFAfQ5fEcp