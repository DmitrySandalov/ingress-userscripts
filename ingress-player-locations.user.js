// ==UserScript==
// @name Ingress Player Locations
// @description Shows player locations on the Ingress Intel Map
// @version 1.2
// @match http://www.ingress.com/intel
// @run-at document-start
// ==/UserScript==

function override() {

window.addEventListener('load', function() {

var df_orig = window.df;

window.df = function(a) {
  df_orig(a);
  window.map = a.h;
};


window.players = {};
var cd_orig = Lc.prototype.cd;

var blueIcon = 'https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png';
var greenIcon = 'https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png';


function timeSince(date) {
  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = Math.floor(seconds / 31536000);

  if (interval > 1) {
    return interval + " years ago";
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return interval + " months ago";
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return interval + " days ago";
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return interval + " hours ago";
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return interval + " minutes ago";
  }
  return Math.floor(seconds) + " seconds ago";
}


Lc.prototype.cd = function(a, b, c) {
  if (a != 'dashboard.getPaginatedPlextsV2' || !c.hasOwnProperty('result')) {
    return cd_orig.call(this, a, b, c);
  }
  var newPlayerData = {};
  for (var i = 0; i < c['result'].length; i++) {
    var plext = c['result'][i][2]['plext'];
    if (plext['plextType'] == 'SYSTEM_BROADCAST') {
      var markup = plext['markup'];
      var player;
      var team;
      var timestamp = c['result'][i][1];
      for (var j = 0; j < markup.length; j++) {
        if (markup[j][0] == 'PLAYER') {
          player = markup[j][1]['plain'];
          team = markup[j][1]['team'];
        } else if (markup[j][0] == 'PORTAL') {
          var portal = markup[j][1];
          var latLng = new google.maps.LatLng(
              portal['latE6'] / 1E6,
              portal['lngE6'] / 1E6);
          if (newPlayerData.hasOwnProperty(player) &&
              newPlayerData[player][0] > timestamp) {
            continue;
          }
          newPlayerData[player] = [timestamp, team, latLng];
        }
      }
    }
  }
  for (var player in newPlayerData) {
    var playerData = newPlayerData[player];
    var timestamp = playerData[0];
    var team = playerData[1];
    var latLng = playerData[2];
    if (players.hasOwnProperty(player)) {
      var marker = players[player][1];
      marker.setTitle(player + ' (' + timeSince(new Date(timestamp)) + ')');
      if (players[player][0] < timestamp) {
        players[player][0] = timestamp;
        marker.setAnimation(null);
        if (marker.getPosition().lat() == latLng.lat() &&
            marker.getPosition().lng() == latLng.lng()) {
          marker.setAnimation(google.maps.Animation.BOUNCE);
          window.setTimeout(function(marker) { marker.setAnimation(null); }, 5000, marker);
        } else {
          // Animate the marker movement to the new destination.
          frames = [];
          var oldLat = marker.getPosition().lat();
          var oldLng = marker.getPosition().lng();
          var newLat = latLng.lat();
          var newLng = latLng.lng();
          for (var percent = 0; percent < 1; percent += 0.01) {
            var curLat = oldLat + percent * (newLat - oldLat);
            var curLng = oldLng + percent * (newLng - oldLng);
            frames.push(new google.maps.LatLng(curLat, curLng));
          }

          var move = function(marker, latLngs, index, wait) {
            marker.setPosition(latLngs[index]);
            if (index != latLngs.length - 1) {
              // call the next "frame" of the animation
              setTimeout(function() {
                move(marker, latLngs, index + 1, wait);
              }, wait);
            }
          };
          move(marker, frames, 0, 20);
        }
      }
    } else {
      players[player] = [timestamp, new google.maps.Marker({
        map: window.map,
        position: latLng,
        animation: google.maps.Animation.DROP,
        title: player + ' (' + timeSince(new Date(timestamp)) + ')',
        icon: team == 'RESISTANCE' ? blueIcon : greenIcon
      })];
    }
  }
  return cd_orig.call(this, a, b, c);
};

});

}

var script = document.createElement('script');
script.appendChild(document.createTextNode('('+ override +')();'));
(document.body || document.head || document.documentElement).appendChild(script);
