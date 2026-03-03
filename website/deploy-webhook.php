<?php
/**
 * GitHub Webhook - Simple Version
 * Logs webhook calls and triggers manual review
 */

// Set proper headers
header('Content-Type: application/json');

// Log file
$logFile = __DIR__ . '/deploy.log';

try {
    // Get payload
    $payload = file_get_contents('php://input');
    $data = json_decode($payload, true);
    
    // Log the webhook
    $logMessage = date('Y-m-d H:i:s') . " - Webhook received\n";
    $logMessage .= "Commit: " . ($data['head_commit']['message'] ?? 'Unknown') . "\n";
    $logMessage .= "Author: " . ($data['pusher']['name'] ?? 'Unknown') . "\n";
    $logMessage .= "Branch: " . ($data['ref'] ?? 'Unknown') . "\n\n";
    
    file_put_contents($logFile, $logMessage, FILE_APPEND);
    
    // Success response
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Webhook received. Please deploy manually in cPanel.',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    // Error handling
    file_put_contents($logFile, "ERROR: " . $e->getMessage() . "\n\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
