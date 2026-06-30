/*
  SafeStack AI Drone Embedded Controller
  Thermal chassis heater & power loop to prevent LiPo freeze anomalies.
*/

const int TEMP_PIN = A0;
const int HEATER_PIN = 9;

// Cutoff points (Celsius)
const float MIN_SAFE_TEMP = 10.0;
const float TARGET_TEMP = 22.0;

void setup() {
  pinMode(HEATER_PIN, OUTPUT);
  Serial.begin(115200);
  Serial.println("SafeStack Smart-Heat Power Loop Initialized");
}

void loop() {
  int rawVoltage = analogRead(TEMP_PIN);
  float voltage = rawVoltage * (5.0 / 1023.0);
  float temperatureC = (voltage - 0.5) * 100.0; // TMP36 standard calibration

  Serial.print("Internal Battery Temp: ");
  Serial.print(temperatureC);
  Serial.println(" C");

  if (temperatureC < MIN_SAFE_TEMP) {
    // Engage aerogel-wrapped heating element
    digitalWrite(HEATER_PIN, HIGH);
    Serial.println("HEATER STATUS: ENGAGED [POWER STAGE 1]");
  } else if (temperatureC >= TARGET_TEMP) {
    // Disable heating elements to preserve battery cycles
    digitalWrite(HEATER_PIN, LOW);
    Serial.println("HEATER STATUS: STANDBY [THERMAL STABILITY]");
  }

  delay(2000); // Sample every 2 seconds
}
