var map;
var markers = [];
var largeInfowindow;
var defaultIcon;
var highlightedIcon;

var viewModel;

var model = [{
        title: 'Imperial Palace',
        location: {
            lat: 35.685360,
            lng: 139.753372
        },
        type: 'Sight'
    },
    {
        title: 'Akihabara',
        location: {
            lat: 35.702190,
            lng: 139.774459
        },
        type: 'Sight'
    },
    {
        title: 'Harajuku',
        location: {
            lat: 35.672010,
            lng: 139.710212
        },
        type: 'Sight'
    },
    {
        title: 'Tokyo Tower',
        location: {
            lat: 35.658772,
            lng: 139.745454
        },
        type: 'Sight'
    },
    {
        title: 'Sensoji Temple',
        location: {
            lat: 35.714948,
            lng: 139.796655
        },
        type: 'Sight'
    },
    {
        title: 'Craft Beer Market',
        location: {
            lat: 35.693382,
            lng: 139.767303
        },
        type: 'Food'
    },
    {
        title: 'Tapas Molecular Bar',
        location: {
            lat: 35.687058,
            lng: 139.772695
        },
        type: 'Food'
    },
    {
        title: 'Hakushu',
        location: {
            lat: 35.656496,
            lng: 139.700942
        },
        type: 'Food'
    }
];

function initMap() {

    var styles = [{
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [{
                    "lightness": 100
                },
                {
                    "visibility": "simplified"
                }
            ]
        },
        {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{
                    "visibility": "on"
                },
                {
                    "color": "#C6E2FF"
                }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#C5E3BF"
            }]
        },
        {
            "featureType": "road",
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#D1D1B8"
            }]
        }
    ];
    //initialize new google map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 35.652832,
            lng: 139.839478
        },
        zoom: 11,
        styles: styles,
        mapTypeControl: false
    });

    viewModel = new ViewModel();

    ko.applyBindings(viewModel);

    defaultIcon = makeMarkerIcon('FE7569');

    highlightedIcon = makeMarkerIcon('7a9460');

    viewModel.makeMarkers();
    //variable to be used in populating markers' infowindows
    largeInfowindow = new google.maps.InfoWindow();
}

function googleError() {
    alert('Google Maps failed to load.');
}
//function to populate marker-specific infowindow on click
function makeInfoWindow(marker, infowindow) {
    if (infowindow.marker != marker) {
        var infoContent = '<div>' + marker.title + '</div><div id="pano"></div>';
        //infowindow.setContent('');
        infowindow.marker = marker;

        infowindow.addListener('closeclick', function() {
            marker.setAnimation(null);
            infowindow.marker = null;
        });
        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;

      var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title +
      '&limit=1&format=json&callback=wikiCallback';
      var $listview = $('#listview');
      var wikiurl;

      var wikiReqTimeOut = setTimeout(function() {
        alert('Failed to load Wikipedia link.');
      }, 5000);

      $.ajax({
        url: wikiUrl,
        type: 'GET',
        dataType: "jsonp",
        success: function(response) {
          var wikiLink = response[3];

          if (wikiLink.length != 0) {
            infoContent = infoContent + '<br><a href=' + wikiLink +'>' + wikiLink + '</a>';
          } else {
            infoContent += '<br><p>Unable to find wikipedia link</p>';
          }
        infowindow.setContent(infoContent);
        clearTimeout(wikiReqTimeOut);
      }
    });

        //function to get streetview object from google maps api, from course
        function getStreetView(data, status) {
          console.log(google.maps.StreetViewStatus.OK);
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                infowindow.setContent(infoContent);
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions);
            } else {
                infowindow.setContent('<div>' + marker.title + '</div>' +
                    '<div>No Street View Found</div>');
            }
        }
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);

        infowindow.open(map, marker);
    }
};

function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
};
//why does this change the shape of the original markers, is it the same image?
function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21, 34));
    return markerImage;
}



var Location = function(data, marker) {
    this.title = data.title;
    this.type = data.type;
    this.location = data.location;
    this.isVisible = ko.observable('true');
    this.marker = marker;



    this.marker.addListener('click', function() {
        makeInfoWindow(this, largeInfowindow);
    });

    this.marker.addListener('click', function() {
        toggleBounce(this);
    });

    this.marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
    });

    this.marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
    });
};

var ViewModel = function() {
    var self = this;
    this.locationTypes = ko.observableArray(["All", "Food and Drink", "Popular Sights"]);
    this.locationList = ko.observableArray([]);
    this.newSearch = ko.observable("");
    this.selectedOption = ko.observable("");

    this.animateMarker = function(location) {
        var marker = location.marker;
        google.maps.event.trigger(marker, 'click');
        map.setCenter(location.location);
        map.setZoom(12);
    };

    this.makeMarkers = function() {
        for (i = 0; i < model.length; i++) {
            var position = model[i].location;
            var title = model[i].title;

            var marker = new google.maps.Marker({
                position: position,
                map: map,
                title: title,
                animation: google.maps.Animation.DROP,
                id: i,
                icon: defaultIcon
            });

            self.locationList.push(new Location(model[i], marker));
            markers.push(marker);
        };
    };

    this.hideMarkers = function() {
        for (i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
    };

    this.showMarkers = function() {
        for (i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
        }
    }

    this.addMarker = function() {
        var i = model.length - 1;
        var position = model[i].location;
        var title = model[i].title;

        var marker = new google.maps.Marker({
            position: position,
            map: map,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i,
            icon: defaultIcon
        });
        self.locationList.push(new Location(model[i], marker));
        markers.push(marker);
    }

    this.filter = ko.computed(function() {
        var selectType = self.selectedOption();
        var checkType;

        if (selectType === "Food and Drink") {
          checkType = "Food";
        } else if (selectType === "Popular Sights") {
          checkType = "Sight";
        } else {
          checkType = "All";
        }
        self.locationList().forEach(function(location){
          var match;
          if (checkType === "All") {
            match = true;
          } else {
            match = (checkType == location.type);
          }
        location.isVisible(match);
        location.marker.setVisible(match);
        })
    });


    this.searchPlaces = function() {
        var input = this.newSearch();
        var searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        map.addListener('bounds_changed', function() {
            searchBox.setBounds(map.getBounds());
        });
        var bounds = map.getBounds();
        this.hideMarkers();
        var placesSer = new google.maps.places.PlacesService(map);
        placesSer.textSearch({
            query: this.newSearch(),
            bounds: bounds
        }, function(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                console.log("Success");
            }
        });
    }

    this.zoomToSearch = function() {
        var geocoder = new google.maps.Geocoder();
        var address = this.newSearch();
        if (address == '') {
            window.alert('You must enter a place or address.');
        } else {

            geocoder.geocode({
                address: address
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    map.setCenter(results[0].geometry.location);
                    map.setZoom(12);
                } else {
                    window.alert('Error: Try a more specific address');
                }
            });
        }
        this.newSearch("");
    }


};


