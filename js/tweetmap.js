var map;
var content;
var geocoder;
var infowindow;
var currentPos;

var delay = 100;
var nextIndex = 0;
var markerIndex = 0;
var tweetArray = [];
var markers = [];

var icon = "../res/twitter_blue.png";
var icon_pop = "../res/twitter_icon_popular.png";

function CenterControl(controlDiv, map) {

    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlDiv.appendChild(controlUI);

    var controlSearch = document.createElement('input');
    controlSearch.setAttribute('type', 'textbox');
    controlSearch.setAttribute('placeholder', '#Cavaliers, Beyonce');
    controlUI.appendChild(controlSearch);

    /*var controlRadius = document.createElement('input');
    controlRadius.setAttribute('type', 'range');
    controlRadius.setAttribute('value', 10);
    controlRadius.setAttribute('min', 10);
    controlRadius.setAttribute('max', 100);
    controlRadius.setAttribute('step', 10);
    controlRadius.style.cursor = 'pointer';
    controlUI.appendChild(controlRadius);*/

    var controlSubmit = document.createElement('input');
    controlSubmit.setAttribute('type', 'submit');
    controlSubmit.setAttribute('value', 'Search')
    controlUI.appendChild(controlSubmit);

    controlSubmit.addEventListener('click', function () {
        clearMarkers();
        if (!currentPos && controlSearch.value == '') {
            alert("No location or query");
        } else {
            var geocode = ""
            if (currentPos) {
                map.setCenter(currentPos);
                geocode = currentPos.lat() + ',' + currentPos.lng() + ',' + '10km';
            }
            var query = encodeURIComponent(controlSearch.value);
            searchTweets(query, geocode);
        }

    });
}

function initMap() {

    var styleArray = [
        {
            featureType: 'all',
            stylers: [{
                saturation: -50
            }]
        }, {
            featureType: 'road.arterial',
            elementType: 'geometry',
            stylers: [{
                hue: '#00ffee'
            }, {
                saturation: 50
            }]
        }, {
            featureType: 'poi.business',
            elementType: 'labels',
            stylers: [{
                visibility: 'off'
            }]
        }];

    infowindow = new google.maps.InfoWindow();
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 40.6976701,
            lng: -74.2598661
        },
        zoom: 4,
        styles: styleArray
    });
    geocoder = new google.maps.Geocoder();

    var centerControlDiv = document.createElement('div');
    var centerControl = new CenterControl(centerControlDiv, map);

    centerControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);

    var script = document.createElement('script');
    var url = ['https://www.googleapis.com/fusiontables/v1/query?'];
    url.push('sql=');
    var query = 'SELECT name, kml_4326 FROM ' +
        '1foc3xO9DyfSIF6ofvN0kp2bxSfSeKog5FbdWdQ';
    var encodedQuery = encodeURIComponent(query);
    url.push(encodedQuery);
    url.push('&callback=drawMap');
    url.push('&key=AIzaSyAm9yWCV7JPCTHCJut8whOjARd7pwROFDQ');
    script.src = url.join('');
    var body = document.getElementsByTagName('body')[0];
    body.appendChild(script);

}


function searchTweets(query, geocode) {
    // Dont forgot radius for geocode
    var url = "http://localhost:8888/tweetMap/php/searchtweet.php?q=" + query + "&geocode=" + geocode;
    ajaxGet(url, function (response) {
        var tweets = JSON.parse(response).statuses;
        tweets.forEach(function (tweet) {
            if (tweet.geo != null) {
                var coordinates = tweet.geo.coordinates;
                var latLng = new google.maps.LatLng(coordinates[0], coordinates[1]);
                addMarker(latLng, tweet, true);
                console.log('geo:' + latLng);
            } else if (tweet.user.location != null && tweet.user.location != '') {
                tweetArray.push(tweet);
            }
        });
        theNext();
    });
}

function drawMap(data) {
    var rows = data['rows'];
    for (var i in rows) {
        if (rows[i][0] != 'Antarctica') {
            var newCoordinates = [];
            var geometries = rows[i][1]['geometries'];
            if (geometries) {
                for (var j in geometries) {
                    newCoordinates.push(constructNewCoordinates(geometries[j]));
                }
            } else {
                newCoordinates = constructNewCoordinates(rows[i][1]['geometry']);
            }
            var country = new google.maps.Polygon({
                paths: newCoordinates,
                strokeColor: '#011d34',
                strokeOpacity: 0.5,
                strokeWeight: 0.3,
                fillColor: '#2184ee',
                fillOpacity: 0,
                name: rows[i][0]
            });
            google.maps.event.addListener(country, 'mouseover', function () {
                this.setOptions({
                    fillOpacity: 0.4
                });
            });
            google.maps.event.addListener(country, 'mouseout', function () {
                this.setOptions({
                    fillOpacity: 0
                });
            });
            google.maps.event.addListener(country, 'click', function () {
                // Zoom on country with coordinates
                // Get
                alert(this.name);
            });

            country.setMap(map);
        }
    }
}

function constructNewCoordinates(polygon) {
    var newCoordinates = [];
    var coordinates = polygon['coordinates'][0];
    for (var i in coordinates) {
        newCoordinates.push(
            new google.maps.LatLng(coordinates[i][1], coordinates[i][0]));
    }
    return newCoordinates;
}

function getAddress(tweet, next) {
    var address = tweet.user.location;
    geocoder.geocode({
        'address': address
    }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            var pos = results[0].geometry.location;
            var latLng = pos.lat() + ',' + pos.lng();
            console.log(latLng);
            // Create Marker
            addMarker(pos, tweet, false);
        } else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
            if (nextIndex > 0)
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
        var tweet = tweetArray[nextIndex];
        setTimeout(function () {
            getAddress(tweet, theNext);
        }, delay);
        nextIndex++;
        /*if (nextIndex % 10 == 0) {
            showMarkers();
        }*/
    } else {
        //showMarkers();
    }
}

function addInfowindow(tweetId, marker) {
    var url = "http://localhost:8888/tweetMap/php/tweetdisplay.php?url=";
    var uri = encodeURIComponent("https://twitter.com/user/status/" + tweetId);
    ajaxGet(url + uri, function (response) {
        var embedTweet = JSON.parse(response);
        content = embedTweet.html;
        if (!marker.content) {
            marker.content = content;
        } else {
            marker.content += content;
        }

        google.maps.event.addListener(marker, 'click', (function (marker) {
            return function () {
                infowindow.setContent(marker.content);
                infowindow.open(map, marker);
            }
        })(marker));

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

function addMarker(location, tweet, geo) {
    var marker;
    if (getMarker(location)) {
        marker = getMarker(location);
    } else {
        var iconTweet = geo ? icon_pop : icon;
        marker = new google.maps.Marker({
            icon: iconTweet,
            map: map,
            animation: google.maps.Animation.DROP,
            position: location
        });
        markers.push(marker);
    }
    addInfowindow(tweet.id_str, marker);
}

function getMarker(pos) {
    for (var i = 0; i < markers.length; i++) {
        var markPos = markers[i].getPosition();
        if (markPos.lat() == pos.lat() && markPos.lng() == pos.lng())
            return markers[i];
    }
    return null;
}

function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

function clearMarkers() {
    setMapOnAll(null);
}

function showMarkers() {
    setMapOnAll(map);
}

function deleteMarkers() {
    clearMarkers();
    markers = [];
}
