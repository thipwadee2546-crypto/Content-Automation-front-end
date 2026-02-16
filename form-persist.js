/**
 * form-persist.js — Shared utility for form persistence + auto-refresh + toast
 * ใช้ร่วมกันทุกหน้า: content.html, post.html, dashboard.html
 */

// =====================================================
// 1. FORM PERSIST — จำค่าฟอร์มแม้เปลี่ยนหน้า
// =====================================================
const FormPersist = {
    /**
     * ผูก fields กับ localStorage
     * @param {string} pageKey - ชื่อหน้า เช่น "content", "post" (ใช้เป็น prefix)
     * @param {string[]} fieldIds - array ของ ID ของ input/textarea/select
     *
     * ตัวอย่าง: FormPersist.init('content', ['productName', 'productDesc', 'mediaType'])
     */
    init(pageKey, fieldIds) {
        this._pageKey = pageKey;
        this._fieldIds = fieldIds;

        // Restore saved values on page load
        this._restore();

        // Auto-save on every input/change
        fieldIds.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;

            const eventType = (el.tagName === 'SELECT' || el.type === 'radio' || el.type === 'checkbox')
                ? 'change' : 'input';

            el.addEventListener(eventType, () => this._save());
        });

        // Handle radio buttons specially (they share the same name)
        document.querySelectorAll(`input[type="radio"]`).forEach(radio => {
            if (fieldIds.includes(radio.name)) {
                radio.addEventListener('change', () => this._saveRadio(radio.name));
            }
        });
    },

    /** Save all field values to localStorage */
    _save() {
        const data = {};
        this._fieldIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) data[id] = el.value;
        });
        localStorage.setItem(`draft_${this._pageKey}`, JSON.stringify(data));
    },

    /** Save radio button value */
    _saveRadio(name) {
        const checked = document.querySelector(`input[name="${name}"]:checked`);
        if (checked) {
            const data = this._loadData();
            data[name] = checked.value;
            localStorage.setItem(`draft_${this._pageKey}`, JSON.stringify(data));
        }
    },

    /** Restore saved values from localStorage */
    _restore() {
        const data = this._loadData();
        if (!data || Object.keys(data).length === 0) return;

        this._fieldIds.forEach(id => {
            if (data[id] === undefined || data[id] === null) return;

            const el = document.getElementById(id);
            if (el) {
                el.value = data[id];
                return;
            }

            // Check if it's a radio button group
            const radio = document.querySelector(`input[name="${id}"][value="${data[id]}"]`);
            if (radio) radio.checked = true;
        });
    },

    /** Load raw data from localStorage */
    _loadData() {
        try {
            return JSON.parse(localStorage.getItem(`draft_${this._pageKey}`)) || {};
        } catch { return {}; }
    },

    /** Clear saved draft (call after successful submit) */
    clear() {
        localStorage.removeItem(`draft_${this._pageKey}`);
    }
};


// =====================================================
// 2. AUTO-REFRESH — poll ข้อมูลอัตโนมัติ
// =====================================================
const AutoRefresh = {
    _timers: {},
    _isUserTyping: false,

    /**
     * เริ่ม auto-refresh
     * @param {string} name - ชื่อ timer เช่น "contentList"
     * @param {Function} callback - function ที่จะเรียกซ้ำ
     * @param {number} intervalMs - ระยะเวลา (ms) เช่น 10000 = 10 วินาที
     */
    start(name, callback, intervalMs) {
        // Stop existing timer if any
        this.stop(name);

        this._timers[name] = setInterval(() => {
            // Skip refresh if user is typing
            if (this._isUserTyping) return;
            callback();
        }, intervalMs);
    },

    /** หยุด timer */
    stop(name) {
        if (this._timers[name]) {
            clearInterval(this._timers[name]);
            delete this._timers[name];
        }
    },

    /** เปลี่ยนความถี่ (เช่น poll ถี่ขึ้นตอน processing) */
    changeInterval(name, callback, newIntervalMs) {
        this.start(name, callback, newIntervalMs);
    },

    /**
     * ผูกกับฟอร์ม — pause refresh ตอน user พิมพ์
     * @param {string} formId - ID ของ form
     */
    pauseWhileTyping(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        form.addEventListener('focusin', () => { this._isUserTyping = true; });
        form.addEventListener('focusout', () => {
            // Delay เล็กน้อยก่อน resume
            setTimeout(() => { this._isUserTyping = false; }, 1000);
        });
    }
};


// =====================================================
// 3. TOAST — แจ้งเตือนเล็กๆ มุมล่างขวา
// =====================================================
const Toast = {
    _container: null,

    /** สร้าง container (เรียกครั้งเดียว) */
    _ensureContainer() {
        if (this._container) return;
        this._container = document.createElement('div');
        this._container.id = 'toast-container';
        this._container.style.cssText = `
            position: fixed; bottom: 24px; right: 24px; z-index: 9999;
            display: flex; flex-direction: column; gap: 8px; pointer-events: none;
        `;
        document.body.appendChild(this._container);
    },

    /**
     * แสดง toast
     * @param {string} message - ข้อความ
     * @param {string} type - "success" | "info" | "error"
     * @param {number} duration - แสดงกี่มิลลิวินาที (default 3000)
     */
    show(message, type = 'info', duration = 3000) {
        this._ensureContainer();

        const colors = {
            success: 'background: #10b981; color: white;',
            info: 'background: #6366f1; color: white;',
            error: 'background: #ef4444; color: white;'
        };
        const icons = { success: '✓', info: 'ℹ', error: '✕' };

        const toast = document.createElement('div');
        toast.style.cssText = `
            ${colors[type] || colors.info}
            padding: 12px 20px; border-radius: 12px;
            font-size: 14px; font-family: 'Sarabun', sans-serif;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            display: flex; align-items: center; gap: 8px;
            transform: translateX(120%); transition: transform 0.3s ease;
            pointer-events: auto;
        `;
        toast.innerHTML = `<span style="font-size:16px">${icons[type] || icons.info}</span> ${message}`;

        this._container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });

        // Animate out + remove
        setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
};
