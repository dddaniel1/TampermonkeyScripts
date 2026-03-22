// ==UserScript==
// @name         Twitter Time Filter
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Filter tweets using official search syntax (since:/until:)
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
            transition: transform 0.3s ease;
        }
        #twitter-time-filter-panel.minimized {
            transform: translateY(calc(100% - 40px));
        }
        #twitter-time-filter-panel h3 {
            margin: 0 0 10px 0;
            font-size: 16px;
            border-bottom: 1px solid #38444d;
            padding-bottom: 5px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
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
            padding: 8px;
            background: #192734;
            border: 1px solid #38444d;
            border-radius: 4px;
            color: white;
            font-size: 14px;
            box-sizing: border-box;
            outline: none;
        }
        .tf-input-group input:focus {
            border-color: #1d9bf0;
        }
        .tf-actions {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }
        .tf-btn {
            flex: 1;
            padding: 10px;
            border-radius: 9999px;
            border: none;
            font-weight: bold;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.2s;
        }
        #tf-search-btn {
            background: #1d9bf0;
            color: white;
        }
        #tf-search-btn:hover {
            background: #1a8cd8;
        }
        .tf-hint {
            font-size: 11px;
            color: #8899a6;
            margin-top: 10px;
            line-height: 1.4;
        }
        #tf-toggle-icon {
            font-size: 12px;
            transition: transform 0.3s;
        }
        #twitter-time-filter-panel.minimized #tf-toggle-icon {
            transform: rotate(180deg);
        }
    `);

    // State
    let isMinimized = GM_getValue('tf_minimized', false);
    let lastConfig = GM_getValue('tf_last_config', { start: '', end: '', keyword: '' });

    // Create UI
    function createUI() {
        if (document.getElementById('twitter-time-filter-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'twitter-time-filter-panel';
        if (isMinimized) panel.classList.add('minimized');
        
        panel.innerHTML = `
            <h3 id="tf-header">高级时间搜索 <span id="tf-toggle-icon">▼</span></h3>
            <div id="tf-content">
                <div class="tf-input-group">
                    <label>关键词 (可选)</label>
                    <input type="text" id="tf-keyword" placeholder="输入搜索词..." value="${lastConfig.keyword}">
                </div>
                <div class="tf-input-group">
                    <label>开始日期</label>
                    <input type="date" id="tf-start-date" value="${lastConfig.start}">
                </div>
                <div class="tf-input-group">
                    <label>结束日期</label>
                    <input type="date" id="tf-end-date" value="${lastConfig.end}">
                </div>
                <div class="tf-actions">
                    <button id="tf-search-btn" class="tf-btn">前往搜索结果</button>
                </div>
                <div class="tf-hint">
                    * 自动识别当前个人主页用户<br>
                    * 使用官方 since/until 语法
                </div>
            </div>
        `;
        document.body.appendChild(panel);

        document.getElementById('tf-header').onclick = toggleMinimize;
        document.getElementById('tf-search-btn').onclick = performSearch;
    }

    function toggleMinimize() {
        const panel = document.getElementById('twitter-time-filter-panel');
        isMinimized = !isMinimized;
        panel.classList.toggle('minimized', isMinimized);
        GM_setValue('tf_minimized', isMinimized);
    }

    function performSearch() {
        const start = document.getElementById('tf-start-date').value;
        const end = document.getElementById('tf-end-date').value;
        const keyword = document.getElementById('tf-keyword').value;

        if (!start && !end && !keyword) {
            alert('请至少输入一个搜索条件！');
            return;
        }

        // Save config
        GM_setValue('tf_last_config', { start, end, keyword });

        let queryParts = [];
        
        // 1. Keyword
        if (keyword) queryParts.push(keyword);

        // 2. Detect Username (if on profile page)
        const pathParts = window.location.pathname.split('/').filter(p => p);
        const nonUserPaths = ['home', 'explore', 'notifications', 'messages', 'i', 'settings', 'search', 'compose', 'intent'];
        if (pathParts.length === 1 && !nonUserPaths.includes(pathParts[0].toLowerCase())) {
            queryParts.push(`(from:${pathParts[0]})`);
        }

        // 3. Since
        if (start) queryParts.push(`since:${start}`);

        // 4. Until
        if (end) queryParts.push(`until:${end}`);

        const finalQuery = queryParts.join(' ').trim();
        const searchUrl = `https://x.com/search?q=${encodeURIComponent(finalQuery)}&f=live`;
        
        window.open(searchUrl, '_blank');
    }

    // Initialize
    function init() {
        createUI();
    }

    // Wait for body to be available
    const checkInterval = setInterval(() => {
        if (document.body) {
            clearInterval(checkInterval);
            init();
        }
    }, 500);

})();
