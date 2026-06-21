/**
 * MiniBlog Toast Notification System
 * Usage: showToast('message', 'success' | 'error' | 'warning' | 'info')
 */
(function () {
    const icons = {
        success: '✓',
        error:   '✕',
        warning: '⚠',
        info:    'ℹ'
    };

    function showToast(message, type = 'info', duration = 3500) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-msg">${escapeHtml(message)}</span>
            <button class="toast-close" aria-label="Dismiss">×</button>
            <div class="toast-progress"></div>
        `;

        // Dismiss on close button
        toast.querySelector('.toast-close').addEventListener('click', () => dismiss(toast));

        container.appendChild(toast);

        // Auto dismiss
        const timer = setTimeout(() => dismiss(toast), duration);
        toast._timer = timer;
    }

    function dismiss(toast) {
        clearTimeout(toast._timer);
        toast.classList.add('hide');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Expose globally
    window.showToast = showToast;
})();
