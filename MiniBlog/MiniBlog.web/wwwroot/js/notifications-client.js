/**
 * MiniBlog — Notification client
 * Connects to SignalR hub, shows toasts on real-time events,
 * and keeps the bell badge up to date.
 */
(function () {
    const badge = document.getElementById('notif-badge');

    // ── Load initial unread count ─────────────────────────────────────
    fetch('/api/Notifications/unread-count')
        .then(r => r.json())
        .then(data => updateBadge(data.count))
        .catch(() => { /* silently ignore if not logged in */ });

    // ── SignalR connection ────────────────────────────────────────────
    const connection = new signalR.HubConnectionBuilder()
        .withUrl('/notificationHub')
        .withAutomaticReconnect()
        .build();

    connection.start()
        .then(() => console.log('[SignalR] Connected to NotificationHub'))
        .catch(err => console.warn('[SignalR] Could not connect:', err));

    // ── Handle incoming notification ──────────────────────────────────
    connection.on('ReceiveNotification', function (payload) {
        const msg  = payload.message || payload; // support both object & plain string
        const type = (payload.type || 'default').toLowerCase();

        // Toast
        const emoji = type === 'like'    ? '❤️'
                    : type === 'comment' ? '💬'
                    : type === 'follow'  ? '👤'
                    : '🔔';
        if (typeof showToast === 'function') {
            showToast(`${emoji} ${msg}`, 'info', 5000);
        }

        // Bump badge
        if (badge) {
            const current = parseInt(badge.textContent || '0', 10);
            updateBadge(current + 1);
        }
    });

    function updateBadge(count) {
        if (!badge) return;
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'inline-flex';
        } else {
            badge.style.display = 'none';
        }
    }

    // ── Expose helper so controllers can push a notification ─────────
    window.sendNotification = function (userId, message, type) {
        return fetch('/api/Notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ UserId: userId, Message: message, Type: type })
        });
    };
})();
