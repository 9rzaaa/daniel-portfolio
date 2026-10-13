// Guarantee page starts cleanly at top (0, 0) on load or reload
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {
  window.scrollTo(0, 0);

  // ------------------------------------------------------------------------
  // 0. Intro Welcome Screen & Smooth Curtain Lift
  // ------------------------------------------------------------------------
  const introScreen = document.getElementById('intro-screen');
  if (introScreen) {
    let hasDismissed = false;

    const dismissIntro = () => {
      if (hasDismissed) return;
      hasDismissed = true;
      window.scrollTo(0, 0);
      document.body.classList.remove('intro-active');
      document.body.classList.add('intro-revealed');
      introScreen.classList.add('curtain-up');

      // Trigger the lanyard drop PRECISELY as the curtain clears the ceiling of the home page!
      setTimeout(() => {
        const lanyard = document.getElementById('lanyard-assembly');
        const idBadge = document.getElementById('hero-id-badge');
        if (lanyard) lanyard.classList.add('do-swing');
        if (idBadge) idBadge.classList.add('do-swing');
      }, 450);

      setTimeout(() => {
        introScreen.style.display = 'none';
      }, 1250);
    };

    // Auto-dismiss smoothly after 4.2s (or skip anytime on click / scroll)
    const introTimer = setTimeout(dismissIntro, 4200);

    introScreen.addEventListener('click', () => {
      clearTimeout(introTimer);
      dismissIntro();
    });

    // Also trigger curtain lift on user scroll/wheel
    window.addEventListener('wheel', () => {
      if (!hasDismissed) {
        clearTimeout(introTimer);
        dismissIntro();
      }
    }, { once: true, passive: true });

    window.addEventListener('touchmove', () => {
      if (!hasDismissed) {
        clearTimeout(introTimer);
        dismissIntro();
      }
    }, { once: true, passive: true });
  }

  // ------------------------------------------------------------------------
  // 1. Mobile Menu Toggle for Floating Pill
  // ------------------------------------------------------------------------
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const navLinks = document.querySelectorAll('.nav-link-item');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileMenu.classList.toggle('hidden');
    });

    // Close when clicking any nav link
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        mobileMenu.classList.add('hidden');
      }
    });
  }

  // ------------------------------------------------------------------------
  // 2. Active Section Highlighting on Floating Pill Nav
  // ------------------------------------------------------------------------
  const sections = document.querySelectorAll('section[id]');
  const desktopPillLinks = document.querySelectorAll('.desktop-pill-nav a');

  const observerOptions = {
    root: null,
    rootMargin: '-25% 0px -65% 0px',
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        desktopPillLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));

  // ------------------------------------------------------------------------
  // 3. Tactile 3D Tilt & Sway on Hanging Lanyard Assembly
  // ------------------------------------------------------------------------
  const lanyardAssembly = document.getElementById('lanyard-assembly');
  const idBadge = document.getElementById('hero-id-badge');
  const heroSection = document.getElementById('home');

  if (idBadge && heroSection && lanyardAssembly) {
    let isHovering = false;

    heroSection.addEventListener('mouseenter', () => {
      // Only take over once the lanyard has fully swung in
      if (!lanyardAssembly.classList.contains('do-swing')) return;
      isHovering = true;
      lanyardAssembly.classList.add('is-interactive');
    });

    heroSection.addEventListener('mousemove', (e) => {
      if (!isHovering) return;

      const rect = idBadge.getBoundingClientRect();
      const badgeCenterX = rect.left + rect.width / 2;
      const badgeCenterY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - badgeCenterX) / 22;
      const deltaY = (e.clientY - badgeCenterY) / 28;

      // Limit max tilt angles
      const clampedX = Math.max(Math.min(deltaX, 14), -14);
      const clampedY = Math.max(Math.min(deltaY, 10), -10);

      // 3D rotation on card + slight angle on assembly
      idBadge.style.transform = `rotateY(${clampedX}deg) rotateX(${-clampedY}deg) rotate(${clampedX * 0.25}deg)`;
      lanyardAssembly.style.transform = `rotate(${clampedX * 0.12}deg)`;
    });

    heroSection.addEventListener('mouseleave', () => {
      isHovering = false;
      // Clear inline transforms so the do-swing sway animation takes back over smoothly
      idBadge.style.transform = '';
      lanyardAssembly.style.transform = '';
      // Small delay lets the CSS transition ease out before resuming keyframe sway
      setTimeout(() => {
        lanyardAssembly.classList.remove('is-interactive');
      }, 260);
    });
  }

  // ------------------------------------------------------------------------
  // 4. Dynamic Year in Footer
  // ------------------------------------------------------------------------
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // ------------------------------------------------------------------------
  // 5. Contact Form Handler (Web3Forms Integration)
  // ------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-black inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg> Sending...
      `;

      try {
        const formData = new FormData(contactForm);
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.status === 200) {
          formStatus.className = 'mt-4 text-sm text-[#FFFFFF] bg-[#2B2B2B] p-3.5 rounded-lg border border-[#B3B3B3] block';
          formStatus.textContent = 'Message sent successfully! Thank you for reaching out.';
          contactForm.reset();
        } else {
          formStatus.className = 'mt-4 text-sm text-[#D4D4D4] bg-red-950/60 p-3.5 rounded-lg border border-red-800 block';
          formStatus.textContent = data.message || 'Something went wrong. Please try again.';
        }
      } catch (error) {
        formStatus.className = 'mt-4 text-sm text-[#D4D4D4] bg-red-950/60 p-3.5 rounded-lg border border-red-800 block';
        formStatus.textContent = 'Unable to send message right now. Please email directly.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    });
  }
});
