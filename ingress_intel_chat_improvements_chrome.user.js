// ==UserScript==
// @name        ingress.com/intel chat improvements
// @description Small improvements to the Ingress Chat at ingress.com/intel. 1. Better distinction between public/faction chat. Prevents accidentally posting to public. 2. Switch to faction chat by default. 3. Ability to hide automated messages (will consume a LOT of CPU though, so beware). 4. Scrolling up in chat issmoother (less “Loading…”) 5. Bits and pieces.
// @namespace   https://gist.github.com/4415985
// @updateURL   https://gist.github.com/raw/4415985/ingress_intel_chat_improvements.user.js
// @downloadURL https://gist.github.com/raw/4415985/ingress_intel_chat_improvements.user.js
// @include     http://www.ingress.com/intel
// @version     7
// ==/UserScript==

// Public Domain. Please send improvements or suggestions
// to stefan+ingress@mathphys.fsk.uni-heidelberg.de

(function(){
  function doStuffBefore() {
    // try to load chat early
    if(Re.prototype.$c.toString().indexOf("this.G.scrollTop") > 0) {
      Re.prototype.$c = function(a) {
        // load early, but only if there isn't already an ongoing loading
        this.G.scrollTop <= 1200 && document.getElementById("pl_spinner") === null && a()
      }
    }
  }

  // inject as inline script element. So it executes after the ingress
  // files have been loaded, but before they are executed.
  var script = document.createElement("script");
  var code = document.createTextNode(doStuffBefore.toString() + " doStuffBefore();");
  script.appendChild(code);
  document.getElementsByTagName("head")[0].appendChild(script);




  var script = document.createElement("script");
  script.textContent = "(" + doStuffAfter.toString() + ")($);";
  document.body.appendChild(script);


  function doStuffAfter($) {
    // don't complete old messages
    $("input#message, #passcode").attr("autocomplete", "off");

    // rename 'all' tab
    $("#pl_tab_all").text("Public");

    // inject styles into page
    $("head").append("<style>"
      // hide restrict to map checkbox (who unchecks that anyway?)
      + "#pl_checkbox, #pl_checkbox_text { display: none }"
      // hide superfluous [secure] messages in faction chat
      + ".chatFaction .pl_secure { display: none }"
      // color faction yellow, so you know if the script is broken and
      // you not really in faction chat
      + ".chatFaction #plext_container { background: rgba(64, 64, 37, 0.9) !important; }"
      // there are no bot messages in faction chat, so hide the checkbox
      + ".chatFaction #hide_bot_stuff_checkbox { display: none }"
      + ".chatFaction #hide_bot_stuff_lbl { display: none }"
      // place that checkbox somewhere less annoying
      + "#plext_viewport_restrict_checkbox_container { background: #272E32; box-shadow: none; right: 182px; padding-right:5px; top:21px }"
      // color 'all' chat red
      + ".chatDanger #plext_container { background: rgba(54, 30, 30, 0.9) !important; }"
      + ".chatDanger #message { background: #361E1E !important } "
      // hide unwanted plexts
      + ".hidePlext, .hidePlext2 { display:block;overflow:hidden;height:0;visiblity: hidden } </style>");

    // listen for chat changes and add proper class to the chat elements
    $("#pl_tab_all").click(function() {
      $("#comm").addClass("chatDanger");
      $("#comm").removeClass("chatFaction");
      $("#message").attr("placeholder", "broadcast to everyone").focus();
      botMessages();
    });
    $("#pl_tab_fac").click(function() {
      $("#comm").removeClass("chatDanger");
      $("#comm").addClass("chatFaction");
      $("#message").attr("placeholder", "message faction").focus();
    });

    // switch to faction chat by default
    $("#pl_tab_fac").click();

    // insert msg only checkbox
    $("#pl_checkbox_text").after(''
      + '  <input id="hide_bot_stuff_checkbox" type="checkbox">'
      + '  <label id="hide_bot_stuff_lbl" for="hide_bot_stuff_checkbox">hide bot msgs</label>');

    // hides or shows bot messages depending on checkbox state. Also
    // hides faction chat messages in 'all' chat
    function botMessages() {
      // hide faction chat in 'all' chat
      $(".chatDanger .pl_secure").parent().parent().addClass("hidePlext2");

      var hide = $("#hide_bot_stuff_checkbox").is(":checked");
      if(hide)
        $(".pl_broad, .pl_narrow").parent().addClass("hidePlext");
      else
        $(".hidePlext").removeClass("hidePlext");
    }

    // listen for clicks on checkbox and chat loading events
    $("#hide_bot_stuff_checkbox").click(function() {
      // find top element
      elm = document.elementFromPoint(20, $(window).height() - $("#plext_container").height() - 20);
      botMessages();
      elm.scrollIntoView();
    });
    $("#pl_status").bind("DOMSubtreeModified", function() {
      // only run when loading notice gets removed
      if($(this).children().length != 0) return;
      // only run in 'all' chat
      if(!$("#comm").hasClass("chatDanger")) return;

      var p = document.getElementById("plext_container");
      var before = p.scrollHeight - p.scrollTop;
      botMessages();
      var hide = $("#hide_bot_stuff_checkbox").is(":checked");

      // if there are very few chat messages enforce loading more
      if($("#plexts").height() < 450) {
        var f = $("#plext_container .plext:visible:first");
        f.height(600);
        p.scrollTop = 1;
        f.height("");
      }

      // fix scrolling position
      p.scrollTop = p.scrollHeight - before;
    });

    // prevent passcode field from collapsing and expand it right away
    $("#passcode").attr("onmouseout", "");
    // need timeout for Chrome
    setTimeout("showpi(true);", 10);
  }
})();
