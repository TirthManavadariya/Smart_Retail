/**
 * ShelfIQ — API Client
 * Centralized fetch wrapper for all backend calls.
 */
const API = (() => {
    const BASE = 'http://localhost:5000';

    async function get(path, params = {}) {
        const url = new URL(BASE + path);
        Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
        const res = await fetch(url);
        if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
        return res.json();
    }

    async function post(path, body = {}) {
        const res = await fetch(BASE + path, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`API ${res.status}`);
        return res.json();
    }

    async function upload(path, formData) {
        const res = await fetch(BASE + path, { method: 'POST', body: formData });
        if (!res.ok) throw new Error(`API ${res.status}`);
        return res.json();
    }

    function downloadUrl(path, params = {}) {
        const url = new URL(BASE + path);
        Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
        return url.toString();
    }

    return { get, post, upload, downloadUrl, BASE };
})();
