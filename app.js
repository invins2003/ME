// Background Canvas Animation - Coder Matrix Nodes
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

function initCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = [];
    const numParticles = Math.floor(width * height / 15000);

    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1
        });
    }
}

function animateCanvas() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(0, 247, 255, 0.4)';

    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.strokeStyle = 'rgba(0, 247, 255, 0.04)';
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 150) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(animateCanvas);
}

window.addEventListener('resize', initCanvas);
initCanvas();
animateCanvas();

// Render Portfolio from PORTFOLIO_DATA (constants.js)
document.addEventListener('DOMContentLoaded', () => {
    buildPortfolio(PORTFOLIO_DATA);
});

function buildPortfolio(data) {
    if (!data) return;

    // Set Profile Avatar and GitHub link immediately (reliable shortcut)
    const githubUsername = 'invins2003';
    
    // Global helper for absolute links (prevents relative path errors on GitHub Pages)
    window.ensureAbsolute = (url) => {
        if (!url || url === '#') return '#';
        const str = String(url).trim();
        if (str.startsWith('http') || str.startsWith('mailto:') || str.startsWith('tel:')) return str;
        if (str.startsWith('www.')) return `https://${str}`;
        if (str.includes('.') || str.includes('/')) return `https://${str}`;
        return str;
    };

    console.log('LinkedIn URL from data:', data.socialLinks.linkedin);
    console.log('Formatted LinkedIn URL:', ensureAbsolute(data.socialLinks.linkedin));
    document.getElementById('user-avatar').src = `https://github.com/${githubUsername}.png`;
    document.getElementById('user-github').href = `https://github.com/${githubUsername}`;

    // Hero Section
    const nameEl = document.getElementById('user-name');
    nameEl.textContent = data.personalInfo.name;
    nameEl.setAttribute('data-text', data.personalInfo.name);

    document.getElementById('user-role').textContent = data.personalInfo.role;
    document.getElementById('user-summary').textContent = data.personalInfo.summary;
    document.getElementById('user-location').textContent = data.personalInfo.location;
    document.getElementById('user-email').textContent = data.personalInfo.email;
    document.getElementById('user-phone').textContent = data.personalInfo.phone;

    document.getElementById('user-linkedin').href = ensureAbsolute(data.socialLinks.linkedin);

    // Using pre-fetched projects from constants.js to avoid browser rate limits
    renderProjects(data.projects);

    // Render Experience Timeline
    const expList = document.getElementById('experience-list');
    data.experience.forEach((job, idx) => {
        const item = document.createElement('div');
        item.className = 'timeline-item fade-in';
        item.style.animationDelay = `${0.2 + idx * 0.1}s`;
        item.innerHTML = `
            <h4>${job.role}</h4>
            <div class="company">${job.company}</div>
            <div class="date">${job.duration}</div>
            <p>${job.description}</p>
        `;
        expList.appendChild(item);
    });

    // Render Education
    const eduList = document.getElementById('education-list');
    data.education.forEach((edu, idx) => {
        const item = document.createElement('div');
        item.className = 'timeline-item fade-in';
        item.style.animationDelay = `${0.3 + idx * 0.1}s`;
        item.innerHTML = `
            <h4 style="font-size: 1rem;">${edu.institution}</h4>
            <div class="company">${edu.degree}</div>
            <div class="date" style="font-size: 0.8rem">${edu.duration}</div>
        `;
        eduList.appendChild(item);
    });



    // Render Skills
    const skillsContainer = document.getElementById('skills-container');
    const categories = [
        { name: 'Languages', items: data.skills.languages },
        { name: 'Frameworks', items: data.skills.frameworks },
        { name: 'Tools', items: data.skills.tools },
        { name: 'Specialized', items: data.skills.specialized }
    ];

    categories.forEach((cat, idx) => {
        const block = document.createElement('div');
        block.className = 'skill-category fade-in';
        block.style.animationDelay = `${0.2 + idx * 0.1}s`;

        let tagsHtml = cat.items.map(t => `<span class="skill-tag">${t}</span>`).join('');

        block.innerHTML = `
            <h4>${cat.name}</h4>
            <div class="tags-container">
                ${tagsHtml}
            </div>
        `;
        skillsContainer.appendChild(block);
    });

    // Render Certifications
    const certList = document.getElementById('cert-list');
    data.certifications.forEach((cert, idx) => {
        const li = document.createElement('li');
        li.className = 'fade-in';
        li.style.animationDelay = `${0.3 + idx * 0.1}s`;
        li.textContent = cert;
        certList.appendChild(li);
    });

    // Initialize New UX Features
    initCursor();
    initCommandPalette(data);
    initHireMe();
    initBugInvaders();
    initPhoneSimulator(data);
}

