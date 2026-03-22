# Tampermonkey Scripts

A collection of useful Tampermonkey scripts for various websites.

## Scripts

### [Twitter Time Filter (Official Search)](./Tweet_filter/tweet_filter.user.js)

Filter tweets reliably using X's (Twitter) official search syntax (`since:` and `until:`). This approach is the most stable as it leverages X's native search engine to find tweets within specific date ranges.

#### Features
- ✅ **100% Reliable**: Uses official search parameters, ensuring no tweets are missed.
- 👤 **Auto Profile Detection**: Automatically adds `(from:username)` when you are on a specific user's profile page.
- ⌨️ **Keyword Support**: Combine your date filters with optional keywords.
- 🕒 **Date Selection**: Clean UI with date pickers for easy range selection.
- 📉 **Minimized Mode**: Keep the UI tucked away at the bottom right.

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

Once installed, an **"高级时间搜索" (Advanced Time Search)** panel will appear at the bottom right.
1. (Optional) Enter a **Keyword**.
2. Select a **Start Date** and/or **End Date**.
3. Click **"前往官方筛选结果" (Go to official results)**.
4. The current page will redirect to the official search results for that period (e.g., `since:2025-01-01 until:2025-01-31`).

*Note: Navigation happens in the same tab for a seamless workflow.*
