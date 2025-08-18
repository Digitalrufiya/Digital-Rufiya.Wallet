<?php
// live.php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); // allow requests from your frontend

// Your Livepeer API key
$apiKey = "86690d89-ff4d-4e5e-abeb-68c2d7582b35";

// Get POST data
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Default stream name
if (!$data || !isset($data['name'])) {
    $data = ["name" => "DRFChain Live Stream"];
}

// Create Livepeer stream via API
$ch = curl_init("https://livepeer.studio/api/stream");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $apiKey",
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpcode >= 200 && $httpcode < 300) {
    echo $response; // JSON with streamKey & playbackId
} else {
    echo json_encode([
        "error" => true,
        "message" => "Failed to create stream. HTTP code: $httpcode",
        "response" => $response
    ]);
}
?>
