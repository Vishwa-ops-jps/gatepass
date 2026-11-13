# GatePass™ Enterprise — Smart Society Security & Visitor Management Platform

[![Expo SDK](https://img.shields.io/badge/Expo-SDK_54-000020.svg?style=flat&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB.svg?style=flat&logo=react)](https://reactnative.dev)
[![Node.js](https://img.shields.io/badge/Node.js-v24.x-339933.svg?style=flat&logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-Backend-black.svg?style=flat&logo=express)](https://expressjs.com)
[![SQLite](https://img.shields.io/badge/SQLite-Native_WAL-003B57.svg?style=flat&logo=sqlite)](https://sqlite.org)
[![WebSocket](https://img.shields.io/badge/WebSocket-Live_Sync-010101.svg?style=flat&logo=socketdotio)](https://github.com/websockets/ws)
[![Android](https://img.shields.io/badge/Android-Standalone_APK-3DDC84.svg?style=flat&logo=android)](https://developer.android.com)

> *"Every Entry Secure. Every Resident Safe."*

GatePass™ Enterprise is a comprehensive, production-grade security and society management system (comparable to MyGate, NoBrokerHood, and ADDA). It features an Express + native SQLite WAL backend with real-time WebSockets, a desktop web portal, an interactive device simulator, and a standalone React Native mobile app.

---

## 🌟 Key Highlights

### 1. 🏠 Resident Owner Portal (Flat-Isolated)
- **Login Verification**: Secure authentication requiring **Flat Number** (e.g. `B-402`, `A-104`, `C-201`) and registered **Phone Number** (e.g. `9876543210`).
- **Visitor Approval with Video Intercom**: Real-time incoming calls when visitors arrive at society gates. Actions: *Allow Entry*, *Deny Entry*, or *Leave at Gate* (for food/courier packages).
- **Pre-Approved Digital GatePass**: Generate 6-digit visitor/cab/delivery passcodes with instant QR code sharing.
- **Maintenance Dues & Digital Payments**: Society maintenance billing with one-tap mock UPI / card checkout and instant transaction receipts.
- **My Vehicles & Parking Bays**: FastTag registry lookup for basement parking slots.
- **Society Helpdesk**: Raise service complaints (Electrical, Plumbing, Housekeeping, Lift) with live status tracking.

### 2. 🛡️ Security Guard Terminal
- **Login Verification**: Guard **Badge ID** (e.g. `SEC-104`, `SEC-108`), **Gate Selector** (`Main Gate #1` / `Service Gate #2`), and 4-Digit Security PIN (`1234`).
- **Walk-In Visitor Check-In**: Guards register walk-ins; an immediate WebSocket ring alert is sent to the target flat.
- **QR Code & Passcode Scanner**: 1-click verification of resident-generated digital passes (`GP-XXXX`).
- **Live CCTV Surveillance Feeds**: Simulated real-time cameras for Main Gate and Service Gate lanes.
- **Inside Campus Tracker**: Monitor active visitors on premises and check them out upon exit.
- **Emergency Gate SOS**: Society-wide broadcast alarm for security incidents.

### 3. 👔 Society Committee Admin
- **Login Verification**: Estate Administrator email (`admin@gatepass.com`) and password (`admin123`).
- **Command Center Metrics**: Live society overview (48 total flats, 87.5% occupancy, ₹1,56,800 total collected, ₹28,450 pending dues, verified helpers on duty).
- **Flats & Resident Directory**: Searchable society ledger detailing flat ownership, contact numbers, maintenance status, and vehicle plate numbers.
- **Society-wide Security Audit Log**: Comprehensive timeline of all entry and exit events across all society gates.
- **Complaint Resolution**: View and resolve tickets filed across the entire community.

---

## 🔑 Quick Demo Credentials

| Role | Identifier / Username | Password / PIN | Required Additional Field |
| :--- | :--- | :--- | :--- |
| **Resident Owner** | Phone: `9876543210` | — | **Flat No**: `B-402` (Vishwa) |
| **Resident Owner** | Phone: `9811122233` | — | **Flat No**: `A-104` (Pooja) |
| **Resident Owner** | Phone: `9822233445` | — | **Flat No**: `C-201` (Dr. Alok) |
| **Security Guard** | Badge: `SEC-104` | PIN: `1234` | Gate: `Main Gate #1` (Rajesh) |
| **Security Guard** | Badge: `SEC-108` | PIN: `1234` | Gate: `Service Gate #2` (Sunil) |
| **Society Admin** | Email: `admin@gatepass.com` | Password: `admin123` | — (Col. Rathore) |

---

## 📁 Repository Structure

```
gatepass/
├── App.js                     # Root React Native / Expo application
├── package.json               # Expo & React Native project configuration
├── app.json                   # EAS build config, Android permissions, app metadata
├── run_localhost.bat          # 1-click script to run backend & web portal
├── assets/                    # Application icons, logos, and UI imagery
├── GatePass.apk               # Standalone signed Android APK (release build)
├── GatePass_APK_Installer/    # Direct mobile installation server & tools
│   ├── Install_GatePass_On_Mobile.html
│   └── Start_Phone_Installer_Server.bat
├── server/                    # Node.js backend
│   ├── index.js               # Express REST API & WebSocket server (:5001)
│   ├── db.js                  # Native SQLite WAL schema, queries, and seed data
│   ├── gatepass.db            # SQLite persistent database file
│   └── public/                # Web application and developer dashboard
│       ├── index.html         # Full desktop web portal & mobile device simulator
│       ├── api-docs.html      # REST API & WebSocket developer dashboard
│       └── assets/            # High-resolution branding assets
└── src/                       # React Native modular components
    ├── components/
    │   ├── LoginScreen.js     # 3-role authentication screen
    │   ├── ResidentHome.js    # Resident dashboard with pending approvals
    │   ├── GuardHome.js       # Security guard desk with walk-in logger
    │   ├── Header.js          # Top branded bar with role switcher
    │   ├── IntercomCallModal.js # Real-time CCTV video call screen
    │   ├── QRPassModal.js     # Digital gate pass generator
    │   ├── SOSModal.js        # Emergency alert broadcaster
    │   ├── StaffTab.js        # Daily staff attendance & directory
    │   ├── AmenitiesTab.js    # Clubhouse, gym & pool reservation
    │   └── MaintenanceTab.js  # Society dues billing with UPI checkout
    ├── services/
    │   └── api.js             # REST API helpers & WebSocket client
    └── theme/
        └── colors.js          # Enterprise brand color palette
```

---

## 🚀 Running Locally

### Option 1: 1-Click Launch (Windows)
Double-click [`run_localhost.bat`](run_localhost.bat) to launch both the backend server and web application automatically.

### Option 2: Manual Startup

#### Step 1: Start the Backend & Web Portal
```bash
cd server
npm install
node index.js
```
The backend and web portal will be accessible at:
- **Web Portal**: http://localhost:5001
- **Developer API Docs**: http://localhost:5001/api-docs
- **WebSocket Endpoint**: `ws://localhost:5001/ws`

#### Step 2: Start the Expo React Native App
In a separate terminal window:
```bash
npm install
npx expo start
```
- Press `w` to open in your browser
- Press `a` to run in Android Emulator
- Scan the QR code with Expo Go on a mobile device

---

## 📱 Mobile App (Standalone APK)

The standalone Android build is included in the root directory as [`GatePass.apk`](GatePass.apk).

### Direct Installation on Phone
1. Connect your Android device via USB and run [`GatePass_APK_Installer/Install_Via_USB_To_Phone.bat`](GatePass_APK_Installer/Install_Via_USB_To_Phone.bat) (requires ADB).
2. Or start the Wi-Fi installer: run [`GatePass_APK_Installer/Start_Phone_Installer_Server.bat`](GatePass_APK_Installer/Start_Phone_Installer_Server.bat) and download the APK directly onto your phone by visiting `http://<your-computer-ip>:5500`.

---

## 🛡️ License

Private enterprise repository. Built for GatePass society security and visitor automation.
