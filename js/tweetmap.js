var map;
var content;

function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 40.6976701,
            lng: -74.2598661
        },
        zoom: 11
    });

    /*var content = '<blockquote class="twitter-tweet"><a href="https://twitter.com/NBA/status/807749687944089602"></blockquote><script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>'*/
    ajaxGet("http://localhost:8888/tweetMap/php/tweetdisplay.php", function (response) {
        var embedTweet = JSON.parse(response);
        console.log(embedTweet);
        content = embedTweet.html;

        var infowindow = new google.maps.InfoWindow({
            content: content
        });

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(40.6976701, -74.2598661),
            map: map,
            title: 'Tweet'
        });
        marker.addListener('click', function () {
            infowindow.open(map, marker);
        });

        google.maps.event.addListener(infowindow, 'domready', function () {
            ! function (d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (!d.getElementById(id)) {
                    js = d.createElement(s);
                    js.id = id;
                    js.src = "//platform.twitter.com/widgets.js";
                    fjs.parentNode.insertBefore(js, fjs);
                }
            }(document, "script", "twitter-widgets");
        });
    });






}


tweetArray = []
ajaxGet("http://localhost:8888/tweetMap/php/tweetmap.php", function (response) {
    var tweets = JSON.parse(response).statuses;
    console.log(tweets);
    tweets.forEach(function (tweet) {
        if (tweet.geo != null)
            console.log('geo' + tweet.geo);
        else if (tweet.user.location != null)
            console.log(tweet.user.location);
    });
});