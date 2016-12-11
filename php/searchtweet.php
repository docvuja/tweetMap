<?php

require "tweetmap.php";

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if (isset($_GET['q'])) {
        $q = htmlspecialchars($_GET['q']);
        $parameters = $arrayName = array("q" => $q, "count" => 100);

        if (isset($_GET['geocode'])) {
          $geocode = htmlspecialchars($_GET['geocode']);
          $parameters["geocode"] = $geocode;
        }

        $search = $connection->get("search/tweets", $parameters);
        echo json_encode($search);
    }
}

?>
