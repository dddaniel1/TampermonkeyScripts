# Tampermonkey Scripts

A collection of useful Tampermonkey scripts for various websites.

## Scripts

### [Twitter Time Filter (Flicker-Free)](./Tweet_filter/tweet_filter.user.js)

Filter tweets seamlessly on the Home timeline and Profile pages without refreshing or jumping to search results. This script intercepts X's (Twitter) API data to provide a "flicker-free" experience.

#### Features
- 🚀 **API Interception**: Filters tweets *before* they are rendered, ensuring zero flickering.
- 🕒 **In-Place Filtering**: Stay on your Home or Profile page while filtering. No more jumping to search results.
- 📊 **Status Tracker**: Real-time counter showing how many tweets have been filtered out.
- 🟢 **Visual Indicator**: A status dot showing whether the filter is currently active.
- 📉 **Minimized Mode**: Keep the UI clean when not in use.

#### Support
- `https://twitter.com/*`
- `https://x.com/*`

## Installation

1. Install the [Tampermonkey](https://www.tampermonkey.net/) extension for your browser.
2. Open the [tweet_filter.user.js](./Tweet_filter/tweet_filter.user.js) file.
3. Copy the entire code.
4. In the Tampermonkey dashboard, click the **+** (plus) icon to create a new script.
5. Paste the code and press `Ctrl+S` (or `Cmd+S`) to save.

## How to use

Once installed, a **"无感时间过滤" (Flicker-Free Filter)** panel will appear at the bottom right.
1. Select a **Start Date** and/or **End Date**.
2. Click **"开启过滤" (Apply Filter)**.
3. The script will automatically filter tweets as you scroll.
4. Click **"关闭" (Close)** to stop filtering and show all tweets again.

*Note: For the best experience, scroll down or refresh once after applying a new filter to let the API interceptor catch new data.*