// ---------------------------------------------------------
// CUSTOM CURSOR LOGIC
// ---------------------------------------------------------
function initCursor() {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    window.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // Event Delegation for hover effects - more robust for dynamic/modal content
    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('a, button, .repo-card, .timeline-item, .skill-tag, .palette-item, #palette-search, .showcase-container');
        if (target) {
            cursor.classList.add('hover');
            
            // Theme-aware cursor color
            if (target.closest('.green-theme')) {
                cursor.style.borderColor = '#22c55e';
                cursor.style.boxShadow = '0 0 15px rgba(34, 197, 94, 0.4)';
            } else {
                cursor.style.borderColor = 'var(--accent-primary)';
                cursor.style.boxShadow = '0 0 15px var(--accent-glow)';
            }
        } else {
            cursor.classList.remove('hover');
            cursor.style.borderColor = 'var(--accent-primary)';
            cursor.style.boxShadow = '0 0 15px var(--accent-glow)';
        }
    });
}

// ---------------------------------------------------------
// COMMAND PALETTE LOGIC
// ---------------------------------------------------------
function initCommandPalette(data) {
    const palette = document.getElementById('palette-modal');
    const searchInput = document.getElementById('palette-search');
    const resultsContainer = document.getElementById('palette-results');
    
    if (!palette) return;

    // Commands Registry
    const commands = [
        { title: 'Go to Experience', section: 'experience-list', icon: 'fa-briefcase', shortcut: 'E' },
        { title: 'Go to Projects', section: 'projects-grid', icon: 'fa-rocket', shortcut: 'P' },
        { title: 'View Technical Stack', section: 'skills-container', icon: 'fa-gears', shortcut: 'S' },
        { title: 'View Education', section: 'education-list', icon: 'fa-graduation-cap', shortcut: 'D' },
        { title: 'GitHub Profile', url: 'https://github.com/invins2003', icon: 'fa-github', shortcut: 'G' },
        { title: 'LinkedIn Profile', url: 'https://www.linkedin.com/in/ambit-misra-5b2202241', icon: 'fa-linkedin', shortcut: 'L' },
        { title: 'Game: Launch Bug Invaders', game: true, icon: 'fa-bug-slash', shortcut: 'G' }
    ];

    // Add Projects to palette
    data.projects.forEach(p => {
        commands.push({
            title: `Project: ${p.title}`,
            url: p.link,
            icon: 'fa-code-branch',
            shortcut: 'Proj'
        });
    });

    function togglePalette() {
        const isVisible = palette.style.display === 'flex';
        palette.style.display = isVisible ? 'none' : 'flex';
        if (!isVisible) {
            searchInput.value = '';
            searchInput.focus();
            renderResults('');
        }
    }

    function renderResults(query) {
        resultsContainer.innerHTML = '';
        const filtered = commands.filter(c => 
            c.title.toLowerCase().includes(query.toLowerCase())
        );

        filtered.forEach((cmd, idx) => {
            const item = document.createElement('div');
            item.className = 'palette-item';
            if (idx === 0) item.classList.add('active');
            
            item.innerHTML = `
                <div class="item-info">
                    <i class="fa-solid ${cmd.icon}"></i>
                    <span>${cmd.title}</span>
                </div>
                <span class="item-shortcut">${cmd.shortcut}</span>
            `;

            item.onclick = () => executeCommand(cmd);
            resultsContainer.appendChild(item);
        });
    }

    function executeCommand(cmd) {
        togglePalette();
        if (cmd.section) {
            document.getElementById(cmd.section).scrollIntoView({ behavior: 'smooth' });
        } else if (cmd.url) {
            window.open(cmd.url, '_blank');
        } else if (cmd.game) {
            document.getElementById('game-modal').style.display = 'flex';
        }
    }

    // Shortcut listener (Ctrl+K / Cmd+K)
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            togglePalette();
        }
        if (e.key === 'Escape' && palette.style.display === 'flex') {
            togglePalette();
        }
    });

    // Close on click outside
    palette.onclick = (e) => {
        if (e.target === palette) togglePalette();
    };

    // Search input listener
    searchInput.oninput = (e) => renderResults(e.target.value);
}

