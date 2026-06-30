# SafeStack AI - Regulatory Compliance & Safety Directives

This document summarizes the structural and electrical compliance baselines target-audited by the SafeStack AI system.

## 1. Racking Deflection Tolerances (OSHA & FEM 10.2.02)
Standard warehousing configurations require vertical racking columns to adhere to strict load deflection boundaries. 

*   **Maximum Permissible Deviation ($D_{\text{max}}$)**: The system flags alerts when vertical deflection exceeds $H/200$, where $H$ is the frame height.
*   **Safe Limit Configuration**: Configured to **12.0 mm** as the critical cutoff point for a standard 2.4-meter structural racking section. Any deflection larger than this threshold triggers an immediate evacuation notice.

## 2. Thermal Monitoring Standards (NFPA 70B)
To support predictive fire patrols, radiometric imaging tracks unlit electrical distribution boxes, switchgear panels, and battery packs.

*   **Radiometric Thresholds**:
    *   **Normal**: $< 40^{\circ}\text{C}$
    *   **Flagged (Spike)**: $40^{\circ}\text{C} - 70^{\circ}\text{C}$
    *   **Critical (Hazard)**: $> 75^{\circ}\text{C}$
*   All thermal events exceeding $75^{\circ}\text{C}$ must be synced immediately to the Supabase database.

## 3. Structural Weld Compliance (AWS D1.1/D1.1M)
Visual inspection of trusses and structural weld joints runs locally using a ResNet-50 CNN model:

*   Flags joints showing structural oxidation or cracking.
*   Requires a minimum joint integrity rating of **65%**; welds dropping below this metric require a physical audit.
