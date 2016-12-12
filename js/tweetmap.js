var map;
var content;
var geocoder;

function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 40.6976701,
            lng: -74.2598661
        },
        zoom: 11
    });
    geocoder = new google.maps.Geocoder();
    searchTweets("", "40.6976701,-74.2598661,10km");

    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(40.6976701, -74.2598661),
        map: map,
        title: 'Tweet'
    });

    var marker2 = new google.maps.Marker({
        position: new google.maps.LatLng(40.688559, -74.206308),
        map: map,
        title: 'Tweet'
    });

    makeInfowindow("807749687944089602", marker);
    makeInfowindow("808078161774776320", marker2);

}


var tweetArray = []

function searchTweets(query, geocode) {
    // Dont forgot radius for geocode
    var url = "http://localhost:8888/tweetMap/php/searchtweet.php?q=" + query + "&geocode=" + geocode;
    ajaxGet(url, function (response) {
        var tweets = JSON.parse(response).statuses;
        //console.log(tweets);
        tweets.forEach(function (tweet) {
            if (tweet.geo != null)
                console.log('geo' + tweet.geo);
            else if (tweet.user.location != null) {
                //geocodeAddress(geocoder, map, tweet.user.location);
            }
            //console.log(tweet.user.location);
        });
    });
}

function makeInfowindow(tweetId, marker) {
    var url = "http://localhost:8888/tweetMap/php/tweetdisplay.php?url=";
    var uri = encodeURIComponent("https://twitter.com/user/status/" + tweetId);
    ajaxGet(url + uri, function (response) {
        var embedTweet = JSON.parse(response);
        content = embedTweet.html;

        var infowindow = new google.maps.InfoWindow({
            content: content
        });

        marker.addListener('click', function () {
            infowindow.close();
            infowindow.open(map, marker);
        });

        google.maps.event.addListener(infowindow, 'domready', function () {
            ! function (d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                js = d.createElement(s);
                js.id = id;
                js.src = "//platform.twitter.com/widgets.js";
                fjs.parentNode.insertBefore(js, fjs);
            }
            (document, "script", "twitter-widgets");
        });
    });
}


function geocodeAddress(geocoder, resultsMap, place) {
    var address = place;
    geocoder.geocode({
        'address': address
    }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            var marker = new google.maps.Marker({
                map: resultsMap,
                position: results[0].geometry.location
            });
        } else {
            console.log('Geocode was not successful for the following reason: ' + status);
        }
    });
}
