// script.js

// ============================================================
// DOM Elements
// ============================================================
const noBtn = document.getElementById('btn-nao');
const btnSim = document.getElementById('btn-sim');
const successOverlay = document.getElementById('success-overlay');
const heartBg = document.getElementById('heart-bg');

// --- Slide / Navigation ---
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const navButtons = document.querySelector('.nav-buttons');

const TOTAL_PAGES = slides.length; // 4
let currentPage = 0;

function goToPage(index) {
    // Clamp index
    if (index < 0 || index >= TOTAL_PAGES) return;

    // Remove active from current slide & dot
    slides[currentPage].classList.remove('active');
    dots[currentPage].classList.remove('active');

    currentPage = index;

    // Activate new slide & dot
    slides[currentPage].classList.add('active');
    dots[currentPage].classList.add('active');

    // Update prev button
    btnPrev.disabled = currentPage === 0;

    // On last slide: hide nav (Sim/Não buttons take over)
    if (currentPage === TOTAL_PAGES - 1) {
        navButtons.classList.add('hide-nav');
    } else {
        navButtons.classList.remove('hide-nav');
        btnNext.disabled = false;
    }
}

// Prev / Next click handlers
btnPrev.addEventListener('click', () => goToPage(currentPage - 1));
btnNext.addEventListener('click', () => goToPage(currentPage + 1));

// Dot click handlers
dots.forEach(dot => {
    dot.addEventListener('click', () => {
        const target = parseInt(dot.dataset.page, 10);
        goToPage(target);
    });
});

// 1. Dynamic Background Hearts Generation
function createBackgroundHeart() {
    if (!heartBg) return;

    const heart = document.createElement('div');
    heart.classList.add('floating-heart');

    // Random horizontal position
    heart.style.left = `${Math.random() * 100}vw`;

    // Random scale (0.3 to 1.1)
    const scale = Math.random() * 0.8 + 0.3;
    heart.style.transform = `rotate(-45deg) scale(${scale})`;

    // Random animation duration (6 to 12s)
    const duration = Math.random() * 6 + 6;
    heart.style.animationDuration = `${duration}s`;

    // Random opacity (0.4 to 0.9)
    heart.style.opacity = Math.random() * 0.5 + 0.4;

    heartBg.appendChild(heart);

    // Clean up when animation finishes
    setTimeout(() => {
        heart.remove();
    }, duration * 1000);
}

// Generate initial batch of hearts
for (let i = 0; i < 15; i++) {
    // Stagger initial creation so they don't all start at the exact same bottom position
    setTimeout(createBackgroundHeart, Math.random() * 6000);
}

// Continuously generate background hearts
setInterval(createBackgroundHeart, 500);

// 2. Heart Cursor Trail Effect
document.addEventListener('mousemove', (e) => {
    // Throttle the trail to avoid performance lag (approx. 25% of moves)
    if (Math.random() > 0.25) return;

    createTrailHeart(e.clientX, e.clientY);
});

function createTrailHeart(x, y) {
    const heart = document.createElement('div');
    heart.classList.add('trail-heart');

    // Randomly pick a heart style
    const symbols = ['❤️', '💖', '💕', '💘'];
    heart.innerHTML = symbols[Math.floor(Math.random() * symbols.length)];

    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;

    // Randomize size slightly
    const size = Math.random() * 15 + 12;
    heart.style.fontSize = `${size}px`;

    document.body.appendChild(heart);

    // Auto-remove after animation completes
    setTimeout(() => {
        heart.remove();
    }, 1000);
}

// 3. Smart Runaway Logic for the "Não" Button
let isMoved = false;

