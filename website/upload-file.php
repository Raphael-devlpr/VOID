<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Verify upload key for security
$uploadKey = $_POST['upload_key'] ?? '';
$expectedKey = '9c6b282e020ec154b5161132df07afdb32da7b512d91d133e021207f8ec30b86'; 

if ($uploadKey !== $expectedKey) {
    http_response_code(403);
    echo json_encode(['error' => 'Invalid upload key']);
    exit();
}

// Check if file was uploaded
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded or upload error']);
    exit();
}

$file = $_FILES['file'];
$projectId = $_POST['project_id'] ?? 'unknown';
$fileType = $_POST['file_type'] ?? 'documents';
$uploadedBy = $_POST['uploaded_by'] ?? 'admin';

// Validate file size (50MB max)
$maxSize = 50 * 1024 * 1024; // 50MB
if ($file['size'] > $maxSize) {
    http_response_code(400);
    echo json_encode(['error' => 'File size exceeds 50MB limit']);
    exit();
}

// Sanitize filename
$originalName = basename($file['name']);
$sanitizedName = preg_replace('/[^a-zA-Z0-9.-]/', '_', $originalName);
$timestamp = time();
$filename = $timestamp . '-' . $sanitizedName;

// Create directory structure
$baseDir = __DIR__ . '/project-files';
$projectDir = $baseDir . '/project-' . $projectId;
$typeDir = $projectDir . '/' . $fileType;

if (!is_dir($typeDir)) {
    mkdir($typeDir, 0755, true);
}

$targetPath = $typeDir . '/' . $filename;

// Move uploaded file
if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    // Return file URL
    $fileUrl = 'https://voidtechsolutions.co.za/project-files/project-' . $projectId . '/' . $fileType . '/' . $filename;
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'file_url' => $fileUrl,
        'file_name' => $originalName,
        'file_size' => $file['size']
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save file']);
}
?>
