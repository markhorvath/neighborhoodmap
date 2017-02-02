var map;

var markers = [];

function initMap() {
    //initialize new google map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 38.907192, lng: -77.036871},
        zoom: 11,
        styles: styles,
        mapTypeControl: false
    });


}