function moveButton(mouseX = -999, mouseY = -999) {
    const padding = 40; // keep away from screen edges
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // First time dodging: detach from card and attach directly to body to avoid overflow clipping from card container transforms
    if (!isMoved) {
        const rect = noBtn.getBoundingClientRect();

        // Append directly to body
        document.body.appendChild(noBtn);

        // Maintain exact coordinates at moment of detach
        noBtn.style.position = 'fixed';
        noBtn.style.left = `${rect.left}px`;
        noBtn.style.top = `${rect.top}px`;
        noBtn.style.margin = '0'; // clear container margins

        isMoved = true;
    }

    const btnRect = noBtn.getBoundingClientRect();
    const btnW = btnRect.width;
    const btnH = btnRect.height;

    // Calculate max boundaries
    const maxX = vw - btnW - padding;
    const maxY = vh - btnH - padding;

    let newX, newY;
    let attempts = 0;

    // Keep generating random coordinates until they are far enough from current mouse position
    do {
        newX = Math.max(padding, Math.min(Math.random() * maxX, maxX));
        newY = Math.max(padding, Math.min(Math.random() * maxY, maxY));
        attempts++;
    } while (
        mouseX !== -999 && mouseY !== -999 &&
        Math.hypot(newX + btnW / 2 - mouseX, newY + btnH / 2 - mouseY) < 180 &&
        attempts < 30
    );

    // Position the button on viewport
    noBtn.style.left = `${newX}px`;
    noBtn.style.top = `${newY}px`;

    // Add dynamic slight rotations for visual juice!
    const rotate = (Math.random() - 0.5) * 20; // -10deg to 10deg
    noBtn.style.transform = `rotate(${rotate}deg) scale(0.95)`;

    // Revert scale back slightly after movement
    setTimeout(() => {
        noBtn.style.transform = `rotate(${rotate}deg) scale(1)`;
    }, 150);
}

// Track mouse position and check proximity to "Não" button (Force-field effect)
document.addEventListener('mousemove', (e) => {
    const btnRect = noBtn.getBoundingClientRect();
    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;

    const distance = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);

    // If cursor enters 110px range, make the button dodge
    if (distance < 110) {
        moveButton(e.clientX, e.clientY);
    }
});

// Immediate event listeners for mobile, keyboard, and hovering directly
noBtn.addEventListener('mouseover', (e) => moveButton(e.clientX, e.clientY));
noBtn.addEventListener('touchstart', (e) => {
    e.preventDefault(); // prevents click emulation trigger
    const touch = e.touches[0];
    moveButton(touch.clientX, touch.clientY);
});
noBtn.addEventListener('focus', () => moveButton());
noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    moveButton();
});

// 4. Success Overlay and Redirection
btnSim.addEventListener('click', () => {
    // Show the romantic success banner overlay
    successOverlay.classList.add('active');

    // Trigger intense romantic heart explosion
    for (let i = 0; i < 50; i++) {
        setTimeout(createExplosionHeart, i * 40);
    }

    // Redirect to YouTube after 3 seconds of beautiful animation
    setTimeout(() => {
        // Redirection URL (Ed Sheeran - Perfect)
        window.location.href = 'https://youtu.be/8ScAnaU0FFE';
    }, 3000);
});

function createExplosionHeart() {
    const heart = document.createElement('div');
    heart.classList.add('trail-heart');

    const symbols = ['❤️', '💖', '💝', '💕', '💘', '🌸', '✨'];
    heart.innerHTML = symbols[Math.floor(Math.random() * symbols.length)];

    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;

    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;

    // Angle and velocity calculations
    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 250 + 100;

    // Disable default animation, configure manual translation
    heart.style.animation = 'none';
    heart.style.transition = 'all 1.6s cubic-bezier(0.1, 0.8, 0.3, 1)';

    document.body.appendChild(heart);

    // Trigger browser layout pass (reflow) to register starting styles
    heart.offsetHeight;

    // Translate outwards dynamically
    const targetX = x + Math.cos(angle) * velocity;
    const targetY = y + Math.sin(angle) * velocity;
    const rotation = (Math.random() - 0.5) * 720; // wide rotation range

    heart.style.transform = `translate(${targetX - x}px, ${targetY - y}px) scale(0) rotate(${rotation}deg)`;
    heart.style.opacity = '0';

    // Cleanup
    setTimeout(() => {
        heart.remove();
    }, 1600);
}
