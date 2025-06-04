<?php

## If you are going to make this file public on the internet, be sure to implement login restrictions.

//If you are using this script on a different host you will need to uncomment the lines below

/*
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, api-key, x-api-key, anthropic-version, anthropic-dangerous-direct-browser-access, Authorization");
*/

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Note: This proxy code will use the IP address of where it is hosted, the purpose is not to mask or anonymize the user,
// just to get rid of CORS errors.
// GitHub Pages does not support PHP, so this proxy code will not work in such an environment.

/**
 * To get around CORS errors when working with SambaNova a proxy may be necessary.
 * This code is one of the possible solutions, for it to work you need to be running the code on localhost
 * or a hosting that supports PHP, this will not work on GitHub pages.
 */

//ini_set('display_errors', 1);
$endpoint = $_GET['endpoint'] ?? '';
if (!filter_var($endpoint, FILTER_VALIDATE_URL)) {
    exit('Not a valid URL');
}
$post_data = file_get_contents('php://input');
$ch = curl_init($endpoint);
$received_headers = getallheaders();
$headers_to_send = [];
foreach ($received_headers as $key => $value) {
    if (strtolower($key) === "authorization") {
        $headers_to_send[] = "$key: $value";
    }
}
$headers_to_send[] = "Content-Type: application/json";
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers_to_send);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$arr = json_decode($post_data);
if (!empty($arr->stream)) {
    header('Content-Type: text/event-stream');
}
header('Cache-Control: no-cache');
curl_setopt($ch, CURLOPT_WRITEFUNCTION, function ($ch, $data) {
    echo $data;
    ob_flush();
    flush();
    return strlen($data);
});
curl_exec($ch);
curl_close($ch);
exit();