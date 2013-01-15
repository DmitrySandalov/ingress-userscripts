// ==UserScript==
// @name        ingress.com/intel get link maps
// @description ingress_intel_get_link_map
// @namespace   https://gist.github.com/4536740
// @updateURL   https://gist.github.com/raw/4536740/gistfile1.js
// @downloadURL https://gist.github.com/raw/4536740/gistfile1.js
// @include     http://www.ingress.com/intel
// @version     8
// ==/UserScript==

// Public Domain. Please send improvements or suggestions

(function(){
 
  var script = document.createElement("script");
  script.textContent = "(" + doWork.toString() + ")($);";
  document.body.appendChild(script);
 
  function doWork($) {
   var global = window;
 
   function initialize() {
 
     $('#nav').append('<div class="nav_link"><a id="nav_map_link" href="http://www.ingress.com/intel" target="_blank">Link to Map</a></div>');
 
     // Bind Listener
     google.maps.event.addListener(global.map, "center_changed", centerChanged); 
     google.maps.event.addListener(global.map, "zoom_changed", centerChanged); 
   }
   initialize();
 
   function centerChanged() {
      generateIngressLink( global.map.getCenter(), global.map.getZoom() );
   }
 
   function generateIngressLink(latlng, zoom) {
      var url = 'http://www.ingress.com/intel?latE6=latitude&lngE6=longitude&z=zoom';
      if(!latlng) latlng = global.map.getCenter();
      if(!zoom) zoom = global.map.getZoom();
      lat  = Math.round(latlng.lat() * 1e6);
      lng  = Math.round(latlng.lng() * 1e6);
      url = url.replace('latitude',lat).replace('longitude',lng).replace('zoom',zoom); 
      $("#nav_map_link")[0].href = url;
   }
   centerChanged();
  }
 
})();