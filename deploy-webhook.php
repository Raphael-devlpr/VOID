<?php
/**
 * GitHub Webhook Auto-Deploy Script
 * This script automatically pulls and deploys changes from GitHub when you push
 */

// Security: Add a secret token (change this to something random)
$secret = 'void_deploy_secret_2025';

// Get the GitHub webhook payload
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';

// Verify the signature (optional but recommended)
if (!empty($secret)) {
    $hash = 'sha256=' . hash_hmac('sha256', $payload, $secret);
    if (!hash_equals($hash, $signature)) {
        http_response_code(403);
        die('Invalid signature');
    }
}

// Log file for debugging
$logFile = __DIR__ . '/deploy.log';

// Repository and deployment paths
$repoPath = '/home/voidtech/repositories/VOID';
$deployPath = '/home/voidtech/public_html';

// Log the deployment
file_put_contents($logFile, date('Y-m-d H:i:s') . " - Webhook triggered\n", FILE_APPEND);

// Change to repository directory and pull changes
chdir($repoPath);
$output = shell_exec('git pull origin main 2>&1');
file_put_contents($logFile, "Git Pull: " . $output . "\n", FILE_APPEND);

// Deploy using .cpanel.yml instructions
// Remove old files from public_html (except .well-known for SSL)
shell_exec("find $deployPath -mindepth 1 -not -path '$deployPath/.well-known*' -delete 2>&1");

// Copy all files to public_html
shell_exec("cp -R $repoPath/* $deployPath/ 2>&1");
shell_exec("cp $repoPath/.htaccess $deployPath/ 2>/dev/null");
shell_exec("cp $repoPath/robots.txt $deployPath/ 2>&1");
shell_exec("cp $repoPath/sitemap.xml $deployPath/ 2>&1");

file_put_contents($logFile, date('Y-m-d H:i:s') . " - Deployment completed\n\n", FILE_APPEND);

http_response_code(200);
echo "Deployment successful!";
?>