// ---------------------------------------------------------
// HIRE ME MODAL LOGIC
// ---------------------------------------------------------
function initHireMe() {
    const hireBtn = document.getElementById('hire-me-btn');
    const hireModal = document.getElementById('hire-modal');
    const closeBtns = document.querySelectorAll('.close-modal-btn');

    if (!hireBtn || !hireModal) return;

    hireBtn.onclick = () => {
        hireModal.style.display = 'flex';
    };

    closeBtns.forEach(btn => {
        btn.onclick = () => {
            hireModal.style.display = 'none';
        };
    });

    hireModal.onclick = (e) => {
        if (e.target === hireModal) hireModal.style.display = 'none';
    };
}

// ---------------------------------------------------------
// BUG INVADERS GAME ENGINE
// ---------------------------------------------------------
function initBugInvaders() {
    const modal = document.getElementById('game-modal');
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('start-game-btn');
    const scoreEl = document.getElementById('game-score');

    let gameActive = false;
    let score = 0;
    let highScore = localStorage.getItem('bugInvadersHiScore') || 0;
    
    // Game Config
    canvas.width = 600;
    canvas.height = 400;
    const bugRows = 4;
    const bugCols = 8;
    const bugWidth = 40;
    const bugHeight = 20;

    let player = { x: canvas.width / 2 - 15, y: canvas.height - 30, w: 30, h: 20, speed: 5 };
    let bullets = [];
    let bugs = [];
    let bugDirection = 1;
    let bugSpeed = 1;
    let keys = {};

    function initBugs() {
        bugs = [];
        const bugTypes = ['NullPointer', '404', 'Leak', 'StackFlow'];
        for (let r = 0; r < bugRows; r++) {
            for (let c = 0; c < bugCols; c++) {
                bugs.push({
                    x: c * (bugWidth + 15) + 50,
                    y: r * (bugHeight + 15) + 50,
                    w: bugWidth,
                    h: bugHeight,
                    type: bugTypes[r % bugTypes.length],
                    alive: true
                });
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw Player (>_)
        ctx.fillStyle = '#00f7ff';
        ctx.font = 'bold 16px Fira Code';
        ctx.fillText('>_', player.x, player.y + player.h);

        // Draw Bullets (|)
        ctx.fillStyle = '#fff';
        bullets.forEach((b, i) => {
            ctx.fillRect(b.x, b.y, 2, 8);
            b.y -= 7;
            if (b.y < 0) bullets.splice(i, 1);
        });

        // Draw Bugs
        let reachedEdge = false;
        bugs.forEach(bug => {
            if (!bug.alive) return;
            
            ctx.fillStyle = '#ff0055';
            ctx.font = '10px Fira Code';
            ctx.fillText(bug.type, bug.x, bug.y + 12);
            
            bug.x += bugDirection * bugSpeed;
            if (bug.x + bug.w > canvas.width || bug.x < 0) reachedEdge = true;

            // Collision with Bullets
            bullets.forEach((bullet, bi) => {
                if (bullet.x > bug.x && bullet.x < bug.x + bug.w &&
                    bullet.y > bug.y && bullet.y < bug.y + bug.h) {
                    bug.alive = false;
                    bullets.splice(bi, 1);
                    score += 100;
                }
            });

            // Collision with Player or Bottom
            if (bug.y + bug.h > player.y) {
                gameOver();
            }
        });

        if (reachedEdge) {
            bugDirection *= -1;
            bugs.forEach(b => b.y += 10);
        }

        // Clean dead bugs
        if (bugs.every(b => !b.alive)) {
            bugSpeed += 0.5;
            initBugs();
        }

        scoreEl.innerText = `Score: ${score} | High: ${highScore}`;

        if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
        if (keys['ArrowRight'] && player.x + player.w < canvas.width) player.x += player.speed;

        if (gameActive) requestAnimationFrame(draw);
    }

    function gameOver() {
        gameActive = false;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('bugInvadersHiScore', highScore);
        }
        alert(`PRODUCTION CRASHED! Final Score: ${score}`);
        resetGame();
    }

    function resetGame() {
        score = 0;
        bugSpeed = 1;
        player.x = canvas.width / 2 - 15;
        bullets = [];
        initBugs();
        document.getElementById('game-start-overlay').style.display = 'block';
    }

    startBtn.onclick = () => {
        document.getElementById('game-start-overlay').style.display = 'none';
        score = 0;
        gameActive = true;
        initBugs();
        draw();
    };

    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        if (modal.style.display === 'flex' && e.key === ' ') {
            e.preventDefault();
            bullets.push({ x: player.x + player.w / 2, y: player.y });
        }
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            gameActive = false;
            modal.style.display = 'none';
        }
    });

    window.addEventListener('keyup', (e) => keys[e.key] = false);

    // Close on click outside
    modal.onclick = (e) => {
        if (e.target === modal) {
            gameActive = false;
            modal.style.display = 'none';
        }
    };
}

