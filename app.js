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
    
    for(let i = 0; i < numParticles; i++) {
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
        
        if(p.x < 0) p.x = width;
        if(p.x > width) p.x = 0;
        if(p.y < 0) p.y = height;
        if(p.y > height) p.y = 0;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.strokeStyle = 'rgba(0, 247, 255, 0.04)';
    for(let i = 0; i < particles.length; i++) {
        for(let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if(dist < 150) {
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
    
    document.getElementById('user-linkedin').href = data.socialLinks.linkedin;
    
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
}

function typeWriter(element, text, index) {
    if (index < text.length) {
        element.textContent += text.charAt(index);
        setTimeout(() => typeWriter(element, text, index + 1), 60);
    } else {
        setTimeout(() => { element.style.borderRight = 'none'; }, 2000);
    }
}

function renderProjects(projects) {
    const projGrid = document.getElementById('projects-grid');
    projGrid.innerHTML = '';
    
    if (!projects || projects.length === 0) {
        projGrid.innerHTML = '<p class="tech-text" style="grid-column: 1/-1; text-align: center;">No projects found.</p>';
        return;
    }

    projects.forEach((proj, idx) => {
        const item = document.createElement('div');
        item.className = 'repo-card fade-in';
        item.style.animationDelay = `${0.3 + idx * 0.15}s`;
        
        let tagsHtml = proj.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

        item.innerHTML = `
            <div>
                <div class="repo-header">
                    <h3 class="repo-title">
                        <i class="fa-solid fa-code-branch" style="color: var(--accent-primary)"></i>
                        <a href="${proj.link}" target="_blank">${proj.title}</a>
                    </h3>
                </div>
                <p class="repo-desc">${proj.description}</p>
            </div>
            <div class="repo-footer">
                ${tagsHtml}
            </div>
        `;
        projGrid.appendChild(item);
    });
}

async function fetchGitHubData(username) {
    // Deprecated in favor of server-side fetch during sync
}
