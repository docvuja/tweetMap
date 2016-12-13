var map;
var content;
var geocoder;
var delay = 100;
var nextIndex = 0;

var icon = "../res/twitter_icon_little.png";
var icon_pop = "../res/twitter_icon_popular.png";

function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 40.6976701,
            lng: -74.2598661
        },
        zoom: 10
    });
    geocoder = new google.maps.Geocoder();
    searchTweets("", "40.6976701,-74.2598661,10km");

    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(40.6976701, -74.2598661),
        icon: icon_pop,
        map: map,
        title: 'Tweet'
    });

    var marker2 = new google.maps.Marker({
        position: new google.maps.LatLng(40.688559, -74.206308),
        icon: icon_pop,
        map: map,
        title: 'Tweet'
    });

    addInfowindow("807749687944089602", marker);
    addInfowindow("808078161774776320", marker2);

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
                tweetArray.push(tweet.user.location);
                //setInterval(geocodeAddress(geocoder, map, tweet.user.location, tweet.id_str), delay);
            }
            //console.log(tweet.user.location);
        });
        theNext();
    });
}

function addInfowindow(tweetId, marker) {
    var url = "http://localhost:8888/tweetMap/php/tweetdisplay.php?url=";
    var uri = encodeURIComponent("https://twitter.com/user/status/" + tweetId);
    ajaxGet(url + uri, function (response) {
        var embedTweet = JSON.parse(response);
        //console.log(embedTweet);
        content = embedTweet.html + "<div>TEST</div>";

        var infowindow = new google.maps.InfoWindow({
            content: content,
            maxWidth: embedTweet.width,
        });

        marker.addListener('click', function () {
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

function getAddress(tweetLocation, next) {
    var address = tweetLocation;
    geocoder.geocode({
        'address': address
    }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            console.log(results[0].geometry.location.lat());
            // Create marker
        } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
            nextIndex--;
            delay++;
        } else {
            console.log('Geocode was not successful for the following reason: ' + status);
        }
        next();
    });
}

function theNext() {
    if (nextIndex < tweetArray.length) {
        setTimeout(getAddress(tweetArray[nextIndex], theNext), delay);
        nextIndex++;
    }
}

function geocodeAddress(geocoder, resultsMap, place, tweetId) {
    var address = place;
    geocoder.geocode({
        'address': address
    }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            var marker = new google.maps.Marker({
                icon: icon,
                map: resultsMap,
                animation: google.maps.Animation.DROP,
                position: results[0].geometry.location
            });
            addInfowindow(tweetId, marker);
        } else {
            console.log('Geocode was not successful for the following reason: ' + status);
        }
    });
}
