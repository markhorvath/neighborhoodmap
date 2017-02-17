function initMap(){var a=[{featureType:"road",elementType:"geometry",stylers:[{lightness:100},{visibility:"simplified"}]},{featureType:"water",elementType:"geometry",stylers:[{visibility:"on"},{color:"#C6E2FF"}]},{featureType:"poi",elementType:"geometry.fill",stylers:[{color:"#C5E3BF"}]},{featureType:"road",elementType:"geometry.fill",stylers:[{color:"#D1D1B8"}]}];map=new google.maps.Map(document.getElementById("map"),{center:{lat:35.652832,lng:139.839478},zoom:11,styles:a,mapTypeControl:!1}),viewModel=new ViewModel,ko.applyBindings(viewModel),defaultIcon=makeMarkerIcon("FE7569"),highlightedIcon=makeMarkerIcon("7a9460"),viewModel.makeMarkers(),largeInfowindow=new google.maps.InfoWindow}function googleError(){alert("Google Maps failed to load.")}function makeInfoWindow(a,b){function h(d,e){if(e==google.maps.StreetViewStatus.OK){var f=d.location.latLng,g=google.maps.geometry.spherical.computeHeading(f,a.position);b.setContent(c);var h={position:f,pov:{heading:g,pitch:30}};new google.maps.StreetViewPanorama(document.getElementById("pano"),h)}else b.setContent("<div>No Street View Found</div>"+c)}if(b.marker!=a){var c="<div>"+a.title+'</div><div id="pano"></div>';b.marker=a,b.addListener("closeclick",function(){a.setAnimation(null),b.marker=null});var d=new google.maps.StreetViewService,e=50,f="https://en.wikipedia.org/w/api.php?action=opensearch&search="+a.title+"&limit=1&format=json&callback=wikiCallback",g=setTimeout(function(){alert("Failed to load Wikipedia link.")},5e3);$.ajax({url:f,type:"GET",dataType:"jsonp",success:function(f){var i=f[3];c+=0!=i.length?"<br><a href="+i+">"+i+"</a>":"<br><p>Unable to find wikipedia link</p>",b.setContent(c),clearTimeout(g),d.getPanoramaByLocation(a.position,e,h)}}),b.open(map,a)}}function toggleBounce(a){null!==a.getAnimation()?a.setAnimation(null):a.setAnimation(google.maps.Animation.BOUNCE)}function makeMarkerIcon(a){var b=new google.maps.MarkerImage("http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|"+a+"|40|_|%E2%80%A2",new google.maps.Size(21,34),new google.maps.Point(0,0),new google.maps.Point(10,34),new google.maps.Size(21,34));return b}var map,markers=[],largeInfowindow,defaultIcon,highlightedIcon,viewModel,model=[{title:"Imperial Palace",location:{lat:35.68536,lng:139.753372},type:"Sight"},{title:"Akihabara",location:{lat:35.70219,lng:139.774459},type:"Sight"},{title:"Harajuku",location:{lat:35.67201,lng:139.710212},type:"Sight"},{title:"Tokyo Tower",location:{lat:35.658772,lng:139.745454},type:"Sight"},{title:"Sensoji Temple",location:{lat:35.714948,lng:139.796655},type:"Sight"},{title:"Craft Beer Market",location:{lat:35.693382,lng:139.767303},type:"Food"},{title:"Tapas Molecular Bar",location:{lat:35.687058,lng:139.772695},type:"Food"},{title:"Ichiran",location:{lat:35.664786,lng:139.701864},type:"Food"}],Location=function(a,b){this.title=a.title,this.type=a.type,this.location=a.location,this.isVisible=ko.observable("true"),this.marker=b,this.marker.addListener("click",function(){makeInfoWindow(this,largeInfowindow)}),this.marker.addListener("click",function(){toggleBounce(this)}),this.marker.addListener("mouseover",function(){this.setIcon(highlightedIcon)}),this.marker.addListener("mouseout",function(){this.setIcon(defaultIcon)})},ViewModel=function(){var a=this;this.locationTypes=ko.observableArray(["All","Food and Drink","Popular Sights"]),this.locationList=ko.observableArray([]),this.newSearch=ko.observable(""),this.selectedOption=ko.observable(""),this.animateMarker=function(a){var b=a.marker;google.maps.event.trigger(b,"click"),map.setCenter(a.location),map.setZoom(12)},this.makeMarkers=function(){for(i=0;i<model.length;i++){var b=model[i].location,c=model[i].title,d=new google.maps.Marker({position:b,map:map,title:c,animation:google.maps.Animation.DROP,id:i,icon:defaultIcon});a.locationList.push(new Location(model[i],d)),markers.push(d)}},this.hideMarkers=function(){for(i=0;i<markers.length;i++)markers[i].setMap(null)},this.showMarkers=function(){for(i=0;i<markers.length;i++)markers[i].setMap(map)},this.addMarker=function(){var b=model.length-1,c=model[b].location,d=model[b].title,e=new google.maps.Marker({position:c,map:map,title:d,animation:google.maps.Animation.DROP,id:b,icon:defaultIcon});a.locationList.push(new Location(model[b],e)),markers.push(e)},this.filter=ko.computed(function(){var c,b=a.selectedOption();c="Food and Drink"===b?"Food":"Popular Sights"===b?"Sight":"All",a.locationList().forEach(function(a){var b;b="All"===c||c==a.type,a.isVisible(b),a.marker.setVisible(b)})}),this.searchPlaces=function(){var a=this.newSearch(),b=new google.maps.places.SearchBox(a);map.controls[google.maps.ControlPosition.TOP_LEFT].push(a),map.addListener("bounds_changed",function(){b.setBounds(map.getBounds())});var c=map.getBounds();this.hideMarkers();var d=new google.maps.places.PlacesService(map);d.textSearch({query:this.newSearch(),bounds:c})},this.zoomToSearch=function(){var a=new google.maps.Geocoder,b=this.newSearch();""==b?window.alert("You must enter a place or address."):a.geocode({address:b},function(a,b){b==google.maps.GeocoderStatus.OK?(map.setCenter(a[0].geometry.location),map.setZoom(12)):window.alert("Error: Try a more specific address")}),this.newSearch("")}};