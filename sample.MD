*_Build a Simple User Analytics Application
_*
*_Requirements_*
*_1. Event Tracking (Client Side)_*
* Create a JavaScript tracking script that can be added to a webpage.
* Track the following events:
    * page_view
    * click
* Each event must include:
    * session_id (stored in cookie or localStorage)
    * event type
    * page URL
    * timestamp
    * click x/y coordinates (for click events)
* Send event data to the backend API.
* You may create a simple demo webpage to test tracking.
*_2. Backend (Node.js)_*
* Build a backend using *_Node.js / Flask._*
* Implement APIs to:
    * Receive and store events.
    * Fetch a list of sessions with event counts.
    * Fetch all events for a specific session.
    * Fetch click data for a page (for heatmap).
*_3. Database_*
* Use *_MongoDB_* to store all data.
* Store events in a structured format suitable for querying.
*_4. Dashboard (Frontend)_*
Build a dashboard using *_React / Next.js_* with:
* *_Sessions View_*
    * List all sessions with total events.
    * Clicking a session shows the ordered list of events (user journey).
* *_Heatmap View_*
    * Select a page URL.
    * Display click positions visually (dots or simple grid).
*_Submission Instructions_*
* Host the application (optional but preferred).
* Share a public GitHub repository with the source code.
* Include a README with:
    * Setup steps
    * Tech stack
    * Assumptions or trade-offs