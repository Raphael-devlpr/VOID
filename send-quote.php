<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Get the JSON data from the request
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid data']);
    exit;
}

// Extract data
$website = isset($data['website']) ? $data['website'] : 'None';
$addons = isset($data['addons']) ? $data['addons'] : [];
$monthly = isset($data['monthly']) ? $data['monthly'] : [];
$oneTimeTotal = isset($data['oneTimeTotal']) ? $data['oneTimeTotal'] : 0;
$monthlyTotal = isset($data['monthlyTotal']) ? $data['monthlyTotal'] : 0;
$timestamp = date('Y-m-d H:i:s');

// Build email content
$subject = "New Quote Request - R" . number_format($oneTimeTotal, 0, '.', ',');

$message = "NEW QUOTE REQUEST\n";
$message .= "Received: $timestamp\n";
$message .= str_repeat("=", 50) . "\n\n";

$message .= "WEBSITE PACKAGE:\n";
$message .= "- $website\n\n";

if (!empty($addons)) {
    $message .= "ADD-ON SERVICES:\n";
    foreach ($addons as $addon) {
        $message .= "- $addon\n";
    }
    $message .= "\n";
}

if (!empty($monthly)) {
    $message .= "MONTHLY SERVICES:\n";
    foreach ($monthly as $service) {
        $message .= "- $service\n";
    }
    $message .= "\n";
}

$message .= str_repeat("=", 50) . "\n";
$message .= "TOTAL BREAKDOWN:\n";
$message .= "One-Time Cost: R " . number_format($oneTimeTotal, 0, '.', ',') . "\n";
if ($monthlyTotal > 0) {
    $message .= "Monthly Cost: R " . number_format($monthlyTotal, 0, '.', ',') . "/month\n";
}
$message .= str_repeat("=", 50) . "\n\n";

$message .= "Please contact the client to follow up on this quote.\n";
$message .= "Phone: +27 65 833 5278\n";
$message .= "Email: info@voidtechsolutions.co.za";

// Check if running on localhost
$isLocalhost = in_array($_SERVER['HTTP_HOST'], ['localhost', '127.0.0.1', '::1']) || 
               strpos($_SERVER['HTTP_HOST'], 'localhost:') === 0;

// Email settings
$to = "info@voidtechsolutions.co.za";
$headers = "From: Quote System <noreply@voidtechsolutions.co.za>\r\n";
$headers .= "Reply-To: info@voidtechsolutions.co.za\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Send email (skip on localhost)
$emailSent = false;
if (!$isLocalhost) {
    $emailSent = mail($to, $subject, $message, $headers);
} else {
    // On localhost, just log it and return success
    $emailSent = true; // Simulate success for localhost testing
}

// Log the request (optional - for debugging)
$logFile = __DIR__ . '/quote-requests.log';
$logMessage = date('Y-m-d H:i:s') . " - Quote Request\n";
$logMessage .= "One-Time: R" . $oneTimeTotal . ", Monthly: R" . $monthlyTotal . "\n";
$logMessage .= "Email Sent: " . ($emailSent ? "YES" : "NO") . "\n";
$logMessage .= str_repeat("-", 50) . "\n";
file_put_contents($logFile, $logMessage, FILE_APPEND);

// Return response
if ($emailSent) {
    echo json_encode([
        'success' => true,
        'message' => 'Quote request sent successfully'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to send email. Please try again or contact us directly.'
    ]);
}
?>
