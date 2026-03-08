# 🩸 HemoGlobe — Emergency Blood Logistics & Chain-of-Custody Network

HemoGlobe is a real-time, city-wide blood supply orchestration platform designed to eliminate delays in emergency blood delivery.  
It connects hospitals, blood banks, couriers, nurses, and donors into a unified digital network that coordinates blood requests, transport, and verification from **Code Red declaration to safe bedside transfusion**.

> **When seconds matter, blood should move as fast as information.**

---

# 🚨 Problem

In emergency medical situations, hospitals face three major challenges:

### 1. Information Silos
Hospitals do not have real-time visibility into the blood inventory of nearby hospitals or blood banks.

### 2. Manual Coordination
Emergency blood requests are often handled through phone calls and manual coordination, wasting critical time.

### 3. Last-Mile Safety Risks
Even when blood arrives on time, bedside errors such as transfusing incompatible blood remain a serious risk.

---

# 💡 Solution

HemoGlobe replaces fragmented coordination with a **real-time digital logistics network**.

When a hospital declares **Code Red**:

1. The request is broadcast across the hospital network.
2. The system identifies the best supplier based on distance and inventory.
3. A courier dispatch is initiated.
4. Blood transport is tracked in real time.
5. A bedside verification scanner confirms compatibility before transfusion.

---

# 🧠 Core System Logic

HemoGlobe uses an intelligent routing approach that balances:

- Distance between hospitals
- Available blood inventory
- Risk of depleting a supplier hospital

### Automated Failover Protocol

If a matched hospital cannot supply blood:

1. **Dynamic Rerouting** – Request is sent to the next best hospital.
2. **Split Dispatch** – Multiple hospitals contribute units.
3. **Donor Activation** – Nearby donors are notified if supply is exhausted.

---

# 🏛 Platform Ecosystem

HemoGlobe is built as a **role-based platform** with multiple specialized interfaces.

### 1. Hospital Admin Dashboard
- Manage hospital blood inventory
- Broadcast **Code Red emergency requests**
- Track incoming dispatches

### 2. War Room (Command Center)
- City-wide operational view
- Live hospital supply monitoring
- Emergency coordination during large incidents

### 3. Blood Bank Admin
- Register blood donations
- Generate serialized QR labels for blood units
- Maintain inventory ledger

### 4. Courier Dashboard
- Accept blood transport assignments
- Navigate pickup and delivery routes
- Update delivery status

### 5. Nurse Bedside Scanner
- Scan patient wristband
- Scan blood bag
- Verify compatibility before transfusion

### 6. Donor Portal
- Receive emergency blood alerts
- Book donation slots
- Track donation impact

### 7. Admin Super Panel
- Monitor system infrastructure
- View audit logs
- Manage network nodes

---

# 🔒 Security & Chain of Custody

HemoGlobe treats blood units as **tracked medical assets**.

Key safeguards include:

- Serialized QR codes for every blood bag
- Immutable audit trails
- Closed-loop inventory state tracking
- Bedside compatibility verification

This ensures every blood unit is traceable from **donation to transfusion**.

---

# 🛠 Tech Stack

### Frontend
- React
- Tailwind CSS
- Framer Motion

### Mapping
- React Leaflet

### Authentication
- JWT-based role access

### Real-Time Communication
- WebSockets

### UI Design
- Cyber-medical interface with high-contrast emergency indicators

---

# 📂 Project Structure

```
hemoglobe-frontend
│
├── public
├── src
│   ├── components
│   ├── contexts
│   ├── layouts
│   ├── pages
│   │   ├── auth
│   │   ├── dashboards
│   │   ├── public
│   │   └── war-room
│   ├── routes
│   ├── services
│   └── utils
│
├── package.json
└── vite.config.ts
```

---

# 🚀 Running the Project

## 1️⃣ Clone the Repository

```
git clone https://github.com/<your-username>/blood-stock-exchange.git
```

Navigate into the project directory:

```
cd hemoglobe-frontend
```

---

## 2️⃣ Install Dependencies

```
npm install
```

---

## 3️⃣ Start the Development Server

```
npm run dev
```

The application will run at:

```
http://localhost:5173
```

---

# 🧪 Demo Setup

For demonstration purposes, open the platform on multiple devices or browser windows to simulate:

- Multiple hospitals logged into the system
- Code Red emergency broadcast
- Real-time alerts across the hospital network

---

# 🎯 Impact

HemoGlobe aims to improve emergency healthcare logistics by:

- Reducing blood delivery delays
- Enabling real-time hospital coordination
- Preventing transfusion errors
- Increasing transparency in medical supply chains

---

# 🔮 Future Scope

- Integration with national blood bank systems
- AI-assisted demand forecasting
- Drone-based emergency transport
- Government health network integration

---

# 👥 Team

Developed as part of a hackathon project focused on improving emergency medical response systems.

---

# 📜 License

This project is intended for research, prototyping, and educational use.
