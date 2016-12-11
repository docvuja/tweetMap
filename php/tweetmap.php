<?php
/**
 * Created by PhpStorm.
 * User: Jeremy
 * Date: 04/12/2016
 * Time: 12:54
 */

require "../vendor/autoload.php";

use Abraham\TwitterOAuth\TwitterOAuth;

$connection = new TwitterOAuth("lo6DuiQgUw9RaZf5yPueaD8A0",
    "V92QuWEueCY56YRBK4dBoDE5KKkBj4G3QAN1aHiea6NqesohJj",
    "746826889117966336-SQddLzf2tftZ7ZwR16E46PIrY3DM3zd",
    "ApOOnqxEzqpwV3KIvbbdj2vMQWHDtQetMK2p0GGBfUYqg");

$content = $connection->get("account/verify_credentials");
//$statuses = $connection->get("search/tweets", ["q" => "", "count" => 100, "geocode" => "40.6976701,-74.2598661,10km" ]);
//$statuses = $connection->get("statuses/show", ["id" => "807749687944089602"]);
//echo json_encode($statuses);
?>