function renderProjects(projects) {
    const projGrid = document.getElementById('projects-grid');
    if (!projGrid) return;
    projGrid.innerHTML = '';

    if (!projects || projects.length === 0) {
        projGrid.innerHTML = '<p class="tech-text" style="grid-column: 1/-1; text-align: center;">No projects found.</p>';
        return;
    }

    const ensureAbsolute = (url) => {
        if (!url || url === '#') return '#';
        if (typeof url !== 'string') return '#';
        const str = url.trim();
        if (str.startsWith('http') || str.startsWith('mailto:') || str.startsWith('tel:')) return str;
        if (str.startsWith('www.')) return `https://${str}`;
        if (str.includes('.') || str.includes('/')) return `https://${str}`;
        return str;
    };

    projects.forEach((proj, idx) => {
        const item = document.createElement('div');
        item.className = 'repo-card fade-in';
        item.style.animationDelay = `${0.3 + idx * 0.15}s`;

        let tagsHtml = proj.tags ? proj.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : '';

        item.innerHTML = `
            <div>
                <div class="repo-header">
                    <h3 class="repo-title">
                        <i class="fa-solid fa-code-branch" style="color: var(--accent-primary)"></i>
                        <a href="${ensureAbsolute(proj.link)}" target="_blank">${proj.title}</a>
                    </h3>
                </div>
                <p class="repo-desc">${proj.description}</p>
            </div>
            <div class="repo-footer">
                <button class="primary-btn sm-btn launch-app-btn" data-project="${proj.title}">
                    <i class="fa-solid fa-mobile-screen-button"></i> View App
                </button>
                ${tagsHtml}
            </div>
        `;

        item.querySelector('.launch-app-btn').onclick = () => {
            if (window.innerWidth > 1100) {
                launchPhoneApp(proj.title);
            } else {
                alert("Launch the desktop version to experience the Phone Emulator!");
            }
        };

        projGrid.appendChild(item);
    });
}
// ---------------------------------------------------------
// PHONE SIMULATOR LOGIC
// ---------------------------------------------------------
let allProjectsData = [];

function initPhoneSimulator(data) {
    allProjectsData = data.projects;
    renderPhoneHome();

    const homeBtn = document.getElementById('phone-home-btn');
    if (homeBtn) {
        homeBtn.onclick = renderPhoneHome;
    }
}

