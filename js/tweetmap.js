var map;
var content;
var geocoder;
var infowindow;
var currentPos;

var places = new Map();

var delay = 100;
var nextIndex = 0;
var markerIndex = 0;
var tweetArray = [];
var markers = [];

var icon = "../res/twitter_blue.png";
var icon_pop = "../res/twitter_icon_popular.png";

function CenterControl(controlDiv) {

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

function LeftControl(controlDiv, map) {

    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.marginBottom = '22px';
    controlUI.style.textAlign = 'center';
    controlDiv.appendChild(controlUI);

    var controlTitle = document.createElement('p');
    controlTitle.id = "trends-title";
    controlTitle.textContent = "Trends : ";
    controlUI.appendChild(controlTitle);

    var controlList = document.createElement('ul');
    controlList.id = "trends";
    controlUI.appendChild(controlList);
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
            lat: 51.4825766,
            lng: -0.0098476
        },
        zoom: 3,
        styles: styleArray
    });
    geocoder = new google.maps.Geocoder();

    var centerControlDiv = document.createElement('div');
    var centerControl = new CenterControl(centerControlDiv);
    centerControlDiv.index = 1;

    var leftControlDiv = document.createElement('div');
    var leftControl = new LeftControl(leftControlDiv);
    leftControlDiv.index = 2;

    map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);
    map.controls[google.maps.ControlPosition.LEFT_CENTER].push(leftControlDiv);

    loadPolygon();
    fillPlace();

}

// TWITTER

function searchTweets(query, geocode) {
    // Dont forgot radius for geocode
    clearMarkers();
    var url = "http://localhost:8888/tweetMap/php/searchtweet.php?q=" + query + "&geocode=" + geocode;
    ajaxGet(url, function (response) {
        var tweets = JSON.parse(response).statuses;
        console.log(tweets);
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

function fillPlace() {
    var url = "http://localhost:8888/tweetMap/php/trend.php";
    ajaxGet(url, function (response) {
        var trendPlaces = JSON.parse(response);
        var countries = trendPlaces.filter(function (place) {
            return place.placeType.name === "Country";
        })
        countries.forEach(function (country) {
            places.set(country.name, country.woeid);
        })
    });
}

function trendByPlace(woeid) {
    var url = "http://localhost:8888/tweetMap/php/trend.php?woeid=" + woeid;
    ajaxGet(url, function (response) {
        var parsed = JSON.parse(response)[0];
        var trends = parsed.trends;
        var country = parsed.locations[0].name;
        console.log(parsed);

        var trendTitle = document.getElementById('trends-title');
        trendTitle.innerHTML = "Trends :" + country;
        var trendControl = document.getElementById('trends');

        while (trendControl.hasChildNodes()) {
            trendControl.removeChild(trendControl.lastChild);
        }

        for (var i = 0; i < 9; i++) {
            if (i > trends.length)
                break;
            var trend = trends[i];
            var trendLi = document.createElement('li');
            trendLi.innerHTML = trend.name;
            trendLi.setAttribute('id', trend.query);
            trendLi.style.cursor = 'pointer';
            trendLi.addEventListener('click', function () {
                console.log(this.id);
                searchTweets(this.id, '');
            }, false);
            trendControl.appendChild(trendLi);

        }

    });
}

// POLYGON

function loadPolygon() {
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
                zoomIn(this.getPath());
                var woeid = places.get(this.name);
                trendByPlace(woeid);
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

function zoomIn(polygon) {
    var bounds = new google.maps.LatLngBounds();
    polygon.forEach(function (coordinate) {
        bounds.extend(coordinate);
    });

    map.fitBounds(bounds);
}

// GEOCODE

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
        console.log(nextIndex);
        //showMarkers();
    }
}

// MARKER

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
