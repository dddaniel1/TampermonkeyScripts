// ==UserScript==
// @name         Twitter Time Filter (Flicker-Free)
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Filter tweets seamlessly using API interception (no refresh, no flicker)
// @author       Antigravity
// @match        https://twitter.com/*
// @match        https://x.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // --- State & Config ---
    let activeFilter = GM_getValue('tf_active_filter', { start: '', end: '', enabled: false });
    let isMinimized = GM_getValue('tf_minimized', false);
    let stats = { filtered: 0 };

    // --- API Interception Core ---

    function shouldFilter(createdAt) {
        if (!activeFilter.enabled) return false;
        const tweetTime = new Date(createdAt).getTime();
        if (activeFilter.start && tweetTime < new Date(activeFilter.start).getTime()) return true;
        if (activeFilter.end && tweetTime > new Date(activeFilter.end).getTime()) return true;
        return false;
    }

    // Deeply filter the GraphQL response object
    function filterResponse(obj) {
        if (!obj || typeof obj !== 'object') return obj;

        // Process instructions (X's standard update mechanism)
        if (Array.isArray(obj.instructions)) {
            obj.instructions.forEach(instruction => {
                if (instruction.type === 'TimelineAddEntries' || instruction.type === 'TimelineReplaceEntry') {
                    if (instruction.entries) {
                        instruction.entries = instruction.entries.filter(entry => {
                            const tweetData = findTweetData(entry);
                            if (tweetData && tweetData.legacy && tweetData.legacy.created_at) {
                                const isOut = shouldFilter(tweetData.legacy.created_at);
                                if (isOut) stats.filtered++;
                                return !isOut;
                            }
                            return true;
                        });
                    }
                    if (instruction.entry) {
                         const tweetData = findTweetData(instruction.entry);
                         if (tweetData && tweetData.legacy && tweetData.legacy.created_at) {
                             if (shouldFilter(tweetData.legacy.created_at)) {
                                 stats.filtered++;
                                 instruction.entry = null; // Mark for removal
                             }
                         }
                    }
                }
            });
            // Clean up null entries
            obj.instructions = obj.instructions.filter(i => !(i.type === 'TimelineReplaceEntry' && i.entry === null));
        }

        // Recursively search for nested objects
        for (let key in obj) {
            if (typeof obj[key] === 'object' && key !== 'instructions') {
                filterResponse(obj[key]);
            }
        }
        return obj;
    }

    function findTweetData(entry) {
        if (!entry || !entry.content) return null;
        const content = entry.content;
        
        if (content.itemContent && content.itemContent.tweet_results && content.itemContent.tweet_results.result) {
            let res = content.itemContent.tweet_results.result;
            return res.tweet || res;
        }
        return null;
    }

    // Hook Fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        const response = await originalFetch(...args);
        const url = args[0] instanceof Request ? args[0].url : args[0];

        if (url.includes('/i/api/graphql/') && activeFilter.enabled) {
            const clone = response.clone();
            try {
                const data = await clone.json();
                const filteredData = filterResponse(data);
                updateUIStats();
                
                return new Response(JSON.stringify(filteredData), {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers
                });
            } catch (e) {
                return response;
            }
        }
        return response;
    };

    // --- UI Implementation ---

    function injectStyles() {
        GM_addStyle(`
            #twitter-time-filter-panel {
                position: fixed; bottom: 20px; right: 20px; width: 280px;
                background: rgba(21, 32, 43, 0.95); border: 1px solid #38444d;
                border-radius: 12px; padding: 15px; z-index: 9999; color: white;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                box-shadow: 0 4px 12px rgba(0,0,0,0.5); backdrop-filter: blur(5px);
                transition: transform 0.3s ease;
            }
            #twitter-time-filter-panel.minimized { transform: translateY(calc(100% - 40px)); }
            #twitter-time-filter-panel h3 {
                margin: 0 0 10px 0; font-size: 16px; border-bottom: 1px solid #38444d;
                padding-bottom: 5px; display: flex; justify-content: space-between;
                align-items: center; cursor: pointer;
            }
            .tf-input-group { margin-bottom: 10px; }
            .tf-input-group label { display: block; font-size: 11px; margin-bottom: 4px; color: #8899a6; }
            .tf-input-group input {
                width: 100%; padding: 8px; background: #192734; border: 1px solid #38444d;
                border-radius: 4px; color: white; font-size: 13px; box-sizing: border-box; outline: none;
            }
            .tf-input-group input:focus { border-color: #1d9bf0; }
            .tf-actions { display: flex; gap: 8px; margin-top: 15px; }
            .tf-btn {
                flex: 1; padding: 10px; border-radius: 9999px; border: none;
                font-weight: bold; cursor: pointer; font-size: 13px; transition: opacity 0.2s;
            }
            #tf-apply-btn { background: #1d9bf0; color: white; }
            #tf-clear-btn { background: #38444d; color: white; }
            .tf-btn:hover { opacity: 0.8; }
            .tf-status { font-size: 11px; color: #8899a6; margin-top: 10px; text-align: center; }
            .tf-indicator { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 5px; }
            .tf-indicator.active { background: #00ba7c; box-shadow: 0 0 5px #00ba7c; }
            .tf-indicator.inactive { background: #f4212e; }
        `);
    }

    function createUI() {
        if (document.getElementById('twitter-time-filter-panel')) return;
        const panel = document.createElement('div');
        panel.id = 'twitter-time-filter-panel';
        if (isMinimized) panel.classList.add('minimized');
        
        panel.innerHTML = `
            <h3 id="tf-header">
                <span>
                    <span id="tf-indicator" class="tf-indicator ${activeFilter.enabled ? 'active' : 'inactive'}"></span>
                    无感时间过滤
                </span>
                <span id="tf-toggle-icon">${isMinimized ? '▲' : '▼'}</span>
            </h3>
            <div id="tf-content">
                <div class="tf-input-group">
                    <label>从 (开始日期)</label>
                    <input type="date" id="tf-start-date" value="${activeFilter.start}">
                </div>
                <div class="tf-input-group">
                    <label>到 (结束日期)</label>
                    <input type="date" id="tf-end-date" value="${activeFilter.end}">
                </div>
                <div class="tf-actions">
                    <button id="tf-clear-btn" class="tf-btn">关闭</button>
                    <button id="tf-apply-btn" class="tf-btn">开启过滤</button>
                </div>
                <div id="tf-status-text" class="tf-status">
                    ${activeFilter.enabled ? `正在过滤 | 已拦截 ${stats.filtered} 条` : '过滤器未启用'}
                </div>
            </div>
        `;
        document.body.appendChild(panel);

        document.getElementById('tf-header').onclick = toggleMinimize;
        document.getElementById('tf-apply-btn').onclick = applyFilter;
        document.getElementById('tf-clear-btn').onclick = clearFilter;
    }

    function toggleMinimize() {
        const panel = document.getElementById('twitter-time-filter-panel');
        isMinimized = !isMinimized;
        panel.classList.toggle('minimized', isMinimized);
        document.getElementById('tf-toggle-icon').innerText = isMinimized ? '▲' : '▼';
        GM_setValue('tf_minimized', isMinimized);
    }

    function updateUIStats() {
        const statusText = document.getElementById('tf-status-text');
        if (statusText && activeFilter.enabled) {
            statusText.innerText = `正在过滤 | 已拦截 ${stats.filtered} 条`;
        }
    }

    function applyFilter() {
        const start = document.getElementById('tf-start-date').value;
        const end = document.getElementById('tf-end-date').value;

        if (!start && !end) {
            alert('请至少选择一个日期范围！');
            return;
        }

        activeFilter = { start, end, enabled: true };
        GM_setValue('tf_active_filter', activeFilter);
        
        document.getElementById('tf-indicator').className = 'tf-indicator active';
        updateUIStats();
        
        hideCurrentTweetsInDOM();
        alert('过滤器已启用！向下滚动即可无感过滤。');
    }

    function clearFilter() {
        activeFilter = { start: '', end: '', enabled: false };
        GM_setValue('tf_active_filter', activeFilter);
        stats.filtered = 0;
        
        document.getElementById('tf-indicator').className = 'tf-indicator inactive';
        document.getElementById('tf-status-text').innerText = '过滤器未启用';
        
        document.querySelectorAll('article').forEach(tweet => tweet.style.display = '');
        alert('过滤器已关闭。');
    }

    function hideCurrentTweetsInDOM() {
        if (!activeFilter.enabled) return;
        document.querySelectorAll('article').forEach(tweet => {
            const timeTag = tweet.querySelector('time');
            if (timeTag) {
                const datetime = timeTag.getAttribute('datetime');
                if (datetime && shouldFilter(datetime)) {
                    tweet.style.display = 'none';
                }
            }
        });
    }

    // --- Boot ---
    function init() {
        injectStyles();
        const bootInterval = setInterval(() => {
            if (document.body) {
                clearInterval(bootInterval);
                createUI();
            }
        }, 500);
    }

    init();

})();
