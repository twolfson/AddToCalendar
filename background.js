// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
          // URL has to match that of a specific Facebook event
          pageUrl: {urlMatches: 'www.facebook.com/events/[0-9]+'},
        })
        ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    });
});

/* Listener for browser icon clicks. Sends message to contentscript.js with tab id. */
chrome.pageAction.onClicked.addListener(function(tab) {
    chrome.tabs.sendMessage(tab.id, {txt: "onClicked"});
});

/* Listener for contentscript when it has done generating a calendar event link. */
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // Open new tab with calendar event details inputed automatically
    chrome.tabs.create({ "url": request.url}, function (tab) {});
  });
