/* Adds event information onto google calendar event and registers API calls? */
function addToCalendar() {
  if (window.location.href.includes("/calendar.google.com")) {
    // Don't do anything if we are on the google calendar page. This triggers because the url
    // has the facebook event link in it, making the icon active.
    return;
  }
  // Do some crude webscraping to avoid needing user permissions to access event info.
  try {
    var title = document.getElementById("seo_h1_tag").textContent;
  } catch (e) {
    alert("Please wait for the title to load. - AddToCalendar Bot");
    return;
  }

  try {
    var time = document.getElementsByClassName("_2ycp _5xhk")[0].getAttribute("content");
  } catch (e) {
    alert("Please wait for the time to load. - AddToCalendar Bot");
    return;
  }

  try {
    // Second senario for location is for event pages with multiple dates (bugs out when there is no location as u_0_18 gets replaced by something else)
    var location = document.getElementsByClassName("_5xhp fsm fwn fcg")[1].textContent ||
      document.getElementsByClassName("_5xhk")[1].textContent ||
      document.getElementsByClassName("_5xhp fsm fwn fcg")[2].textContent ||
      document.getElementById("u_0_18").textContent;

    // Check if we accidentally got the wrong value for location (e.g. location = OCT12Fri8:00 PMOCT13Sat8:00 PMOCT14Sun5:00 PM 3)
    if (location.includes(":")) {
      location = document.getElementsByClassName("_5xhp fsm fwn fcg")[2].textContent ||
      document.getElementById("u_0_18").textContent;
    }

  } catch (e) {
    var location = "";
  }

  try {
    var details = document.getElementsByClassName("_63ew") ? document.getElementsByClassName("_63ew")[0].innerText : null;
  } catch (e) {
    alert('Please click the "About" tab on this event page if you want to add event details to your calendar. - AddToCalendar Bot');
    var details = "";
  }

  /* //For debugging purposes
  console.log("Title: " + title);
  console.log("Time: " + time);
  console.log("Location: " + location);
  console.log("Description: " + details); */

  // Parse the time to a readable format for Google Calendar

  // If end time exists, add both start and end times.
  if (time.indexOf('to') != -1) { // if there is a "to" in the time string

    // based on this input format from Facebook: time = "2018-10-04T12:00:00-07:00 to 2018-10-04T14:00:00-07:00"

    var startTime = new Date(time.substring(0, time.indexOf('to') - 7));
    //console.log("Start time: " + startTime);

    var endTime = new Date(time.substring(time.indexOf('to') + 3, time.length - 6));
    //console.log("End time: " + endTime);

  } else {
    // Set end time equal to start time + 1 hour
    var startTime = new Date(time.substring(0, time.length - 6));
    var endTime = new Date(startTime.getTime() + 60*60*1000);
  }

  // Form time string that Google can parse
  time = startTime.toISOString().replace(/-|:|\.\d\d\d/g,"") + "/" + endTime.toISOString().replace(/-|:|\.\d\d\d/g,"");


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

  // Max URI length is 2000 chars, but we will keep under 1850
  // to also allow a buffer for google login/redirect urls etc.
  // (This limit is not a hard limit in the code,
  // but won't surpass it by more than a few tens of chars.)
  var maxLength = 1850;

  // Start building the URL
    var url = "http://www.google.com/calendar/event?action=TEMPLATE";

  // Page title to event title
  url += "&text=" + EncodeAndTrimURIComponentTo(title, maxLength);

  // Add time to event
  url += "&dates=" + time;

  // Check if the selected text contains a US formatted address
  // and it its first 100 chars to URI if so
  if (location) {
      // Location goes to location
      url += "&location=" + EncodeAndTrimURIComponentTo(location, maxLength - url.length);
  }

  // Store and clean url of Facebook event page
  var fbURL = window.location.href;
  if (fbURL.indexOf("?") != -1) {
    fbURL = fbURL.substring(0, fbURL.indexOf("?"));
  }
  // URL goes to star of details (event description) as well as a link to the event.
  url += "&details=" + "Event link: " + encodeURIComponent(fbURL) + "%20%20" + EncodeAndTrimURIComponentTo(details, maxLength - url.length);


  // Send message back to background.js with constructed url to open in new tabs
  window.open(url);

}

/* Function from modified code from: https://github.com/borismasis/send-to-calendar) */
// Trim text so that its URI encoding fits into the length limit
// and return its URI encoding
function EncodeAndTrimURIComponentTo(text, length) {
    var textURI = encodeURIComponent(text);
    if (textURI.length > length) {
        // Different charsets can lead to a different blow-up after passing the
        // text through encodeURIComponent, so let's estimate the blow up first,
        // and then trim the text so that it fits the limit...
        var blowUp = textURI.length/text.length;
        var newLength = Math.floor(length / blowUp) - 3;  // -3 for "..."
        do {
            // trim the text & show that it was trimmed...
            text = text.substring(0, newLength) + "...";
            textURI = encodeURIComponent(text);
            newLength = Math.floor(0.9 * newLength);
        } while (textURI.length > length);
    }

    return textURI;
}
addToCalendar();
