document.addEventListener('DOMContentLoaded', () => {
    // --- EXPRESS FOOD DELIVERY TRACKER LOGIC ---
    let currentDeliveryState = 0;
    const deliveryStates = ["received", "prep", "delivery", "arrived"];

    function updateDeliveryTracker() {
        const steps = document.querySelectorAll('.delivery-step');
        const barEl = document.querySelector('.delivery-progress-fill');

        if (!barEl || steps.length === 0) return;

        // Reset visual state
        steps.forEach(step => {
            step.classList.remove('active');
            const dot = step.querySelector('.step-dot');
            if (dot) dot.style.background = "rgba(255,255,255,0.2)";
        });

        const percentage = Math.max(5, (currentDeliveryState + 1) * 25);
        barEl.style.width = percentage + "%";

        for (let i = 0; i <= currentDeliveryState; i++) {
            if (steps[i]) {
                steps[i].classList.add('active');
                const dot = steps[i].querySelector('.step-dot');
                if (dot) dot.style.background = "var(--google-blue)";
            }
        }

        currentDeliveryState++;

        // Loop back for showcase infinite demo purposes
        if (currentDeliveryState >= deliveryStates.length) {
            setTimeout(() => {
                currentDeliveryState = 0;
                steps.forEach(step => step.classList.remove('active'));
                barEl.style.width = "0%";
            }, 8000);
        }
    }

    // Start Tracker updates
    setInterval(updateDeliveryTracker, 5000);
    updateDeliveryTracker();

    // --- NAVIGATION & UI LOGIC ---
    const navItems = document.querySelectorAll('.nav-item');
    const views = document.querySelectorAll('.view');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetView = item.id === 'btn-dashboard' ? 'dashboard' :
                item.id === 'btn-nav' ? 'nav-view' :
                    item.id === 'btn-queues' ? 'queue-view' :
                        item.id === 'btn-admin' ? 'admin-view' : 'wallet-view';

            // Update active state in sidebar
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            // Switch views
            views.forEach(v => v.classList.remove('active'));
            const target = document.getElementById(targetView);
            // Some targetViews like admin-view might not exist on the user app anymore, but that's fine.
            if (target) target.classList.add('active');

            showToast(`Navigated to ${item.innerText.trim()}`);
        });
    });

    // --- SYNCED GLOBAL STATE ---
    function updateStats() {
        const globalData = localStorage.getItem('globalVenueState');
        let currentZones = [];

        if (globalData) {
            currentZones = JSON.parse(globalData);
        } else {
            // Fallback if Admin app isn't open
            currentZones = [
                { name: "Main Gate 1", density: 40 },
                { name: "Concessions West", density: 65 },
                { name: "Gate 3 Exit", density: 85 }
            ];
            // Fluctuate fallback
            currentZones.forEach(g => {
                g.density += (Math.random() * 20) - 10;
            });
        }

        const sortedGates = [...currentZones].sort((a, b) => a.density - b.density);
        const bestGate = sortedGates[0];
        const worstGate = sortedGates[sortedGates.length - 1];

        // Update Recommended Gate UI in nav-view
        const bestEl = document.getElementById('fastest-gate-name');
        const bestStatEl = document.getElementById('fastest-gate-status');
        if (bestEl && bestStatEl && bestGate) {
            bestEl.innerText = `${bestGate.name} (Wait: ~${Math.floor(bestGate.density / 10)} mins)`;
            bestStatEl.innerText = `Smooth Flow (${Math.floor(bestGate.density)}% Density)`;
        }

        // Update Alert Banner UI if worst gate is critically crowded
        const alertBox = document.getElementById('gate-alert-box');
        const badEl = document.getElementById('bad-gate-name');
        const goodEl = document.getElementById('good-gate-name');

        if (alertBox && worstGate && worstGate.density > 75) {
            alertBox.style.display = 'block';
            if (badEl) badEl.innerText = worstGate.name;
            if (goodEl) goodEl.innerText = bestGate.name;
        } else if (alertBox) {
            alertBox.style.display = 'none';
        }
    }

    setInterval(updateStats, 5000);
    updateStats(); // Initial call

    // --- TOAST NOTIFICATION SYSTEM ---
    function showToast(message) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast glass animate-in';
        toast.innerHTML = `<span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    // Dynamic style injection for Toast
    const style = document.createElement('style');
    style.innerHTML = `
        #toast-container { position: fixed; top: 100px; right: 40px; display: flex; flex-direction: column; gap: 10px; z-index: 10000; }
        .toast { padding: 12px 24px; border-radius: 12px; color: white; border: 1px solid rgba(255,255,255,0.1); font-weight: 500; font-size: 0.9rem; transition: opacity 0.5s ease; }
    `;
    document.head.appendChild(style);

});
