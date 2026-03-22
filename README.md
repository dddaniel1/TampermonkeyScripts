# Tampermonkey Scripts

A collection of useful Tampermonkey scripts for various websites.

## Scripts

### [Twitter Time Filter](./Tweet_filter/tweet_filter.user.js)

Filter tweets using official X (Twitter) search syntax (`since:` and `until:`). This approach is faster, more stable, and utilizes X's native search capabilities.

#### Features
- 🔍 **Search-Based Filtering**: Uses official search parameters for accurate and reliable results.
- 👤 **Auto Profile Detection**: Automatically adds `(from:username)` when you are on a specific user's profile page.
- ⌨️ **Keyword Support**: Add optional keywords to narrow down your time-based search.
- 🕒 **Date Selection**: Easy-to-use date pickers for start and end ranges.
- 📉 **Minimized Mode**: Keep the UI out of the way when not in use.

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

Once installed, an **"高级时间搜索" (Advanced Time Search)** panel will appear at the bottom right of your screen.
1. (Optional) Enter a **Keyword**.
2. Select a **Start Date** and/or **End Date**.
3. Click **"前往搜索结果" (Go to search results)**.
4. A new tab will open with the correctly formatted official search query (e.g., `keyword since:2025-01-01 until:2025-01-31`).

*Note: If you are on a profile page like `x.com/username`, the script will automatically include `(from:username)` in the search.*
