<?php
/**
 * GitHub Webhook Auto-Deploy Script
 * This script triggers cPanel Git deployment automatically
 */

// Security: Add a secret token
$secret = 'void_deploy_secret_2025';

// Log file for debugging
$logFile = __DIR__ . '/deploy.log';

// Get the GitHub webhook payload
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';

// Log the webhook attempt
file_put_contents($logFile, date('Y-m-d H:i:s') . " - Webhook received\n", FILE_APPEND);

// Verify the signature if secret is set
if (!empty($secret) && !empty($signature)) {
    $hash = 'sha256=' . hash_hmac('sha256', $payload, $secret);
    if (!hash_equals($hash, $signature)) {
        file_put_contents($logFile, "Error: Invalid signature\n\n", FILE_APPEND);
        http_response_code(403);
        die('Invalid signature');
    }
}

// Trigger cPanel Git deployment using API
$cpanelUser = 'voidtech';
$repoPath = '/home/voidtech/repositories/VOID';

// Use exec to run git commands
$commands = [
    "cd $repoPath && git fetch origin main 2>&1",
    "cd $repoPath && git reset --hard origin/main 2>&1",
];

foreach ($commands as $cmd) {
    $output = '';
    $return = 0;
    
    // Try exec (usually available)
    if (function_exists('exec')) {
        exec($cmd, $outputArray, $return);
        $output = implode("\n", $outputArray);
    }
    
    file_put_contents($logFile, "Command: $cmd\n", FILE_APPEND);
    file_put_contents($logFile, "Output: $output\n", FILE_APPEND);
}

file_put_contents($logFile, date('Y-m-d H:i:s') . " - Deployment completed\n\n", FILE_APPEND);

http_response_code(200);
echo json_encode(['status' => 'success', 'message' => 'Webhook received and processed']);
?>
