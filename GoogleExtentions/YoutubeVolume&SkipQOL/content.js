// GLOBALS
let currentVideo = null;
let volumeSlider = null;
let isFullscreen = false;

/* ============================
   VOLUME BAR SAVING
============================ */
function getSavedVolume() {
    const saved = parseFloat(localStorage.getItem('customVolume'));
    return isNaN(saved) ? 0.5 : saved;
}

function applySavedVolume(video) {
    const saved = getSavedVolume();
    if (video.volume !== saved) {
        video.volume = saved;
    }
    if (volumeSlider) volumeSlider.value = saved;
}

/* ============================
   BASE STYLE
============================ */
function baseContainerStyle(container) {
    Object.assign(container.style, {
        position: 'fixed',
        left: '20px',
        zIndex: '9999',
        padding: '6px',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: '8px',
        backdropFilter: 'blur(5px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        opacity: '0.6',
        transform: 'scale(0.95)',
        transition: 'width 0.6s ease, transform 0.6s ease, opacity 0.6s ease',
        width: '40px'
    });
}

/* ============================
   VOLUME BOX
============================ */
function createVolumeBox(video) {
    if (document.getElementById('custom-volume-box')) return;

    const box = document.createElement('div');
    box.id = 'custom-volume-box';
    box.style.top = '48px';

    baseContainerStyle(box);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '1';
    slider.step = '0.0005';
    slider.value = getSavedVolume();

    volumeSlider = slider;
    applySavedVolume(video);

    Object.assign(slider.style, {
        width: '1000px',
        height: '36px',
        opacity: '0',
        transition: 'opacity 0.8s ease'
    });

    box.addEventListener('mouseenter', () => {
        box.style.width = '1000px';
        box.style.transform = 'scale(1)';
        slider.style.opacity = '1';
    });

    box.addEventListener('mouseleave', () => {
        box.style.width = '40px';
        box.style.transform = 'scale(0.95)';
        slider.style.opacity = '0';
    });

    slider.addEventListener('input', () => {
        const vol = parseFloat(slider.value);
        localStorage.setItem('customVolume', vol);
        if (currentVideo) currentVideo.volume = vol;
    });

    box.appendChild(slider);
    document.body.appendChild(box);
}

/* ============================
   SKIP BOX
============================ */
function createSkipBox() {
    if (document.getElementById('custom-skip-box')) return;

    const box = document.createElement('div');
    box.id = 'custom-skip-box';
    box.style.top = '108px';

    baseContainerStyle(box);

    const buttons = document.createElement('div');
    Object.assign(buttons.style, {
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        opacity: '0',
        transition: 'opacity 0.8s ease'
    });

    const prevBtn = document.createElement('button');
    const nextBtn = document.createElement('button');

    prevBtn.textContent = '<';
    nextBtn.textContent = '>';

    [prevBtn, nextBtn].forEach(btn => {
        Object.assign(btn.style, {
            background: 'rgba(255,255,255,0.15)',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            padding: '8px 14px',
            borderRadius: '6px',
            cursor: 'pointer',
            backdropFilter: 'blur(5px)'
        });

        btn.onmouseenter = () => btn.style.background = 'rgba(255,255,255,0.3)';
        btn.onmouseleave = () => btn.style.background = 'rgba(255,255,255,0.15)';
    });

    prevBtn.onclick = () => document.querySelector('.ytp-prev-button')?.click();
    nextBtn.onclick = () => document.querySelector('.ytp-next-button')?.click();

    box.addEventListener('mouseenter', () => {
        box.style.width = '90px';
        box.style.transform = 'scale(1)';
        buttons.style.opacity = '1';
    });

    box.addEventListener('mouseleave', () => {
        box.style.width = '40px';
        box.style.transform = 'scale(0.95)';
        buttons.style.opacity = '0';
    });

    buttons.appendChild(prevBtn);
    buttons.appendChild(nextBtn);
    box.appendChild(buttons);
    document.body.appendChild(box);
}



/* ============================
   VIDEO SYNC
============================ */
function setupVideoSync(video) {
    currentVideo = video;
    createVolumeBox(video);
    createSkipBox();
    applySavedVolume(video);

    video.addEventListener('loadeddata', () => {
        applySavedVolume(video);
    });

    setInterval(() => {
        if (!currentVideo) return;
        const saved = getSavedVolume();
        if (Math.abs(currentVideo.volume - saved) > 0.001) {
            applySavedVolume(currentVideo);
        }
    }, 1000);
}

/* ============================
   SPA OBSERVER
============================ */
function observeVideoChanges() {
    let lastVideo = null;

    new MutationObserver(() => {
        const video = document.querySelector('video');
        if (video && video !== lastVideo) {
            lastVideo = video;
            setupVideoSync(video);
        }
    }).observe(document.body, { childList: true, subtree: true });
}

/* ============================
   FULLSCREEN STATE
============================ */
document.addEventListener('fullscreenchange', () => {
    isFullscreen = !!document.fullscreenElement;
});


/* ============================
   INIT
============================ */
(function () {
    const init = setInterval(() => {
        const video = document.querySelector('video');
        if (video) {
            clearInterval(init);
            setupVideoSync(video);
            observeVideoChanges();
        }
    }, 300);
})();
