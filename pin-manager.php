<?php
// PIN Management System for Software Page
// This handles PIN validation, tracking, and management

header('Content-Type: application/json');

// File to store PIN data
$dataFile = __DIR__ . '/pins-data.json';

// Initialize data file if it doesn't exist
if (!file_exists($dataFile)) {
    $initialData = [
        'activePins' => ['74678'],
        'usedPins' => []
    ];
    file_put_contents($dataFile, json_encode($initialData, JSON_PRETTY_PRINT));
}

// Get current data
function getPinData() {
    global $dataFile;
    $json = file_get_contents($dataFile);
    return json_decode($json, true);
}

// Save data
function savePinData($data) {
    global $dataFile;
    file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));
}

// Send email notification
function sendPinUsedNotification($pin) {
    $to = "info@voidtechsolutions.co.za"; // Change this to your email
    $subject = "Software Page PIN Used - " . date('Y-m-d H:i:s');
    $message = "A PIN has been used on the software page:\n\n";
    $message .= "PIN: " . $pin . "\n";
    $message .= "Time: " . date('Y-m-d H:i:s') . "\n";
    $message .= "User IP: " . $_SERVER['REMOTE_ADDR'] . "\n";
    $headers = "From: noreply@voidtechsolutions.co.za\r\n";
    $headers .= "Reply-To: info@voidtechsolutions.co.za\r\n";
    
    @mail($to, $subject, $message, $headers);
}

// Handle different actions
$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'validate':
        // Validate a PIN when user tries to unlock
        $data = json_decode(file_get_contents('php://input'), true);
        $pin = $data['pin'] ?? '';
        
        $pinData = getPinData();
        
        // Check if PIN is in active list
        if (!in_array($pin, $pinData['activePins'])) {
            echo json_encode(['success' => false, 'message' => 'Incorrect PIN. Please try again.']);
            exit;
        }
        
        // Check if already used
        $alreadyUsed = false;
        foreach ($pinData['usedPins'] as $used) {
            if ($used['pin'] === $pin) {
                $alreadyUsed = true;
                break;
            }
        }
        
        if ($alreadyUsed) {
            echo json_encode(['success' => false, 'message' => 'This PIN has already been used. Please request a new PIN.']);
            exit;
        }
        
        // Mark as used
        $pinData['usedPins'][] = [
            'pin' => $pin,
            'timestamp' => date('Y-m-d H:i:s'),
            'ip' => $_SERVER['REMOTE_ADDR']
        ];
        
        savePinData($pinData);
        sendPinUsedNotification($pin);
        
        echo json_encode(['success' => true, 'message' => 'PIN valid']);
        break;
        
    case 'getAll':
        // Get all PINs (for admin panel)
        $adminKey = $_GET['key'] ?? '';
        
        // Simple security - check admin key
        if ($adminKey !== 'Raphael') {
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }
        
        $pinData = getPinData();
        echo json_encode(['success' => true, 'data' => $pinData]);
        break;
        
    case 'addPin':
        // Add a new PIN
        $data = json_decode(file_get_contents('php://input'), true);
        $adminKey = $data['key'] ?? '';
        $newPin = $data['pin'] ?? '';
        
        if ($adminKey !== 'Raphael') {
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }
        
        if (empty($newPin)) {
            echo json_encode(['success' => false, 'message' => 'PIN cannot be empty']);
            exit;
        }
        
        $pinData = getPinData();
        
        // Check if already exists
        if (in_array($newPin, $pinData['activePins'])) {
            echo json_encode(['success' => false, 'message' => 'PIN already exists']);
            exit;
        }
        
        $pinData['activePins'][] = $newPin;
        savePinData($pinData);
        
        echo json_encode(['success' => true, 'message' => 'PIN added successfully']);
        break;
        
    case 'deletePin':
        // Delete a PIN
        $data = json_decode(file_get_contents('php://input'), true);
        $adminKey = $data['key'] ?? '';
        $pin = $data['pin'] ?? '';
        
        if ($adminKey !== 'Raphael') {
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }
        
        $pinData = getPinData();
        $pinData['activePins'] = array_values(array_filter($pinData['activePins'], function($p) use ($pin) {
            return $p !== $pin;
        }));
        
        savePinData($pinData);
        
        echo json_encode(['success' => true, 'message' => 'PIN deleted successfully']);
        break;
        
    case 'clearUsed':
        // Clear used PINs history
        $data = json_decode(file_get_contents('php://input'), true);
        $adminKey = $data['key'] ?? '';
        
        if ($adminKey !== 'Raphael') {
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            exit;
        }
        
        $pinData = getPinData();
        $pinData['usedPins'] = [];
        savePinData($pinData);
        
        echo json_encode(['success' => true, 'message' => 'Used PINs history cleared']);
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
?>
