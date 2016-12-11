<?php 

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if (isset($_GET['url'])) {
        $url = htmlspecialchars($_GET['url']);
        $publishUrl = "https://publish.twitter.com/oembed?url=".$url;
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $publishUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $result = curl_exec($ch);
        curl_close($ch);
        echo $result;
    }
}

?>
