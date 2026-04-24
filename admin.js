document.addEventListener('DOMContentLoaded', () => {

    // ==================== ZONE DATA ====================
    const zones = [
        { id: 'z1', name: 'Main Gate 1', density: 40, cooldown: 0, staffList: ['SJ', 'Mike R.', 'Elena K.', 'Paul O.', 'Alex F.', 'Tom H.', 'John M.', 'Ben G.', 'Chloe I.', 'Nina P.'] },
        { id: 'z2', name: 'Concessions West', density: 65, cooldown: 0, staffList: ['Alice W.', 'David L.', 'Fiona N.', 'Greg U.', 'Zoe A.', 'Chris B.', 'Mark D.', 'Lucy K.', 'Steve M.', 'Emma T.', 'Sam Q.', 'Lily V.'] },
        { id: 'z3', name: 'Washroom Sector 4', density: 30, cooldown: 0, staffList: ['Sarah J.', 'Bob C.', 'Dan J.', 'Kim Y.', 'Peter W.'] },
        { id: 'z4', name: 'VIP Entrance', density: 20, cooldown: 0, staffList: ['Victor H.', 'Rachel M.', 'Leo S.', 'Nina Q.', 'Tony B.', 'Gina L.', 'Omer K.', 'Ray D.'] },
        { id: 'z5', name: 'Gate 3 Exit', density: 85, cooldown: 0, staffList: ['Kyle C.', 'Maria F.', 'Luke H.', 'Jen P.', 'Zack E.', 'Omar T.', 'Vince L.', 'Stan M.', 'Irene S.', 'Chad N.'] }
    ];

    // ==================== CONCESSION DATA ====================
    const concessionStands = [
        { name: 'Stand 1 — Biryani', queue: 12, waitMin: 8, status: 'busy', icon: '🍛' },
        { name: 'Stand 2 — Burgers', queue: 6, waitMin: 4, status: 'normal', icon: '🍔' },
        { name: 'Stand 3 — Chaat Corner', queue: 18, waitMin: 12, status: 'critical', icon: '🥘' },
        { name: 'Stand 4 — Pizza', queue: 4, waitMin: 3, status: 'normal', icon: '🍕' },
        { name: 'Stand 5 — Bar', queue: 15, waitMin: 10, status: 'busy', icon: '🍺' },
        { name: 'Stand 6 — Ice Cream', queue: 2, waitMin: 1, status: 'normal', icon: '🍦' }
    ];

    const stockItems = [
        { name: 'Chicken Biryani', level: 15, status: 'low' },
        { name: 'Veg Burger', level: 82, status: 'good' },
        { name: 'Paneer Tikka', level: 65, status: 'good' },
        { name: 'Craft Beer', level: 0, status: 'out' },
        { name: 'Cold Coffee', level: 45, status: 'good' },
        { name: 'Masala Dosa', level: 28, status: 'low' },
        { name: 'Samosa', level: 70, status: 'good' },
        { name: 'Mango Lassi', level: 55, status: 'good' }
    ];

    const lockerBanks = [
        { name: 'Locker Bank A — NW', used: 42, total: 50, status: 'busy' },
        { name: 'Locker Bank B — NE', used: 28, total: 50, status: 'normal' },
        { name: 'Locker Bank C — SW', used: 50, total: 50, status: 'full' },
        { name: 'Locker Bank D — SE', used: 15, total: 50, status: 'normal' }
    ];

    // ==================== FILL RATE DATA ====================
    const fillRateData = [];
    for (let i = 0; i < 30; i++) {
        fillRateData.push(55 + Math.random() * 35);
    }

    // ==================== ELEMENT REFS ====================
    const container = document.getElementById('zones-container');
    const logBox = document.getElementById('system-log');
    let totalReroutes = 0;
    let paCount = 2;
    let evacuationActive = false;

    // ==================== VIEW SWITCHING ====================
    window.switchAdminView = function (view) {
        document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('active'));
        document.querySelectorAll('.admin-sidebar .nav-item').forEach(n => n.classList.remove('active'));
        document.getElementById(`view-${view}`).classList.add('active');
        document.getElementById(`btn-${view}`).classList.add('active');
    };

    // ==================== DISPATCHER: RENDER ZONES ====================
    function renderZones() {
        if (!container) return;
        container.innerHTML = '';
        let maxDensity = 0;
        let peakZoneName = '';
        let criticalFound = false;

        zones.forEach(zone => {
            if (zone.density > maxDensity) {
                maxDensity = zone.density;
                peakZoneName = zone.name;
            }
            if (zone.density > 90) criticalFound = true;

            let stateClass = 'safe';
            let stateText = 'Normal';
            if (zone.density > 90) { stateClass = 'critical pulse-red'; stateText = 'OVERCROWDED'; }
            else if (zone.density > 75) { stateClass = 'warning'; stateText = 'Heavy'; }

            const staffChips = zone.staffList.slice(0, 3).map(name => `<span style="display:inline-block; background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px; margin-right:4px; font-size:0.75rem;">${name}</span>`).join('');
            const moreStaff = zone.staffList.length > 3 ? `<span style="color:#aaa; font-size:0.75rem;">+${zone.staffList.length - 3}</span>` : '';

            const densityColor = zone.density > 90 ? 'var(--google-red)' : zone.density > 75 ? 'var(--google-yellow)' : 'var(--google-green)';

            const card = document.createElement('div');
            card.className = `zone-card ${stateClass}`;
            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h3 style="margin-bottom:5px;">${zone.name}</h3>
                        <p style="font-size: 0.8rem; color: #aaa;">Status: <span style="font-weight:bold; color:${densityColor};">${stateText}</span> | Density: ${Math.floor(zone.density)}%</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 1.2rem; font-weight: bold;">${zone.staffList.length} <span style="font-size:0.8rem; font-weight:normal; color:#aaa;">Staff</span></div>
                    </div>
                </div>
                <div style="height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; margin-top: 10px; overflow: hidden;">
                    <div style="height: 100%; width: ${Math.min(zone.density, 100)}%; background: ${densityColor}; border-radius: 2px; transition: width 1s ease;"></div>
                </div>
                <div style="margin-top: 8px; font-size: 0.75rem;">
                    <strong style="color: #555; margin-right: 5px;">DEPLOYED:</strong> ${staffChips} ${moreStaff}
                </div>
            `;
            container.appendChild(card);
        });

        document.getElementById('peak-zone').innerText = peakZoneName;
        document.getElementById('peak-density').innerText = `Currently at ${Math.floor(maxDensity)}% capacity`;

        const totalStaff = zones.reduce((acc, zone) => acc + zone.staffList.length, 0);
        document.getElementById('total-staff').innerText = totalStaff;

        const gStatus = document.getElementById('global-status');
        const gStatusCard = document.getElementById('global-status-card');
        if (criticalFound) {
            gStatus.innerText = 'CRITICAL RESPONSE';
            gStatus.style.color = 'var(--google-red)';
            gStatusCard.style.borderLeft = '4px solid var(--google-red)';
        } else {
            gStatus.innerText = 'Stable';
            gStatus.style.color = 'var(--google-green)';
            gStatusCard.style.borderLeft = 'none';
        }
    }

    // ==================== FILL RATE CHART ====================
    function renderFillRate() {
        const chart = document.getElementById('fill-rate-chart');
        if (!chart) return;
        chart.innerHTML = '';
        fillRateData.forEach(val => {
            const bar = document.createElement('div');
            bar.className = 'fill-bar';
            bar.style.height = val + '%';
            bar.style.background = val > 85 ? 'var(--google-red)' : val > 65 ? 'var(--google-yellow)' : 'var(--google-green)';
            chart.appendChild(bar);
        });
    }

    // ==================== CONCESSIONS ====================
    function renderConcessions() {
        const grid = document.getElementById('concession-stands');
        if (!grid) return;
        grid.innerHTML = '';

        concessionStands.forEach(stand => {
            const queuePct = Math.min((stand.waitMin / 15) * 100, 100);
            const barColor = stand.status === 'critical' ? 'var(--google-red)' : stand.status === 'busy' ? 'var(--google-yellow)' : 'var(--google-green)';
            const statusLabel = stand.status === 'critical' ? '🔴 SURGE' : stand.status === 'busy' ? '🟡 Busy' : '🟢 Normal';

            const card = document.createElement('div');
            card.className = 'concession-card';
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span style="font-weight:600;">${stand.icon} ${stand.name}</span>
                    <span style="font-size:0.75rem;">${statusLabel}</span>
                </div>
                <div style="font-size:2rem; font-weight:700; margin:5px 0;">${stand.waitMin} <span style="font-size:0.9rem; color:#aaa; font-weight:normal;">min</span></div>
                <div class="queue-bar-track">
                    <div class="queue-bar-fill" style="width:${queuePct}%; background:${barColor};"></div>
                </div>
                <div style="font-size:0.78rem; color:#aaa;">${stand.queue} people in queue</div>
            `;
            grid.appendChild(card);
        });
    }

    function renderStockLevels() {
        const el = document.getElementById('stock-levels');
        if (!el) return;
        el.innerHTML = stockItems.map(item => {
            const cls = item.status === 'out' ? 'stock-out' : item.status === 'low' ? 'stock-low' : 'stock-good';
            const label = item.status === 'out' ? 'OUT' : item.status === 'low' ? 'LOW' : `${item.level}%`;
            return `<div class="stock-item"><span>${item.name}</span><span class="stock-level ${cls}">${label}</span></div>`;
        }).join('');
    }

    function renderLockerBanks() {
        const el = document.getElementById('locker-banks');
        if (!el) return;
        el.innerHTML = lockerBanks.map(bank => {
            const pct = (bank.used / bank.total) * 100;
            const color = bank.status === 'full' ? 'var(--google-red)' : bank.status === 'busy' ? 'var(--google-yellow)' : 'var(--google-green)';
            const label = bank.status === 'full' ? '🔴 FULL' : bank.status === 'busy' ? '🟡 Filling' : '🟢 Available';
            return `
                <div style="margin-bottom:12px;">
                    <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:4px;">
                        <span>${bank.name}</span><span style="font-size:0.75rem;">${label}</span>
                    </div>
                    <div class="queue-bar-track">
                        <div class="queue-bar-fill" style="width:${pct}%; background:${color};"></div>
                    </div>
                    <div style="font-size:0.7rem; color:#555; margin-top:2px;">${bank.used}/${bank.total} occupied</div>
                </div>
            `;
        }).join('');
    }

    // ==================== SAFETY ====================
    window.toggleEvacuation = function () {
        evacuationActive = !evacuationActive;
        const bar = document.getElementById('emergency-bar');
        const btn = document.getElementById('evac-btn');
        if (evacuationActive) {
            bar.className = 'emergency-status-bar emergency-alert';
            bar.innerHTML = '<span style="font-size: 1.2rem;">🚨</span><span>EVACUATION IN PROGRESS — All exits activated</span><span style="margin-left: auto; font-size: 0.8rem; opacity: 0.7;">Push notifications sent to all 58,230 attendees</span>';
            btn.innerText = '⬛ Cancel Evacuation';
            btn.style.background = '#333';
            addLog('<span style="color:var(--google-red)">[EMERGENCY]</span> Evacuation protocol ACTIVATED by Venue Ops Manager.');
            showToast('🚨 EVACUATION PROTOCOL ACTIVATED');

            // Send evac notification to staff app
            const evacPayload = { timestamp: Date.now(), type: 'evacuation', message: 'EVACUATION — Guide attendees to nearest exit immediately!' };
            localStorage.setItem('staffRelocationOrder', JSON.stringify({ timestamp: Date.now(), from: 'ALL ZONES', to: 'NEAREST EXIT', count: 0, guardName: 'ALL', type: 'evacuation' }));
        } else {
            bar.className = 'emergency-status-bar emergency-normal';
            bar.innerHTML = '<span style="font-size: 1.2rem;">✅</span><span>System Status: NORMAL — No Active Emergency</span><span style="margin-left: auto; font-size: 0.8rem; opacity: 0.7;">All emergency services connected · Evacuation routes pre-loaded</span>';
            btn.innerText = '🚨 Trigger Evacuation';
            btn.style.background = '';
            addLog('<span style="color:var(--google-green)">[EMERGENCY]</span> Evacuation protocol CANCELLED. Resuming normal operations.');
            showToast('✅ Evacuation cancelled — Normal operations resumed');
        }
    };

    // ==================== INCIDENT CREATION ====================
    let incidentCounter = 43;
    window.createIncident = function () {
        const types = ['Crowd Surge', 'Medical', 'Spill Hazard', 'Unattended Bag', 'Fight / Altercation', 'Equipment Failure'];
        const locations = ['Gate A', 'Gate C', 'Section 12', 'Section 22', 'Concourse W', 'VIP Lounge', 'Washroom S4'];
        const severities = ['high', 'medium', 'low'];
        const teams = ['Team Alpha', 'Team Bravo', 'Med Unit 1', 'Security Lead', 'Maint. Crew'];

        const type = types[Math.floor(Math.random() * types.length)];
        const loc = locations[Math.floor(Math.random() * locations.length)];
        const sev = severities[Math.floor(Math.random() * severities.length)];
        const team = teams[Math.floor(Math.random() * teams.length)];
        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const tbody = document.getElementById('incident-table-body');
        const row = document.createElement('tr');
        row.style.animation = 'fadeIn 0.5s ease-out';
        row.innerHTML = `
            <td>#INC-${String(incidentCounter++).padStart(3, '0')}</td>
            <td>${type}</td>
            <td>${loc}</td>
            <td><span class="severity-badge severity-${sev}">${sev.toUpperCase()}</span></td>
            <td><span class="status-active">● Active</span></td>
            <td>${time}</td>
            <td>${team}</td>
        `;
        tbody.insertBefore(row, tbody.firstChild);

        const count = parseInt(document.getElementById('open-incidents').innerText) + 1;
        document.getElementById('open-incidents').innerText = count;
        document.getElementById('incident-badge').innerText = count;

        addLog(`<span style="color:var(--google-red)">[INCIDENT]</span> New ${sev.toUpperCase()} incident: ${type} at ${loc}. Assigned to ${team}.`);
        showToast(`🚨 New Incident: ${type} at ${loc}`);
    };

    // ==================== LOG ====================
    function addLog(msg) {
        if (!logBox) return;
        const d = new Date();
        const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = `<span class="log-time">[${time}]</span> ${msg}`;
        logBox.insertBefore(entry, logBox.firstChild);
    }

    // ==================== AI DISPATCHER ====================
    function balanceLoad() {
        const criticalZones = zones.filter(z => z.density > 90 && z.cooldown <= 0);
        const safeZones = zones.filter(z => z.density < 50 && z.staffList.length > 4);

        if (criticalZones.length > 0 && safeZones.length > 0) {
            const cz = criticalZones[0];
            safeZones.sort((a, b) => a.density - b.density);
            const sz = safeZones[0];

            const staffToMove = Math.min(3, sz.staffList.length - 4);

            if (staffToMove > 0) {
                let relocatedNames = [];
                for (let i = 0; i < staffToMove; i++) {
                    const relocatedGuard = sz.staffList.pop();
                    cz.staffList.push(relocatedGuard);
                    relocatedNames.push(relocatedGuard);
                }

                cz.density -= 30;
                cz.cooldown = 4;

                totalReroutes++;
                document.getElementById('active-reroutes').innerText = totalReroutes;

                addLog(`<span style="color:var(--google-yellow)">[CROWD AI]</span> Re-allocated ${staffToMove} staff from '${sz.name}' to '${cz.name}'.`);
                showToast(`Staff moved to ${cz.name}`);

                // Auto PA
                paCount++;
                const paEl = document.getElementById('pa-count');
                if (paEl) paEl.innerText = paCount;
                const paList = document.getElementById('pa-messages-list');
                if (paList) {
                    const d = new Date();
                    const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
                    const paCard = document.createElement('div');
                    paCard.className = 'pa-card';
                    paCard.style.animation = 'fadeIn 0.5s ease-out';
                    paCard.innerHTML = `<span class="pa-time">${time}</span><span class="pa-type">AUTO</span><p style="margin-top:6px; font-size:0.85rem;">${cz.name}: Overcrowding detected. Staff re-allocated from ${sz.name}.</p>`;
                    paList.insertBefore(paCard, paList.firstChild);
                }

                // Staff Notification
                const targetGuard = relocatedNames.includes('SJ') ? 'SJ' : relocatedNames[0];
                const pushPayload = {
                    timestamp: Date.now(),
                    from: sz.name,
                    to: cz.name,
                    count: staffToMove,
                    guardName: targetGuard
                };
                localStorage.setItem('staffRelocationOrder', JSON.stringify(pushPayload));
                window.dispatchEvent(new Event('storage'));
            }
        }
    }

    // ==================== SIMULATION ====================
    function simulateCrowdFluctuation() {
        zones.forEach(z => {
            if (z.cooldown > 0) z.cooldown--;
            z.density += (Math.random() * 15) - 4;
            if (z.density > 100) z.density = 100;
            if (z.density < 5) z.density = 5;
        });

        // Update fill rate
        fillRateData.shift();
        const avgDensity = zones.reduce((a, z) => a + z.density, 0) / zones.length;
        fillRateData.push(avgDensity);

        // Fluctuate concessions
        concessionStands.forEach(s => {
            s.queue += Math.floor(Math.random() * 5) - 2;
            if (s.queue < 0) s.queue = 0;
            if (s.queue > 25) s.queue = 25;
            s.waitMin = Math.max(1, Math.round(s.queue * 0.65));
            s.status = s.waitMin > 10 ? 'critical' : s.waitMin > 5 ? 'busy' : 'normal';
        });

        renderZones();
        renderFillRate();
        renderConcessions();
        balanceLoad();

        // Broadcast to User App
        localStorage.setItem('globalVenueState', JSON.stringify(zones));

        // Update sidebar health
        const sensorEl = document.getElementById('sensor-count');
        const cameraEl = document.getElementById('camera-count');
        const latencyEl = document.getElementById('latency-val');
        if (sensorEl) sensorEl.innerText = `${845 + Math.floor(Math.random() * 5)}/850`;
        if (cameraEl) cameraEl.innerText = `${118 + Math.floor(Math.random() * 6)}/124`;
        if (latencyEl) latencyEl.innerText = `${18 + Math.floor(Math.random() * 12)}ms`;
    }

    // ==================== TOAST ====================
    function showToast(message) {
        const root = document.getElementById('toast-container');
        if (!root) return;
        const t = document.createElement('div');
        t.style.cssText = 'position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:rgba(66,133,244,0.9); color:white; padding:12px 24px; border-radius:20px; z-index:9999; font-family:inherit; font-size:0.9rem; backdrop-filter:blur(10px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); animation: fadeIn 0.3s ease-out;';
        t.innerText = message;
        root.appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.3s'; setTimeout(() => t.remove(), 300); }, 3000);
    }

    // ==================== INIT ====================
    renderZones();
    renderFillRate();
    renderConcessions();
    renderStockLevels();
    renderLockerBanks();

    setInterval(simulateCrowdFluctuation, 4000);
});