function renderPhoneHome() {
    const viewport = document.getElementById('simulator-viewport');
    if (!viewport) return;

    viewport.innerHTML = `
        <div class="app-header">
            <div class="app-title">Home</div>
        </div>
        <div class="app-home-grid">
            ${allProjectsData.map(proj => `
                <div class="app-link" onclick="launchPhoneApp('${proj.title}')">
                    <div class="app-link-icon">
                        <i class="fa-solid ${getProjectIcon(proj.title)}"></i>
                    </div>
                    <div class="app-link-text">${proj.title}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function launchPhoneApp(projectName) {
    const project = allProjectsData.find(p => p.title === projectName);
    if (!project) return;

    const viewport = document.getElementById('simulator-viewport');
    viewport.innerHTML = `
        <div class="app-header">
            <div class="app-title">${project.title}</div>
        </div>
        <div class="app-content">
            ${getAppTemplate(project)}
        </div>
    `;
    
    // Auto-scroll to sidebar on desktop if not in view
    if (window.innerWidth > 1100) {
        document.getElementById('phone-emulator').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function getProjectIcon(name) {
    const icons = {
        'OneChat': 'fa-comments',
        'ME': 'fa-user-astronaut',
        'shopEase': 'fa-cart-shopping',
        'TrackMyLocation': 'fa-location-crosshairs',
        'AimSense': 'fa-crosshairs',
        'AmbitDev Workspace': 'fa-code'
    };
    return icons[name] || 'fa-rocket';
}

function getAppTemplate(proj) {
    const type = proj.title.toLowerCase();
    
    if (type.includes('aimsense')) {
        return `
            <div class="dashboard-loading">
                <p class="app-title" style="font-size: 0.8rem; margin-bottom: 15px; color: #22c55e;">TRAINING_ARENA.EXE</p>
                <div class="list-item" style="border-left-color: #22c55e;">
                    <span class="list-item-title">Last Reaction</span>
                    <span class="list-item-status">184ms</span>
                </div>
                <div class="list-item" style="border-left-color: #22c55e;">
                    <span class="list-item-title">Accuracy</span>
                    <span class="list-item-status">98.2%</span>
                </div>
                <div style="margin-top: 20px; height: 60px; background: rgba(34, 197, 94, 0.1); border: 1px dashed #22c55e; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.6rem; color: #22c55e;">
                    [ PERFORMANCE GRAPH PLACEHOLDER ]
                </div>
                <button class="primary-btn" style="width: 100%; border-color: #22c55e; color: #22c55e; font-size: 0.65rem; padding: 10px; margin-top: 15px; background: rgba(34,197,94,0.05)">
                    START TRAINING
                </button>
            </div>
        `;
    }
    if (type.includes('chat')) {
        return `
            <div class="chat-container">
                <div class="chat-bubble chat-received">Hey! How does ${proj.title} work?</div>
                <div class="chat-bubble chat-sent">It's built with Flutter and uses a robust socket architecture for real-time messaging.</div>
                <div class="chat-bubble chat-received">Nice! What's the main tech stack?</div>
                <div class="chat-bubble chat-sent">${proj.tags.join(', ')}</div>
                <div class="chat-bubble chat-received">Awesome. Checking it out now!</div>
            </div>
        `;
    }

    if (type.includes('shop') || type.includes('me')) {
        return `
            <div class="list-container">
                <div class="list-item">
                    <span class="list-item-title">Production Build</span>
                    <span class="list-item-status">STABLE</span>
                </div>
                <div class="list-item">
                    <span class="list-item-title">UI/UX Layout</span>
                    <span class="list-item-status">GLASSMORPHIC</span>
                </div>
                <div class="list-item">
                    <span class="list-item-title">Performance</span>
                    <span class="list-item-status">60 FPS</span>
                </div>
                <p class="tech-text" style="font-size: 0.6rem; margin-top: 10px; opacity: 0.7;">
                    ${proj.description}
                </p>
                <button class="primary-btn" style="width: 100%; font-size: 0.6rem; padding: 8px; margin-top: 15px;">
                    INITIALIZE VIEW
                </button>
            </div>
        `;
    }

    return `
        <div class="dashboard-loading">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem; color: var(--accent-primary); display: block; text-align: center; margin: 30px 0;"></i>
            <p class="tech-text" style="text-align: center; font-size: 0.7rem;">Connecting to ${proj.title} secure cloud...</p>
            <div class="list-item" style="margin-top: 20px;">
                <span class="list-item-title">Status</span>
                <span class="list-item-status">ENCRYPTED</span>
            </div>
        </div>
    `;
}
