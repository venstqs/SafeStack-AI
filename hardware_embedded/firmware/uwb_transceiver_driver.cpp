#include <iostream>
#include <chrono>
#include <thread>
#include <vector>

// Simulated Ultra-Wideband (UWB) Decawave driver
class UWBTransceiver {
private:
    std::string anchor_id;
    double calibration_offset;

public:
    UWBTransceiver(std::string id, double offset) : anchor_id(id), calibration_offset(offset) {}

    double calculateDistance(double time_of_flight_ns) {
        // Speed of light in air: ~0.2997 meters per nanosecond
        double raw_distance = time_of_flight_ns * 0.299792458;
        return raw_distance - calibration_offset;
    }
};

int main() {
    std::cout << "[UWB Node] Starting High-Frequency Distance Calibration Service..." << std::endl;
    
    UWBTransceiver anchorA("Anchor-01", 0.05);
    UWBTransceiver anchorB("Anchor-02", 0.03);

    // Mock Time of Flight inputs in nanoseconds
    std::vector<double> tof_samples = { 15.42, 23.18, 9.87, 44.02 };

    for (double sample : tof_samples) {
        double distA = anchorA.calculateDistance(sample);
        std::cout << "[UWB Node] Sample: " << sample << "ns | Computed Calibrated Distance: " << distA << " meters" << std::endl;
        std::this_thread::sleep_for(std::chrono::milliseconds(500));
    }

    return 0;
}
