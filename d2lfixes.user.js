// ==UserScript==
// @name 			Desire2Learn Fixes [Refuse2Logout]
// @author			Matt Rasband [nerdwaller] Check readme for contribs.
// @namespace		http://github.com/nerdwaller
// @include			https://worldclass.regis.edu/*
// @match			https://worldclass.regis.edu/*
// @description		Fixes various issues with the D2L platform. 
// @version			0.1
// ==/UserScript==

var discussRegex = new RegExp("d2l/lms/discussions/");
var emailRegex = new RegExp("d2l/lms/email(/|$)");

if (document.URL.match(discussRegex)) {
    addStylesheet();
	processPosts();
	processDiscussionList();
}

removeLinkDecorations();

// Forked from Refuse2Logout
window.addEventListener('load', function () {
    var POLL_INTERVAL = 10 * 6E4 // 10 minutes in ms
      , POLL_URL = "/d2l/lp/auth/session/extend"
      , tapItLikeItsHot = function () {
            try {
                var oReq = new XMLHttpRequest();
                oReq.open("GET", POLL_URL, true);
                oReq.onreadystatechange = function (oEvent) {
                  if (oReq.readyState === 4) {
                    if (oReq.status === 200) {
                      // prevents the 'session expired' alert
	                  D2L.PT.Auth.SessionTimeout.m_timeoutIsHandled = true;
                      console && console.log && console.log("Successfully polled D2L!");
                    } else {
                      console && console.error && console.error("Polling error: ", oReq.statusText);
                    }
                  }
                };
                oReq.send(null);
            } catch (err) {
                console && console.error && console.error(err);
            }
        };

    setInterval(tapItLikeItsHot, POLL_INTERVAL);
});

function addStylesheet() {
    var style = document.createElement("style");
    // WebKit?
    style.appendChild(document.createTextNode(""));
    document.head.appendChild(style);

    var sheet = style.sheet;
    sheet.insertRule("#z_cg .gm-active {background-color: #99FF66; }", 0);
    sheet.insertRule("#z_cg .gm-mine {background-color: #66CCFF;}", 0);

    return style.sheet;
};

function convertToArray(domObj) {
	return Array.prototype.slice.call(domObj, 0);
}

/* Placeholder...
function removeHeaderItems() {

}
*/

function removeLinkDecorations() {
	var links = convertToArray( document.getElementsByTagName('a') );

	links.forEach(function(elem) {
		elem.style.textDecoration = 'none';
	});
}

function processPosts() {
	var posts = convertToArray( document.getElementsByClassName('d_dbold') );
	
	posts.forEach(function(elem) {
		addHighlight(elem);
		elem.addEventListener('click', removeHighlight, false);
	});
}

function processDiscussionList() {
	var list = convertToArray( document.getElementsByClassName('dtn_bold') );

	list.forEach(function(elem) {
		var target = elem.parentNode.parentNode.parentNode; // ugly.
		addHighlight(target);
		target.addEventListener('click', removeHighlight, false);
	});

    // add an event handler for each message. row clicking anything on
    // the row changes the highlight because the d2l handler is
    // preventing normal event bubbling, so using the tr is the
    // easiest.
	list = convertToArray(document.querySelectorAll('#z_cg > tbody > tr'));
	list.forEach(function(elem) {
	   elem.addEventListener('click', makeCurrent, false);
	});

    // search for messages the current user submitted and color them
    var name = Global.FirstName + ' ' + Global.LastName;
    list = convertToArray(document.querySelectorAll('#z_cg td label'));
    list.forEach(function(elem) {
        if(name == elem.innerHTML)
            elem.parentNode.parentNode.classList.add('gm-mine');
    });
}

function addHighlight (elem) {
	elem.style.backgroundColor = 'yellow';
}

function removeHighlight() {
	this.removeAttribute('style', 'background-color');
}

function removeCurrent() {
	var list = convertToArray(document.querySelectorAll('#z_cg tr.gm-active'));
	list.forEach(function(elem) {
        elem.classList.remove('gm-active');
    });
}

function makeCurrent(e) {
    removeCurrent();
    this.classList.add('gm-active');
}
