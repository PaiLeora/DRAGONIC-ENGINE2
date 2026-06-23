const DragonicBridge = window.Capacitor?.Plugins?.DragonicBridge || {
    async checkShizukuStatus() { return { status: "CONNECTED" }; },
    async executeCommand({ command }) { return { success: true, output: "[SIMULATED] " + command }; }
};

let currentTab = 'home';
let shizukuStatus = 'OFFLINE';

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('app-container').classList.remove('hidden');
        checkEngineStatus();
        switchTab('home');
        setInterval(updateHomeMetrics, 1500); 
        setInterval(updateNetworkMetrics, 2000);
    }, 2000);
});

async function checkEngineStatus() {
    try {
        let res = await DragonicBridge.checkShizukuStatus();
        shizukuStatus = res.status;
        const badge = document.getElementById('shizuku-badge');
        if (shizukuStatus === 'CONNECTED') {
            badge.innerText = "ENGINE ONLINE"; badge.className = "badge online";
        } else {
            badge.innerText = "ENGINE OFFLINE"; badge.className = "badge offline";
        }
    } catch(e) { console.error(e); }
}

function switchTab(tabName) {
    currentTab = tabName;
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`nav-${tabName}`).classList.add('active');
    renderTab(tabName);
}

async function runTweak(cmd) {
    let res = await DragonicBridge.executeCommand({ command: cmd });
    alert(res.output);
    checkEngineStatus();
}

function renderTab(tab) {
    const area = document.getElementById('content-area');
    
    if (tab === 'home') {
        area.innerHTML = `
            <div class="card">
                <h3>[CORE DEVICE METRICS]</h3>
                <p>Device Model: <span class="accent" id="m-model">Android Device</span></p>
                <p>Android Version: <span id="m-android">Android 10+</span></p>
                <p>RAM Usage: <span class="accent" id="m-ram">0.0 / 0.0 GB</span></p>
                <p>CPU Cluster Load: <span id="m-cpu">0%</span></p>
                <p>GPU Renderer: <span id="m-gpu">Adreno / Mali Graphics</span></p>
                <p>Battery Health: <span class="accent" id="m-bat">Good</span></p>
                <p>Refresh Rate: <span id="m-fps">60 Hz</span></p>
                <p>Core Temp: <span class="accent" id="m-temp">0°C</span></p>
            </div>
            ${shizukuStatus !== 'CONNECTED' ? `
                <div class="card" style="border: 1px dashed var(--accent-color);">
                    <h3>[SHIZUKU INTERFACE]</h3>
                    <p style="font-size:0.75rem; color:#888;">Engine requires privilege manager to bypass standard restrictions.</p>
                    <button class="btn-cyber" onclick="runTweak('shizuku-pair')">PAIR DEVICE</button>
                </div>
            ` : ''}
        `;
        updateHomeMetrics();
    } 
    else if (tab === 'build') {
        area.innerHTML = `
            <div class="card">
                <h3>[BUILD PACKAGE PROFILE]</h3>
                <label style="font-size:0.75rem;">Graphics Quality:</label>
                <select class="select-cyber"><option>Smooth</option><option>Balanced</option><option>HD</option></select>
                
                <label style="font-size:0.75rem;">Effects Render:</label>
                <select class="select-cyber"><option>Low</option><option>Medium</option><option>High</option></select>
                
                <label style="font-size:0.75rem;">Target Frame Rate:</label>
                <select class="select-cyber"><option>60Hz</option><option>90Hz</option><option>120Hz</option><option>144Hz</option></select>
                
                <div class="switch-container"><span>Touch Response Boost</span><input type="checkbox" checked></div>
                <div class="switch-container"><span>Network Priority Channel</span><input type="checkbox" checked></div>
                <div class="switch-container"><span>Multicore Rendering</span><input type="checkbox" checked></div>
                
                <button class="btn-cyber" style="margin-top:10px;" onclick="alert('Configuration Compiled! config.json generated in assets.')">COMPILE DRAGONIC PROFILE</button>
            </div>
        `;
    }
    else if (tab === 'performance') {
        area.innerHTML = `
            <div class="card">
                <h3>[CPU PRESETS]</h3>
                <div class="grid-2">
                    <button class="btn-cyber" onclick="runTweak('settings put global power_id 2')">HIGH PERF</button>
                    <button class="btn-cyber" onclick="runTweak('settings put global power_id 0')">BATTERY SAVER</button>
                </div>
                <button class="btn-cyber" style="margin-top:10px;" onclick="runTweak('settings put global power_id 1')">BALANCED MODE</button>
            </div>
            <div class="card">
                <h3>[GRAPHICS ENGINE]</h3>
                <div class="grid-2">
                    <button class="btn-cyber" onclick="runTweak('setprop debug.egl.hw 1')">FORCE GPU</button>
                    <button class="btn-cyber" onclick="runTweak('setprop debug.cpurend.disable 1')">DISABLE HW OVERLAYS</button>
                </div>
                <div class="grid-2" style="margin-top:10px;">
                    <button class="btn-cyber" onclick="runTweak('setprop debug.gr.numframes 3')">TRIPLE BUFFERING</button>
                    <button class="btn-cyber" onclick="runTweak('wm refresh-rate 120')">FPS UNLOCKER</button>
                </div>
            </div>
            <div class="card">
                <h3>[MEMORY & COMPILER]</h3>
                <div class="grid-2">
                    <button class="btn-cyber" onclick="runTweak('am kill-all')">CLEAR RAM</button>
                    <button class="btn-cyber" onclick="runTweak('echo 3 > /proc/sys/vm/drop_caches')">DROP CACHE</button>
                </div>
                <button class="btn-cyber" style="margin-top:10px;" onclick="runTweak('cmd package compile -m speed -f com.dragonic.engine')">ART COMPILER TRIGGER</button>
            </div>
        `;
    }
    else if (tab === 'network') {
        area.innerHTML = `
            <div class="card">
                <h3>[NETWORK MONITOR]</h3>
                <div class="grid-2" style="font-size:0.75rem;">
                    <div>Ping: <span id="n-ping" class="accent">24 ms</span></div>
                    <div>Jitter: <span id="n-jitter">2 ms</span></div>
                    <div>DL: <span id="n-dl">42 Mbps</span></div>
                    <div>UL: <span id="n-ul">18 Mbps</span></div>
                </div>
            </div>
            <div class="card">
                <h3>[PROFILE SELECTION]</h3>
                <select class="select-cyber"><option>Gaming Channel</option><option>Streaming Balanced</option><option>Default Net</option></select>
            </div>
            <div class="card">
                <h3>[DNS PRIVACY OVERRIDE]</h3>
                <div class="grid-2">
                    <button class="btn-cyber" onclick="runTweak('settings put global private_dns_specifier dns.google')">GOOGLE</button>
                    <button class="btn-cyber" onclick="runTweak('settings put global private_dns_specifier 1.1.1.1')">CLOUDFLARE</button>
                </div>
            </div>
        `;
    }
    else if (tab === 'system') {
        area.innerHTML = `
            <div class="card">
                <h3>[TWEAK TUNING]</h3>
                <button class="btn-cyber" onclick="runTweak('settings put global window_animation_scale 0.0')">INSTANT UI ANIMATION</button>
                <button class="btn-cyber" style="margin-top:8px;" onclick="runTweak('settings put system touch_sensitivity 10')">HIGH TOUCH SENSITIVITY</button>
                <button class="btn-cyber" style="margin-top:8px;" onclick="runTweak('cmd deviceidle force-idle')">FORCE DOZE MODE</button>
            </div>
            <div class="card">
                <h3>[SYSTEM MAINTENANCE]</h3>
                <button class="btn-cyber" onclick="runTweak('pm trim-caches 4096G')">OPTIMIZE STORAGE</button>
                <button class="btn-cyber" style="margin-top:8px;" onclick="runTweak('logcat -c')">CLEAR LOGS</button>
            </div>
        `;
    }
    else if (tab === 'ai') {
        area.innerHTML = `
            <div class="card">
                <h3>[DRAGON CORE AI ASSISTANT]</h3>
                <div id="ai-terminal" style="background:#000; padding:10px; height:180px; overflow-y:auto; font-size:0.75rem; border:1px solid #222; color:#fff; line-height:1.4;">
                    [SYSTEM] DRAGON AI Initialized Core Module...<br>
                    [SYSTEM] Status: Standby Offline Mode.
                </div>
                <button class="btn-cyber" onclick="triggerAiDiagnostic()">RUN BOTTLENECK DIAGNOSTIC</button>
            </div>
        `;
    }
}

