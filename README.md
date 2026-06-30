# SafeStack AI: Multi-Agent Mobile Structural Diagnostics & Thermal Hazard Patrol Ecosystem

![Mobile Command Dashboard Mockup](docs/assets/dashboard_mockup.png)

An autonomous facility safety auditing framework and companion mobile command app designed to coordinate automated flight routes, process real-time structural load telemetry, and run computer vision models to detect thermal/corrosion anomalies in high-risk industrial warehouses.

---

## Technical Architecture & Core Innovation

SafeStack AI addresses structural decay, micro-temperature fire hazards, and weld corrosion through a multi-agent drone swarm and a centralized React Native command gateway.

```
+--------------------------+     +------------------------+     +-------------------------+
|  Autonomous Drone Swarm  | --> |     Local SQLite       | --> |   Supabase Cloud sync   |
| (Radiometric + Vision)   |     |  Offline-First Cache   |     |  (Telemetry Logs DB)    |
+--------------------------+     +------------------------+     +-------------------------+
                                              |
                                              v
                                 +------------------------+
                                 |  Mobile Command App    |
                                 |  (Obsidian Slate HUD)  |
                                 +------------------------+
```

### 1. Continuous Structural Deflection Model
To evaluate column buckling risks in multi-tier racking systems, the command gateway monitors millimetric deflection vectors ($D_{\text{dev}}$) against safety load limits ($D_{\text{limit}}$). The stress rating ($S_t$) is computed via:

$$S_t = \alpha \left(\frac{D_{\text{dev}}}{D_{\text{limit}}}\right) + \beta \left(1 - \frac{E_{\text{battery}}}{100}\right)$$

*   Where $D_{\text{limit}} = 12.0\text{ mm}$.
*   $\alpha, \beta$ are weight coefficients adjusting load vs. communications battery availability ($E_{\text{battery}}$).
*   If $S_t > 1.0$, a high-priority system alarm is broadcast.

### 2. CNN Weld Defect Detection
Humid roof trusses are analyzed via a convolutional neural network (ResNet-50 backbone) run locally. The weld joint quality index ($Q_{\text{weld}}$) evaluates surface rust oxidation boundaries:

$$Q_{\text{weld}} = 1.0 - \left( \sum_{i=1}^{N} \frac{A_{\text{corrosion}, i}}{A_{\text{total}}} \right) \cdot \lambda_{\text{humidity}}$$

---

## Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Mobile Frontend** | React Native, Expo SDK 56, TypeScript, Lucide Icons | Obsidian HUD cockpit for warehouse managers. |
| **Local Database** | `expo-sqlite` (Synchronous open) | Offline-first diagnostic cache. |
| **Cloud Backend** | Supabase JS client, REST APIs | Real-time database sync for remote engineers. |
| **Computer Vision** | OpenCV Python, ResNet-50, PyTorch | Edge AI weld fault and corrosion detection. |
| **Firmware / ROS** | Arduino C++, ROS2 Navigation | Autonomous drone flight control and docking loops. |

---

## Repository Structure

```
safestack-ai/
├── App.tsx                   # Main Entry & 5-Tab Bar HUD navigation
├── package.json              # Managed Expo dependencies
├── docs/                     # Engineering design specifications
│   └── regulatory_compliance.md
├── data/                     # Calibration targets and testing data
│   └── telemetry_mock.json
├── edge_ai/                  # Python computer vision pipelines
│   ├── requirements.txt
│   └── src/
│       ├── image_preprocessing.py
│       └── inference_ocr.py
├── hardware_embedded/        # Drone firmware and sensors
│   ├── slam_config/
│   │   └── nav2_params.yaml
│   └── firmware/
│       ├── thermal_chassis_heaters.ino
│       └── uwb_transceiver_driver.cpp
└── src/                      # Mobile application source
    ├── components/           # GlassCard, TelemetryGraph, StatusBadge
    ├── context/              # Global state provider & auto-balancer loop
    ├── database/             # SQLite connection and migration queries
    └── screens/              # Dashboard, Structural, VisionAI, RapidAudit, PowerDocking
```

---

## 24-Month Implementation Roadmap

### Phase 1: Hardware Integration & UWB Anchoring (Months 0 - 6)
*   Deploy Ultra-Wideband (UWB) anchors along warehouse main aisles for sub-centimeter positioning.
*   Configure ROS2 Navigation stack and test auto-docking alignment on inductive wireless pads.

### Phase 2: Edge-AI Calibration & CNN Weld Training (Months 6 - 12)
*   Train ResNet-50 models on high-resolution joint weld rust photos.
*   Optimize model parameters to `.tflite` format for local deployment on drone boards.

### Phase 3: Mobile Console Deployment & SQLite Sync (Months 12 - 18)
*   Integrate `expo-sqlite` caching layer into the React Native command dashboard.
*   Deploy Supabase cloud sync rules to handle offline-first telemetry uploads.

### Phase 4: Swarm Verification & Full Field Pilot (Months 18 - 24)
*   Conduct automated post-seismic rapid building sweeps with multi-drone teams.
*   Audit energy efficiency on the fleet battery load balancer under heavy patrol cycles.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Bundler
```bash
npx expo start -c
```
*   Press `a` to run on a connected Android Emulator.
*   Press `i` to run on an iOS Simulator.
