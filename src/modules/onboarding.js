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