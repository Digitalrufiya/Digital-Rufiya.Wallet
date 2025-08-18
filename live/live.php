<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); // allow your frontend to call it

$apiKey = "86690d89-ff4d-4e5e-abeb-68c2d7582b35"; // your Livepeer API key

$input = file_get_contents("php://input");
$data = json_decode($input, true);
if (!$data) {
    $data = ["name" => "DRFChain Live Stream"];
}

$ch = curl_init("https://livepeer.studio/api/stream");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $apiKey",
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
