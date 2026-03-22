// ==UserScript==
// @name         Twitter Time Filter
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Filter tweets by time range
// @author       Antigravity
// @match        https://twitter.com/*
// @match        https://x.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // UI Styles
    GM_addStyle(`
        #twitter-time-filter-panel {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 280px;
            background: rgba(21, 32, 43, 0.95);
            border: 1px solid #38444d;
            border-radius: 12px;
            padding: 15px;
            z-index: 9999;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            backdrop-filter: blur(5px);
        }
        #twitter-time-filter-panel h3 {
            margin: 0 0 10px 0;
            font-size: 16px;
            border-bottom: 1px solid #38444d;
            padding-bottom: 5px;
        }
        .tf-input-group {
            margin-bottom: 10px;
        }
        .tf-input-group label {
            display: block;
            font-size: 12px;
            margin-bottom: 4px;
            color: #8899a6;
        }
        .tf-input-group input {
            width: 100%;
            padding: 6px;
            background: #192734;
            border: 1px solid #38444d;
            border-radius: 4px;
            color: white;
            font-size: 14px;
            box-sizing: border-box;
        }
        .tf-actions {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }
        .tf-btn {
            flex: 1;
            padding: 8px;
            border-radius: 9999px;
            border: none;
            font-weight: bold;
            cursor: pointer;
            font-size: 14px;
        }
        #tf-apply-btn {
            background: #1d9bf0;
            color: white;
        }
        #tf-apply-btn:hover {
            background: #1a8cd8;
        }
        #tf-clear-btn {
            background: transparent;
            border: 1px solid #536471;
            color: #1d9bf0;
        }
        #tf-clear-btn:hover {
            background: rgba(29, 155, 240, 0.1);
        }
        .tf-status {
            font-size: 11px;
            color: #8899a6;
            margin-top: 8px;
            text-align: center;
        }
    `);

    // State
    let filterRange = GM_getValue('tf_range', { start: '', end: '' });

    // Create UI
    function createUI() {
        const panel = document.createElement('div');
        panel.id = 'twitter-time-filter-panel';
        panel.innerHTML = `
            <h3>推特时间过滤</h3>
            <div class="tf-input-group">
                <label>开始时间</label>
                <input type="datetime-local" id="tf-start-date" value="${filterRange.start}">
            </div>
            <div class="tf-input-group">
                <label>结束时间</label>
                <input type="datetime-local" id="tf-end-date" value="${filterRange.end}">
            </div>
            <div class="tf-actions">
                <button id="tf-clear-btn" class="tf-btn">清除</button>
                <button id="tf-apply-btn" class="tf-btn">应用</button>
            </div>
            <div id="tf-status-text" class="tf-status"></div>
        `;
        document.body.appendChild(panel);

        document.getElementById('tf-apply-btn').onclick = applyFilter;
        document.getElementById('tf-clear-btn').onclick = clearFilter;
    }

    function updateStatus(text) {
        document.getElementById('tf-status-text').innerText = text;
    }

    function applyFilter() {
        const start = document.getElementById('tf-start-date').value;
        const end = document.getElementById('tf-end-date').value;
        filterRange = { start, end };
        GM_setValue('tf_range', filterRange);
        updateStatus('过滤器已激活');
        runFilter();
    }

    function clearFilter() {
        document.getElementById('tf-start-date').value = '';
        document.getElementById('tf-end-date').value = '';
        filterRange = { start: '', end: '' };
        GM_setValue('tf_range', filterRange);
        showAllTweets();
        updateStatus('过滤器已停用');
    }

    function showAllTweets() {
        document.querySelectorAll('article').forEach(tweet => {
            tweet.style.display = '';
        });
    }

    function isWithinRange(timestamp) {
        if (!filterRange.start && !filterRange.end) return true;
        const tweetDate = new Date(timestamp);
        if (filterRange.start && tweetDate < new Date(filterRange.start)) return false;
        if (filterRange.end && tweetDate > new Date(filterRange.end)) return false;
        return true;
    }

    function runFilter() {
        if (!filterRange.start && !filterRange.end) return;

        const tweets = document.querySelectorAll('article');
        tweets.forEach(tweet => {
            const timeTag = tweet.querySelector('time');
            if (timeTag) {
                const datetime = timeTag.getAttribute('datetime');
                if (datetime) {
                    if (isWithinRange(datetime)) {
                        tweet.style.display = '';
                    } else {
                        tweet.style.display = 'none';
                    }
                }
            }
        });
    }

    // Observer for dynamic loading
    const observer = new MutationObserver(() => {
        runFilter();
    });

    // Initialize
    function init() {
        if (document.getElementById('twitter-time-filter-panel')) return;
        createUI();
        runFilter();
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Wait for body to be available
    const checkInterval = setInterval(() => {
        if (document.body) {
            clearInterval(checkInterval);
            init();
        }
    }, 500);

})();