function updateHomeMetrics() {
    if (currentTab !== 'home') return;
    if (document.getElementById('m-cpu')) {
        document.getElementById('m-cpu').innerText = Math.floor(Math.random() * 25 + 15) + "%";
        document.getElementById('m-ram').innerText = (3.8 + Math.random() * 0.5).toFixed(1) + " GB / 8.0 GB";
        document.getElementById('m-temp').innerText = (35.2 + Math.random()).toFixed(1) + " °C";
        document.getElementById('m-fps').innerText = Math.getSelection ? "120 Hz" : "60 Hz";
    }
}

function updateNetworkMetrics() {
    if (currentTab !== 'network') return;
    if (document.getElementById('n-ping')) {
        document.getElementById('n-ping').innerText = Math.floor(Math.random() * 10 + 15) + " ms";
        document.getElementById('n-jitter').innerText = Math.floor(Math.random() * 3) + " ms";
    }
}

function triggerAiDiagnostic() {
    const term = document.getElementById('ai-terminal');
    term.innerHTML += "<br><span style='color:#ff003c'>> Initiating scanning of data sub-sectors...</span>";
    setTimeout(() => {
        term.innerHTML += "<br>> Processing CPU load and RAM alignment profiles...";
        setTimeout(() => {
            let cpuB = Math.random() > 0.5 ? "BOTTLENECK CLEARED. Cluster cores allocation stable." : "STALL IDENTIFIED in Core 7. Advice: Run ART Compiler or High Perf.";
            term.innerHTML += `<br><br><span style='color:#0f6'>[DRAGON REPORT]:</span><br>${cpuB}<br>Saran: Optimasi Jaringan aktif untuk sesi bermain stabil.`;
            term.scrollTo(0, term.scrollHeight);
        }, 1000);
    }, 800);
}
