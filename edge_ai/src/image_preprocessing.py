import cv2
import numpy as np

def stretch_contrast(image: np.ndarray) -> np.ndarray:
    """
    Standardizes lighting conditions inside dark or high-humidity warehouse roof sections.
    """
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image

    # Adaptive histogram equalization (CLAHE)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    equalized = clahe.apply(gray)
    
    return equalized

def detect_rust_oxidation(image: np.ndarray) -> float:
    """
    Computes percentage of rust surface oxidation from a joint image frame.
    Returns float value between 0.0 (clean) and 1.0 (fully corroded).
    """
    # Convert to HSV color space
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    
    # Range for rusty/orange-brown iron oxide
    lower_rust = np.array([5, 50, 50])
    upper_rust = np.array([20, 255, 255])
    
    mask = cv2.inRange(hsv, lower_rust, upper_rust)
    rust_pixels = cv2.countNonZero(mask)
    total_pixels = image.shape[0] * image.shape[1]
    
    return float(rust_pixels / total_pixels)
