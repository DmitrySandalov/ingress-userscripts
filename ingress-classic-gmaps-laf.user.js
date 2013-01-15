// ==UserScript==
// @id             www.ingress.com-f4dbd255-58ee-4873-988a-b2265a876000@scriptish
// @name           Restore Google Maps Classic For Ingress Intel
// @version        1
// @namespace      https://gist.github.com/4439073
// @updateURL      https://gist.github.com/raw/4439073/ingress-classic-gmaps-laf.user.js
// @downloadURL    https://gist.github.com/raw/4439073/ingress-classic-gmaps-laf.user.js
// @description    Restores the classical Google Maps style to the Ingress intel map
// @include        http://www.ingress.com/intel
// @run-at         document-end
// ==/UserScript==

// Public Domain

var script = document.createElement("script");
var code = document.createTextNode('window.xd = [{featureType:"poi", stylers:[{visibility:"off"}]}, {featureType:"transit", elementType:"all", stylers:[{visibility:"off"}]}];');
script.appendChild(code);
document.body.appendChild(script);
