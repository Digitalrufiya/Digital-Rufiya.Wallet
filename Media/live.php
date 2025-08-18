<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$apiKey = "86690d89-ff4d-4e5e-abeb-68c2d7582b35"; // replace with your key

// Read request body from frontend
$input = file_get_contents("php://input");
if (empty($input)) {
  $input = json_encode(["name" => "My Test Stream"]);
}

$ch = curl_init("https://livepeer.studio/api/stream");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  "Authorization: Bearer $apiKey",
  "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $input);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
