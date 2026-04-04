/* ============================================
   INJECT CSS STYLES
   ============================================ */
function injectOnboardingStyles() {
    const styleId = 'onboarding-inline-styles';
    if (document.getElementById(styleId)) return; // Уже добавлены
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        #onboarding-overlay {
            display: none;
            position: fixed !important;
            inset: 0 !important;
            z-index: 999999 !important;
            background: rgba(20, 20, 25, 0.95) !important;
            backdrop-filter: blur(12px) !important;
            -webkit-backdrop-filter: blur(12px) !important;
            opacity: 0;
            transition: opacity 0.3s ease !important;
            align-items: center !important;
            justify-content: center !important;
            pointer-events: none !important;
        }
        #onboarding-overlay.visible {
            opacity: 1 !important;
            pointer-events: auto !important;
        }
        .onboarding-content {
            background: #ffffff !important;
            border: 1px solid #e5e5ea !important;
            border-radius: 24px !important;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3) !important;
            width: 90% !important;
            max-width: 460px !important;
            padding: 40px 30px !important;
            text-align: center !important;
            position: relative !important;
        }
        .onboarding-slide { display: none; flex-direction: column; align-items: center; animation: fadeUp 0.4s ease; }
        .onboarding-slide.active { display: flex !important; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .onboarding-icon { font-size: 56px; margin-bottom: 20px; }
        .onboarding-title { font-size: 24px; font-weight: 700; color: #1d1d1f; margin: 0 0 12px; }
        .onboarding-text { font-size: 16px; color: #6e6e73; line-height: 1.5; margin: 0 0 32px; }
        .onboarding-dots { display: flex; justify-content: center; gap: 8px; margin-bottom: 32px; }
        .onboarding-dot { width: 8px; height: 8px; border-radius: 50%; background: #d2d2d7; transition: 0.2s; cursor: pointer; }
        .onboarding-dot.active { background: #0071e3; transform: scale(1.3); }
        .onboarding-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
        .btn-onboarding { padding: 10px 20px; border-radius: 12px; font-size: 15px; font-weight: 600; border: none; cursor: pointer; transition: 0.2s; }
        .btn-skip { background: transparent; color: #8e8e93; }
        .btn-skip:hover { color: #1d1d1f; }
        .btn-next, .btn-start { background: #0071e3; color: white; }
        .btn-next:hover, .btn-start:hover { background: #0077ed; }
        .btn-start { display: none; background: #34c759; }
        .btn-start:hover { background: #2db34f; }
    `;
    document.head.appendChild(style);
    console.log('🎨 Onboarding styles injected');
}

// Вызови эту функцию сразу при загрузке модуля
injectOnboardingStyles();




/* ============================================
   ONBOARDING MODULE
   ============================================ */

export const onboarding = {
    currentSlide: 0,
    totalSlides: 3,
    slides: [],
    isFinished: false,

    init() {

        const hasSeenOnboarding = localStorage.getItem('cultiva-onboarded');
        if (hasSeenOnboarding) return;

        this.slides = document.querySelectorAll('.onboarding-slide');
        this.updateUI();
        this.addEvents();
        
        const overlay = document.getElementById('onboarding-overlay');
        if (overlay) overlay.style.display = 'flex';
        setTimeout(() => overlay.classList.add('visible'), 50);
    },

    updateUI() {
        const overlay = document.getElementById('onboarding-overlay');
        if (!overlay) return;

        this.slides.forEach((slide, index) => {
            if (index === this.currentSlide) {
                slide.style.display = 'flex';
                slide.classList.add('active');
            } else {
                slide.style.display = 'none';
                slide.classList.remove('active');
            }
        });

        const dots = document.querySelectorAll('.onboarding-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });

        const btnNext = document.getElementById('onboarding-next');
        const btnStart = document.getElementById('onboarding-start');
        
        if (this.currentSlide === this.totalSlides - 1) {
            if (btnNext) btnNext.style.display = 'none';
            if (btnStart) btnStart.style.display = 'inline-flex';
        } else {
            if (btnNext) btnNext.style.display = 'inline-flex';
            if (btnStart) btnStart.style.display = 'none';
        }
    },

    next() {
        if (this.currentSlide < this.totalSlides - 1) {
            this.currentSlide++;
            this.updateUI();
        }
    },

    prev() {
        if (this.currentSlide > 0) {
            this.currentSlide--;
            this.updateUI();
        }
    },

    skip() {
        this.finish();
    },

    finish() {
        localStorage.setItem('cultiva-onboarded', 'true');
        const overlay = document.getElementById('onboarding-overlay');
        if (overlay) {
            overlay.classList.remove('visible');
            setTimeout(() => {
                overlay.style.display = 'none';
                this.isFinished = true;
            }, 400); 
        }
    },

    addEvents() {
        document.getElementById('onboarding-next')?.addEventListener('click', () => this.next());
        document.getElementById('onboarding-prev')?.addEventListener('click', () => this.prev());
        document.getElementById('onboarding-start')?.addEventListener('click', () => this.finish());
        document.getElementById('onboarding-skip')?.addEventListener('click', () => this.skip());

        document.addEventListener('keydown', (e) => {
            if (document.getElementById('onboarding-overlay').style.display === 'flex') {
                if (e.key === 'ArrowRight') this.next();
                if (e.key === 'ArrowLeft') this.prev();
                if (e.key === 'Escape') this.skip();
            }
        });
    }
};