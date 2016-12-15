<?php

require "tweetmap.php";

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if (isset($_GET['woeid'])) {
        $woeid = htmlspecialchars($_GET['woeid']);
        if ($woeid != '') {
            echo "toto";
            $search = $connection->get("trends/place", ["id" => $woeid]);
            echo json_encode($search);
        }
    }
    else {
        $search = $connection->get("trends/available", []);
        echo json_encode($search);
    }
}
