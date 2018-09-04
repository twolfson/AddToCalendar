chrome.runtime.onMessage.addListener(gotMessage);

/* Reciever function for recieving onclick messages from background.js */
function gotMessage(request, sender, sendResponse) {
  // (For debugging) console.log(request.txt);
  addToCalendar();
}

/* Adds event information onto google calendar event and registers API calls? */
function addToCalendar() {

  // Do some crude webscraping to avoid needing user permissions to access event info.
  var title = document.getElementById("seo_h1_tag").textContent;
  var time = document.getElementsByClassName("_2ycp _5xhk")[0].textContent;
  // Second senario for location is for event pages with multiple dates
  var location = document.getElementsByClassName("_5xhp fsm fwn fcg")[1].textContent || document.getElementById("u_0_18").textContent;
  var details = document.getElementsByClassName("_63ew")[0].innerText;

  /* //For debugging purposes
  console.log("Title: " + title);
  console.log("Time: " + time);
  console.log("Location: " + location);
  console.log("Description: " + details); */

  /* Put information into a google calendar url and launch in new window (modified code from: https://github.com/borismasis/send-to-calendar)*/
  /* Reference info from https://stackoverflow.com/questions/10488831/link-to-add-to-google-calendar
    href="http://www.google.com/calendar/event?
    action=TEMPLATE
    &text=[event-title]
    &dates=[start-custom format='Ymd\\THi00\\Z']/[end-custom format='Ymd\\THi00\\Z']
    &details=[description]
    &location=[location]
    &trp=false
    &sprop=
    &sprop=name:"

    To convert to the datetime format: (new Date()).toISOString().replace(/-|:|\.\d\d\d/g,"");
  */

  //TODO: Get time working

  // Max URI length is 2000 chars, but let's keep under 1800
  // to also allow a buffer for google login/redirect urls etc.
  // (This limit is not a hard limit in the code,
  // but we don't surpass it by more than a few tens of chars.)
  var maxLength = 1800;

  // Start building the URL
	var url = "http://www.google.com/calendar/event?action=TEMPLATE";

  // Page title to event title
  url += "&text=" + TrimURITo(title, maxLength);

  // Check if the selected text contains a US formatted address
  // and it its first 100 chars to URI if so
  if (location) {
      // Location goes to location
      url += "&location=" + TrimURITo(location, maxLength - url.length);
  }

  // URL goes to star of details (event description)
  //TODO: Add backslashes to relavant symbols that mess with the url (e.g. &)
  url += "&details=" + TrimURITo(details, maxLength - url.length);

  // Send message back to background.js with constructed url to open in new tabs
  chrome.runtime.sendMessage({url: url});

}

/* Function from modified code from: https://github.com/borismasis/send-to-calendar) */
// Trim text so that its URI encoding fits into the length limit
// and return its URI encoding
function TrimURITo(text, length) {
    var textURI = encodeURI(text);
    if (textURI.length > length) {
        // Different charsets can lead to a different blow-up after passing the
        // text through encodeURI, so let's estimate the blow up first,
        // and then trim the text so that it fits the limit...
        var blowUp = textURI.length/text.length;
        var newLength = Math.floor(length / blowUp) - 3;  // -3 for "..."
        do {
            // trim the text & show that it was trimmed...
            text = text.substring(0, newLength) + "...";
            textURI = encodeURI(text);
            newLength = Math.floor(0.9 * newLength);
        } while (textURI.length > length);
    }

    return textURI;
}
