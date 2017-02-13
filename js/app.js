var map;
var markers = [];
var largeInfowindow;
var defaultIcon;
var highlightedIcon;

var viewModel;

var model = [{
    title: 'Imperial Palace & East Garden (皇居)',
    location: {
      lat: 35.685360,
      lng: 139.753372
    }
  },
  {
    title: 'Akihabara Electric Town (秋葉原)',
    location: {
      lat: 35.702190,
      lng: 139.774459
    }
  },
  {
    title: 'Harajuku',
    location: {
      lat: 35.672010,
      lng: 139.710212
    }
  },
  {
    title: 'Tokyo Tower',
    location: {
      lat: 35.658772,
      lng: 139.745454
    }
  },
  {
    title: 'Sensōji Temple',
    location: {
      lat: 35.714948,
      lng: 139.796655
    }
  },
  {
    title: 'Craft Beer Market',
    location: {
      lat: 35.693382,
      lng: 139.767303
    }
  },
  {
    title: 'Tapas Molecular Bar',
    location: {
      lat: 35.687058,
      lng: 139.772695
    }
  },
  {
    title: 'Hakushu Teppanyaki 白秋',
    location: {
      lat: 35.656496,
      lng: 139.700942
    }
  }
];

function initMap() {

    var styles = [
    {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
            {
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
        "stylers": [
            {
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
        "stylers": [
            {
                "color": "#C5E3BF"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#D1D1B8"
            }
        ]
    }
];
    //initialize new google map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 35.652832, lng: 139.839478},
        zoom: 11,
        styles: styles,
        mapTypeControl: false
    });
    //Search
    var input = document.getElementById("search");
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    map.addListener('bounds_changed', function() {
      searchBox.setBounds(map.getBounds());
    });

    viewModel.makeMarkers();
    //variable to be used in populating markers' infowindows
    largeInfowindow = new google.maps.InfoWindow();

    defaultIcon = makeMarkerIcon('00FF00');

    highlightedIcon = makeMarkerIcon('FFFF24');
}
    //function to populate marker-specific infowindow on click
    function makeInfoWindow(marker, infowindow) {
        if (infowindow.marker != marker) {
          infowindow.setContent('');
          infowindow.marker = marker;

          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
          var streetViewService = new google.maps.StreetViewService();
          var radius = 50;
          //function to get streetview object from google maps api, from course
          function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
              var nearStreetViewLocation = data.location.latLng;
              var heading = google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation, marker.position);
                infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                var panoramaOptions = {
                  position: nearStreetViewLocation,
                  pov: {
                    heading: heading,
                    pitch: 30
                  }
                };
              var panorama = new google.maps.StreetViewPanorama(
                document.getElementById('pano'), panoramaOptions);
            } else {//Is this okay to keep?  It's manipulating the DOM, correct?
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

    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21,34));
        return markerImage;
    }

var Location = function(data, marker) {
  this.title = ko.observable(data.title);

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
    this.locationList = ko.observableArray([]);
    // model.forEach(function(item){
    //   self.locationList.push(new Location(item));
    // });
    this.animateMarker = function(location) {
      var marker = location.marker;
      google.maps.event.trigger(marker, 'click');
    };

    this.makeMarkers = function() {
      for(i = 0; i < model.length; i++) {
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
      for(i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
      }
    };

    this.showMarkers = function() {
      for(i = 0; i < markers.length; i++) {
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

    this.newTitle = ko.observable("");
    this.newLat = ko.observable("");
    this.newLng = ko.observable("");
    this.addLocation = function() {
      if (this.newTitle() != "" && this.newLat() != "" && this.newLng() != "") {
        model.push({title: this.newTitle(), location: {lat: Number(this.newLat()), lng: Number(this.newLng())}});
        this.addMarker();
        this.newTitle("");
        this.newLat("");
        this.newLng("");
      }
    }.bind(this);
};

viewModel = new ViewModel();

ko.applyBindings(viewModel);

