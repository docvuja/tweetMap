<?php 


$url = "https://publish.twitter.com/oembed?url=https%3A%2F%2Ftwitter.com%2FNBA%2Fstatus%2F807749687944089602";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
$result = curl_exec($ch);
curl_close($ch);
echo $result;
//echo json_encode($statuses);