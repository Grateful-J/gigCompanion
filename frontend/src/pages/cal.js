// Import necessary components
import { loadNavbar } from "../components/navbar.js";
// Load the Google API scripts
loadScript("https://apis.google.com/js/api.js", gapiLoaded);
loadScript("https://accounts.google.com/gsi/client", gisLoaded);

loadNavbar();

/* exported gapiLoaded, gisLoaded, handleAuthClick, handleSignoutClick */

// TODO: Set to client ID and API key from the Developer Console
const calAuthId = import.meta.env.VITE_GOOGLE_CAL_CLIENT_ID;
const calAuthKey = import.meta.env.VITE_GOOGLE_CAL_API_KEY;
const CLIENT_ID = calAuthId;
const API_KEY = calAuthKey;

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";

// Authorization scopes required by the API; multiple scopes can be included, separated by spaces.
const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

let tokenClient;
let gapiInited = false;
let gisInited = false;

document.getElementById("authorize_button").style.visibility = "hidden";
document.getElementById("signout_button").style.visibility = "hidden";

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
  gapi.load("client", initializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the discovery doc to initialize the API.
 */
async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
  maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: "", // defined later
  });
  gisInited = true;
  maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.getElementById("authorize_button").style.visibility = "visible";
  }
}

/**
 * Sign in the user upon button click.
 */
function handleAuthClick() {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw resp;
    }
    document.getElementById("signout_button").style.visibility = "visible";
    document.getElementById("authorize_button").innerText = "Refresh";
    await listUpcomingEvents();
  };

  if (gapi.client.getToken() === null) {
    // Prompt the user to select a Google Account and ask for consent to share their data when establishing a new session.
    tokenClient.requestAccessToken({ prompt: "consent" });
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    tokenClient.requestAccessToken({ prompt: "" });
  }
}

/**
 * Sign out the user upon button click.
 */
function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken("");
    document.getElementById("content").innerText = "";
    document.getElementById("authorize_button").innerText = "Authorize";
    document.getElementById("signout_button").style.visibility = "hidden";
  }
}

/**
 * Print the summary and start datetime/date of the next ten events in the authorized user's calendar.
 * If no events are found, an appropriate message is printed.
 */
async function listUpcomingEvents() {
  let response;
  try {
    const request = {
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResults: 10,
      orderBy: "startTime",
    };
    response = await gapi.client.calendar.events.list(request);
  } catch (err) {
    document.getElementById("content").innerText = err.message;
    return;
  }

  const events = response.result.items;
  if (!events || events.length === 0) {
    document.getElementById("content").innerText = "No events found.";
    return;
  }
  // Flatten to string to display
  const output = events.reduce((str, event) => `${str}${event.summary} (${event.start.dateTime || event.start.date})\n`, "Events:\n");
  document.getElementById("content").innerText = output;
}

// Function to load external scripts
function loadScript(src, onload) {
  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  script.defer = true;
  script.onload = onload;
  document.head.appendChild(script);
}

// Fetch events from Google Calendar API GET https://www.googleapis.com/calendar/v3/users/me/calendarList/calendarId
async function getEvents() {
  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?orderBy=startTime&singleEvents=true&timeMin=" + new Date().toISOString(),
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + gapi.client.getToken().access_token,
      },
    }
  );
  const data = await response.json();
  console.log(data);
}

// Quick Create an Event to Primary Calendar via POST https://www.googleapis.com/calendar/v3/calendars/calendarId/events/quickAdd
async function quickCreateEvent() {
  const calendar = "primary"; // Default is primary
  startDate = new Date();
  endDate = new Date() + 7 * 24 * 60 * 60 * 1000;

  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendar}/events?sendNotifications=true`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + gapi.client.getToken().access_token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      summary: "Quick Event Added via API!! ",
      start: {
        dateTime: new Date().toISOString(),
      },
      end: {
        dateTime: new Date().toISOString(),
      },
    }),
  });
  const data = await response.json();
  console.log(data);
}

// Event listeners for buttons
document.getElementById("signout_button").addEventListener("click", handleSignoutClick);
document.getElementById("authorize_button").addEventListener("click", () => handleAuthClick());
document.getElementById("list_events_button").addEventListener("click", () => getEvents());
document.getElementById("create_event_button").addEventListener("click", () => quickCreateEvent());
