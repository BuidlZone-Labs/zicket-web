**Implementing Privacy Mode Enforcement Guards (Client-Side)**

To address the issue, we will implement the following code changes in the `zicket-web` repository:

### Step 1: Guard analytics calls

We will create a wrapper function to guard analytics calls and ensure that no user identifiers are sent. Create a new file `analytics.js` with the following code:
```javascript
// analytics.js
export function trackEvent(event, data) {
  if (window.anonymousMode) {
    return;
  }
  // Remove user identifiers from data
  const strippedData = stripUserIdentifiers(data);
  // Send analytics event with stripped data
  window.analytics.track(event, strippedData);
}

function stripUserIdentifiers(data) {
  const strippedData = { ...data };
  delete strippedData.userId;
  delete strippedData.username;
  // Add other user identifiers to delete as needed
  return strippedData;
}
```
### Step 2: Strip user identifiers

We will use the `stripUserIdentifiers` function created in Step 1 to strip user identifiers from all analytics data.

### Step 3: Disable tracking when anonymous

We will add a check to disable tracking when the user is in anonymous mode. Update the `index.js` file to include the following code:
```javascript
// index.js
import { trackEvent } from './analytics';

// ...

if (window.anonymousMode) {
  // Disable tracking
  window.analytics.disable();
} else {
  // Enable tracking
  window.analytics.enable();
}

// ...
```
### Additional Changes

To ensure that the `anonymousMode` flag is set correctly, we will add a toggle button to the UI. Update the `App.js` file to include the following code:
```javascript
// App.js
import React, { useState } from 'react';

function App() {
  const [anonymousMode, setAnonymousMode] = useState(false);

  const handleToggleAnonymousMode = () => {
    setAnonymousMode(!anonymousMode);
    if (anonymousMode) {
      window.analytics.enable();
    } else {
      window.analytics.disable();
    }
  };

  return (
    <div>
      <button onClick={handleToggleAnonymousMode}>
        {anonymousMode ? 'Disable Anonymous Mode' : 'Enable Anonymous Mode'}
      </button>
      {/* ... */}
    </div>
  );
}
```
### Example Use Case

To test the implementation, follow these steps:

1. Enable anonymous mode by clicking the toggle button.
2. Trigger an analytics event (e.g., by clicking a button).
3. Verify that no user identifiers are sent with the analytics event.
4. Disable anonymous mode and trigger another analytics event.
5. Verify that user identifiers are sent with the analytics event.

**Code Fix:**

The above code changes ensure that the frontend never accidentally leaks identity data. The `trackEvent` function guards analytics calls, strips user identifiers, and disables tracking when anonymous mode is enabled.

**Commit Message:**
```
Implement privacy mode enforcement guards (client-side)

* Guard analytics calls
* Strip user identifiers
* Disable tracking when anonymous

Fixes #102
```
**API Documentation:**

The `trackEvent` function is documented as follows:
```javascript
/**
 * Tracks an analytics event with stripped user identifiers.
 *
 * @param {string} event - The event name
 * @param {object} data - The event data
 */
export function trackEvent(event, data) {
  // ...
}
```