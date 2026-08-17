#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// --- I2C LCD CONFIGURATION ---
// Change address if your module uses a different one (0x27 is common)
const int I2C_ADDR = 0x27;
const int LCD_COLS = 16;
const int LCD_ROWS = 2;
LiquidCrystal_I2C lcd(I2C_ADDR, LCD_COLS, LCD_ROWS);

// --- PIEZO SENSOR CONFIGURATION ---
const int VIBRATION_PIN = A0; // A0

// --- LED PINS ---
const int GREEN_LED_PIN = 4;
const int RED_LED_PIN   = 2;

// --- THRESHOLDS (tweak these if needed) ---
const int NOISE_THRESHOLD = 50;          // below = calm (noise)
const int HIGH_VIBRATION_THRESHOLD = 80; // above = high vibration

// --- SAMPLING / DEBOUNCE ---
const unsigned int SAMPLE_COUNT = 30;       // number of quick samples per check
const unsigned long SAMPLE_WINDOW_MS = 30;  // approx total time to sample
const unsigned long STATE_HOLD_MS = 600;    // minimum ms to hold a state before allowing change

// Use safe enum names to avoid conflict with Arduino LOW/HIGH macros
enum VibeState { STATE_CALM, STATE_LOW, STATE_HIGH };

VibeState currentState = STATE_CALM;
unsigned long lastStateChange = 0;

void setup() {
  Serial.begin(9600);

  // LCD init
  lcd.init();
  lcd.backlight();

  // LED pins
  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  digitalWrite(GREEN_LED_PIN, LOW);
  digitalWrite(RED_LED_PIN, LOW);

  // Initial display: Calm/ready
  showReady();
  currentState = STATE_CALM;
  lastStateChange = millis();

  // NOTE: For best results add a pull-down resistor 100kΩ - 1MΩ from A0 to GND
  // This prevents the analog pin from floating when the sensor is idle.
}

int readPeak(int samples, unsigned long windowMs) {
  unsigned long start = millis();
  int peak = 0;
  for (int i = 0; i < samples; ++i) {
    int val = analogRead(VIBRATION_PIN);
    if (val > peak) peak = val;

    // small delay to spread samples in the sampling window
    unsigned long elapsed = millis() - start;
    unsigned long targetElapsed = (windowMs * (unsigned long)(i + 1)) / (unsigned long)samples;
    if (elapsed < targetElapsed) {
      // Sleep very briefly so we don't block too long
      delay(1);
    }
  }
  return peak;
}

void showReady() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Vibration Sensor");
  lcd.setCursor(0, 1);
  lcd.print("Status: Ready");
  digitalWrite(GREEN_LED_PIN, LOW);
  digitalWrite(RED_LED_PIN, LOW);
}

void showLow(int value) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Level: Low");
  lcd.setCursor(0, 1);
  lcd.print("Value:");
  lcd.print(value);
  digitalWrite(GREEN_LED_PIN, HIGH);
  digitalWrite(RED_LED_PIN, LOW);
}

void showHigh(int value) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Level: HIGH");
  lcd.setCursor(0, 1);
  lcd.print("Value:");
  lcd.print(value);
  digitalWrite(GREEN_LED_PIN, LOW);
  digitalWrite(RED_LED_PIN, HIGH);
}

void loop() {
  // get peak reading across a short sample window
  int peak = readPeak(SAMPLE_COUNT, SAMPLE_WINDOW_MS);

  Serial.print("Peak: ");
  Serial.println(peak);

  VibeState newState;
  if (peak > HIGH_VIBRATION_THRESHOLD) newState = STATE_HIGH;
  else if (peak > NOISE_THRESHOLD) newState = STATE_LOW;
  else newState = STATE_CALM;

  unsigned long now = millis();

  // enforce a hold time so state doesn't flip too quickly
  if (newState != currentState && (now - lastStateChange) < STATE_HOLD_MS) {
    // treat as transient, keep currentState
    newState = currentState;
  }

  // update only when state actually changes
  if (newState != currentState) {
    currentState = newState;
    lastStateChange = now;
    if (currentState == STATE_CALM) {
      showReady();
    } else if (currentState == STATE_LOW) {
      showLow(peak);
    } else { // STATE_HIGH
      showHigh(peak);
    }
  }
  // small delay to keep loop reasonable - tweak as desired
  delay(80);
}

