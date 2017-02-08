var map;
var markers = [];

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
    //initialize new google map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 35.652832, lng: 139.839478},
        zoom: 11,
        //styles: styles,
        mapTypeControl: false
    });
    //variable to be used in populating markers' infowindows
    var largeInfowindow = new google.maps.InfoWindow();

    var defaultIcon = makeMarkerIcon('FE7569');

    var highlightedIcon = makeMarkerIcon('FFFF24');
    //For loop to create markers based on Model locations data
    for (i = 0; i < model.length; i++){
        var position = model[i].location;
        var title = model[i].title;

        var marker = new google.maps.Marker({
            position: position,
            map: map,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });

        markers.push(marker);

        marker.addListener('click', function() {
          makeInfoWindow(this, largeInfowindow);
        });

        marker.addListener('click', function() {
          toggleBounce(this);
        });

        marker.addListener('mouseover', function() {
          this.setIcon(highlightedIcon);
        });

        marker.addListener('mouseout', function() {
          this.setIcon(defaultIcon);
        });
    };
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
            } else {
              infowindow.setContent('<div>' + marker.title + '</div>' +
                '<div>No Street View Found</div>');
            }
          }
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);

          infowindow.open(map, marker);
        }
    }
    //does this need to be an IFFE?  as of now it only animates the last marker
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
    //I shouldn't use getElementById here, but is it best to put the function in ViewModel or initMap?
    document.getElementById('hide-loc').addEventListener('click', function() {
        for(i = 0; i < markers.length; i++) {
          markers[i].setMap(null);
        }
    });
    document.getElementById('show-loc').addEventListener('click', function() {
        for(i = 0; i < markers.length; i++) {
          markers[i].setMap(map);
        }
    });
};

var Location = function(data) {
  this.title = ko.observable(data.title);
};

var ViewModel = function() {
    var self = this;
    this.locationList = ko.observableArray([]);
    model.forEach(function(item){
      self.locationList.push(new Location(item));
    });
};

viewModel = new ViewModel();

ko.applyBindings(viewModel);