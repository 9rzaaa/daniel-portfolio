// Check if user is reloading the page
let isPageReload = false;
try {
  const perf = window.performance;
  if (perf) {
    const navEntries = perf.getEntriesByType && perf.getEntriesByType('navigation');
    if (navEntries && navEntries.length > 0) {
      isPageReload = navEntries[0].type === 'reload';
    } else if (perf.navigation) {
      isPageReload = perf.navigation.type === 1;
    }
  }
} catch (e) {}

// If page reload, always strip any section hash and start at the top of index.html
if (isPageReload) {
  if (window.location.hash && history.replaceState) {
    history.replaceState(null, null, window.location.pathname);
  }
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);
} else {
  // Check if user is navigating with a direct section hash (e.g. from case study)
  const initialHashOnStart = window.location.hash;
  const hasDirectSectionHash = initialHashOnStart && initialHashOnStart !== '#home' && document.querySelector(initialHashOnStart);

  if (!hasDirectSectionHash) {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('section[id]');
  const desktopPillLinks = document.querySelectorAll('.desktop-pill-nav a');
  const allNavAnchors = document.querySelectorAll('a[href^="#"]');

  const currentHash = window.location.hash;
  // If page reload, do NOT navigate to section hash — reload at the top of index.html!
  const targetOnLoad = (!isPageReload && currentHash && currentHash !== '#home') ? document.querySelector(currentHash) : null;

  if (targetOnLoad) {
    // If arriving with a section hash (e.g. #projects from DormEase page), skip intro and scroll to exact gap
    document.body.classList.remove('intro-active');
    document.body.classList.add('intro-revealed');
    const introEl = document.getElementById('intro-screen');
    if (introEl) introEl.style.display = 'none';

    const alignToSection = () => {
      const innerHeader = targetOnLoad.querySelector('.max-w-7xl') || targetOnLoad;
      const targetGap = window.innerWidth < 640 ? 78 : 83;
      const targetY = window.pageYOffset + innerHeader.getBoundingClientRect().top - targetGap;

      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: 'instant'
      });
      triggerSectionAnimation(targetOnLoad);
    };

    alignToSection();
    setTimeout(alignToSection, 50);
    setTimeout(alignToSection, 180);

    // Sync pill active state
    desktopPillLinks.forEach((pill) => {
      if (pill.getAttribute('href') === currentHash) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    // Clean up URL hash so any subsequent reload reloads cleanly at the top of index.html!
    setTimeout(() => {
      if (window.location.hash && history.replaceState) {
        history.replaceState(null, null, window.location.pathname);
      }
    }, 350);
  } else {
    window.scrollTo(0, 0);
  }

  // ------------------------------------------------------------------------
  // Helper: Trigger re-entrance animation on any section
  // ------------------------------------------------------------------------
  function triggerSectionAnimation(section) {
    if (!section) return;
    section.classList.remove('is-visible');
    void section.offsetHeight; // force reflow
    section.classList.add('is-visible');

    // Force re-trigger of all individual reveal items within this section
    const revealItems = section.querySelectorAll('.reveal-item, .about-reveal-item, .reveal-circle, .about-reveal-circle');
    revealItems.forEach((el) => {
      el.classList.remove('is-revealed');
    });
    void section.offsetHeight; // force reflow for children
    revealItems.forEach((el) => {
      el.classList.add('is-revealed');
    });

    if (section.id === 'home') {
      const lanyard = document.getElementById('lanyard-assembly');
      const idBadge = document.getElementById('hero-id-badge');
      if (lanyard && idBadge) {
        lanyard.classList.remove('do-swing');
        idBadge.classList.remove('do-swing');
        void lanyard.offsetHeight;
        lanyard.classList.add('do-swing');
        idBadge.classList.add('do-swing');
      }
    }
  }

  // ------------------------------------------------------------------------
  // 0. Intro Welcome Screen & Smooth Curtain Lift (First Visit Only)
  // ------------------------------------------------------------------------
  const introScreen = document.getElementById('intro-screen');
  const isSkipIntro = document.documentElement.classList.contains('skip-intro');

  if (isSkipIntro) {
    if (introScreen) introScreen.style.display = 'none';
    document.body.classList.remove('intro-active');
    document.body.classList.add('intro-revealed');

    // Smoothly trigger hero animation on reload (only if not arriving with a specific section hash)
    if (!targetOnLoad) {
      const homeSection = document.getElementById('home');
      if (homeSection) triggerSectionAnimation(homeSection);

      setTimeout(() => {
        const lanyard = document.getElementById('lanyard-assembly');
        const idBadge = document.getElementById('hero-id-badge');
        if (lanyard) lanyard.classList.add('do-swing');
        if (idBadge) idBadge.classList.add('do-swing');
      }, 180);
    }

    sessionStorage.setItem('visited_session', 'true');
  } else if (introScreen) {
    let hasDismissed = false;

    const dismissIntro = () => {
      if (hasDismissed) return;
      hasDismissed = true;
      sessionStorage.setItem('visited_session', 'true');
      window.scrollTo(0, 0);
      document.body.classList.remove('intro-active');
      document.body.classList.add('intro-revealed');
      introScreen.classList.add('curtain-up');

      // Trigger the home entrance animation PRECISELY as the curtain lifts!
      const homeSection = document.getElementById('home');
      if (homeSection) {
        triggerSectionAnimation(homeSection);
      }

      // Trigger the lanyard drop as the curtain clears the ceiling of the home page!
      setTimeout(() => {
        const lanyard = document.getElementById('lanyard-assembly');
        const idBadge = document.getElementById('hero-id-badge');
        if (lanyard) lanyard.classList.add('do-swing');
        if (idBadge) idBadge.classList.add('do-swing');
      }, 240);

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
  // 2. Active Section Highlighting & Smooth Navigation Transitions
  // ------------------------------------------------------------------------
  // Exact anchor scroll positioning to perfectly frame sections under the floating pill
  allNavAnchors.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#' || !href.startsWith('#')) return;

      const targetSection = document.querySelector(href);
      if (targetSection) {
        e.preventDefault();

        // Close mobile dropdown if open
        if (mobileMenu) mobileMenu.classList.add('hidden');

        // Exact clearance beneath floating header pill matching screenshot gap
        let targetPosition = 0;
        if (href !== '#home') {
          const innerHeader = targetSection.querySelector('.max-w-7xl') || targetSection;
          const targetGap = window.innerWidth < 640 ? 78 : 83;
          targetPosition = window.pageYOffset + innerHeader.getBoundingClientRect().top - targetGap;
        }

        // Re-trigger entrance animation immediately on click
        triggerSectionAnimation(targetSection);

        window.scrollTo({
          top: Math.max(0, targetPosition),
          behavior: 'smooth'
        });

        // Update URL hash cleanly without page jump
        if (history.pushState) {
          history.pushState(null, null, href);
        }

        // Active state sync on pill nav
        desktopPillLinks.forEach((pill) => {
          if (pill.getAttribute('href') === href) {
            pill.classList.add('active');
          } else {
            pill.classList.remove('active');
          }
        });
      }
    });
  });

  // Active section indicator in floating pill
  const pillObserverOptions = {
    root: null,
    rootMargin: '-82px 0px -50% 0px',
    threshold: 0,
  };

  const pillObserver = new IntersectionObserver((entries) => {
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
  }, pillObserverOptions);

  sections.forEach((section) => pillObserver.observe(section));

  // ------------------------------------------------------------------------
  // 2.5 Bi-Directional Scroll Reveal Observer for Elements & Sections
  // ------------------------------------------------------------------------
  const revealElements = document.querySelectorAll('.reveal-item, .about-reveal-item, .reveal-circle, .about-reveal-circle');

  const itemRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
      } else {
        // Reset when element completely leaves viewport so it re-animates smoothly on re-entry
        entry.target.classList.remove('is-revealed');
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px',
  });

  revealElements.forEach((el) => itemRevealObserver.observe(el));

  // Immediate check for elements already in the initial viewport
  const triggerInitialReveals = () => {
    revealElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 30 && rect.bottom > 30) {
        el.classList.add('is-revealed');
      }
    });
  };
  triggerInitialReveals();
  setTimeout(triggerInitialReveals, 120);

  // Section observer for #home lanyard swing and section visibility
  const sectionRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const section = entry.target;
      if (entry.isIntersecting) {
        // If intro welcome screen is still active, DO NOT trigger home animations yet!
        if (section.id === 'home' && document.body.classList.contains('intro-active')) {
          return;
        }

        // Entering viewport from top or bottom -> trigger entrance animations
        section.classList.add('is-visible');
        if (section.id === 'home') {
          const lanyard = document.getElementById('lanyard-assembly');
          const idBadge = document.getElementById('hero-id-badge');
          if (lanyard) lanyard.classList.add('do-swing');
          if (idBadge) idBadge.classList.add('do-swing');
        }
      } else {
        // If intro welcome screen is still active, don't interfere with home
        if (section.id === 'home' && document.body.classList.contains('intro-active')) {
          return;
        }

        // Exited viewport (scrolled past or scrolled above) -> reset so it re-animates next time!
        section.classList.remove('is-visible');
        if (section.id === 'home') {
          const lanyard = document.getElementById('lanyard-assembly');
          const idBadge = document.getElementById('hero-id-badge');
          if (lanyard) lanyard.classList.remove('do-swing');
          if (idBadge) idBadge.classList.remove('do-swing');
        }
      }
    });
  }, {
    root: null,
    threshold: 0.05,
    rootMargin: '0px 0px -40px 0px',
  });

  sections.forEach((section) => sectionRevealObserver.observe(section));

  // Page reload / direct load trigger for initial visible section (only if intro not active)
  const initialHash = window.location.hash;
  if (initialHash && document.querySelector(initialHash)) {
    triggerSectionAnimation(document.querySelector(initialHash));
  } else if (!document.body.classList.contains('intro-active')) {
    const homeSection = document.getElementById('home');
    if (homeSection) triggerSectionAnimation(homeSection);
  }

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
  // 5. Contact Form Handler (Web3Forms + Honeypot + Rich Banner & Toast)
  // ------------------------------------------------------------------------
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  // Helper: Show floating toast notification in bottom-right corner
  function showContactToast(type, title, message) {
    let toast = document.getElementById('contact-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'contact-toast';
      toast.className = 'fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100%-2.5rem)] sm:w-96 transform translate-y-6 opacity-0 pointer-events-none transition-all duration-300';
      document.body.appendChild(toast);
    }

    const isSuccess = type === 'success';
    const iconClass = isSuccess
      ? 'fa-solid fa-circle-check text-emerald-400'
      : 'fa-solid fa-triangle-exclamation text-amber-400';
    const borderClass = isSuccess ? 'border-emerald-500/40' : 'border-red-500/40';

    toast.innerHTML = `
      <div class="p-4 rounded-xl bg-[#121212]/95 backdrop-blur-md border ${borderClass} shadow-2xl flex items-start gap-3.5 text-left">
        <div class="w-8 h-8 rounded-lg bg-[#1E1E1E] border border-[#2B2B2B] flex items-center justify-center shrink-0 mt-0.5">
          <i class="${iconClass} text-sm"></i>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-bold uppercase tracking-wider text-white">${title}</p>
          <p class="text-xs text-[#B3B3B3] mt-1 leading-relaxed">${message}</p>
        </div>
        <button type="button" id="contact-toast-close" class="text-[#737373] hover:text-white transition-colors p-1">
          <i class="fa-solid fa-xmark text-xs"></i>
        </button>
      </div>
    `;

    // Trigger slide-in animation
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-6', 'opacity-0', 'pointer-events-none');
      toast.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
    });

    const hideToast = () => {
      toast.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
      toast.classList.add('translate-y-6', 'opacity-0', 'pointer-events-none');
    };

    const closeBtn = toast.querySelector('#contact-toast-close');
    if (closeBtn) closeBtn.addEventListener('click', hideToast);

    if (toast._hideTimeout) clearTimeout(toast._hideTimeout);
    toast._hideTimeout = setTimeout(hideToast, 6000);
  }

  // Helper: Render rich animated inline status banner inside the form
  function renderFormStatus(type, title, message) {
    if (!formStatus) return;
    const isSuccess = type === 'success';
    const borderClass = isSuccess
      ? 'border-emerald-500/40 bg-emerald-950/25'
      : 'border-red-500/40 bg-red-950/30';
    const iconClass = isSuccess
      ? 'fa-solid fa-circle-check text-emerald-400'
      : 'fa-solid fa-circle-exclamation text-red-400';

    formStatus.className = `mt-4 p-4 rounded-xl border ${borderClass} flex items-start gap-3 text-left transition-all duration-300`;
    formStatus.innerHTML = `
      <i class="${iconClass} text-base mt-0.5 shrink-0"></i>
      <div class="flex-1 text-xs">
        <p class="font-bold text-white uppercase tracking-wider">${title}</p>
        <p class="text-[#D4D4D4] mt-1 leading-relaxed">${message}</p>
      </div>
    `;
  }

  if (contactForm && formStatus) {
    const fields = {
      name: {
        el: document.getElementById('name'),
        err: document.getElementById('name-error'),
        validate: (val) => {
          if (!val) return 'Please enter your name.';
          if (val.length < 2) return 'Name must be at least 2 characters.';
          if (val.length > 80) return 'Name must be under 80 characters.';
          return '';
        },
      },
      email: {
        el: document.getElementById('email'),
        err: document.getElementById('email-error'),
        validate: (val) => {
          if (!val) return 'Please enter your email address.';
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
          if (!emailRegex.test(val)) return 'Please enter a valid email address (e.g., alex@company.com).';
          return '';
        },
      },
      subject: {
        el: document.getElementById('subject'),
        err: document.getElementById('subject-error'),
        validate: (val) => {
          if (!val) return 'Please enter a subject.';
          if (val.length < 3) return 'Subject must be at least 3 characters.';
          if (val.length > 120) return 'Subject must be under 120 characters.';
          return '';
        },
      },
      message: {
        el: document.getElementById('message'),
        err: document.getElementById('message-error'),
        validate: (val) => {
          if (!val) return 'Please enter your message.';
          if (val.length < 10) return 'Message must be at least 10 characters.';
          if (val.length > 2000) return 'Message must be under 2000 characters.';
          return '';
        },
      },
    };

    const messageCountEl = document.getElementById('message-count');

    function setFieldError(fieldObj, errorMsg) {
      if (!fieldObj || !fieldObj.el || !fieldObj.err) return;
      if (errorMsg) {
        fieldObj.el.classList.remove('border-[#2B2B2B]', 'focus:border-white');
        fieldObj.el.classList.add('border-red-500/80', 'focus:border-red-400');
        fieldObj.err.textContent = errorMsg;
        fieldObj.err.classList.remove('hidden');
      } else {
        fieldObj.el.classList.remove('border-red-500/80', 'focus:border-red-400');
        fieldObj.el.classList.add('border-[#2B2B2B]', 'focus:border-white');
        fieldObj.err.textContent = '';
        fieldObj.err.classList.add('hidden');
      }
    }

    function validateSingleField(key) {
      const fieldObj = fields[key];
      if (!fieldObj || !fieldObj.el) return true;
      const val = fieldObj.el.value.trim();
      const errorMsg = fieldObj.validate(val);
      setFieldError(fieldObj, errorMsg);
      return !errorMsg;
    }

    // Real-time clearing of errors on input + blur validation + live character counter
    Object.keys(fields).forEach((key) => {
      const fieldObj = fields[key];
      if (!fieldObj.el) return;

      fieldObj.el.addEventListener('input', () => {
        if (key === 'message' && messageCountEl) {
          const len = fieldObj.el.value.length;
          messageCountEl.textContent = `${len} / 2000`;
        }
        if (!fieldObj.err.classList.contains('hidden')) {
          validateSingleField(key);
        }
      });

      fieldObj.el.addEventListener('blur', () => {
        if (fieldObj.el.value.trim().length > 0) {
          validateSingleField(key);
        }
      });
    });

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Honeypot spam check
      const botcheck = contactForm.querySelector('input[name="botcheck"]');
      if (botcheck && botcheck.checked) {
        return;
      }

      // Validate all fields before submitting
      let isFormValid = true;
      let firstInvalidEl = null;
      Object.keys(fields).forEach((key) => {
        const valid = validateSingleField(key);
        if (!valid && isFormValid) {
          isFormValid = false;
          firstInvalidEl = fields[key].el;
        }
      });

      if (!isFormValid) {
        if (firstInvalidEl) firstInvalidEl.focus();
        renderFormStatus(
          'error',
          'Please Check Your Inputs',
          'Some fields require your attention before sending.'
        );
        showContactToast(
          'error',
          'Validation Error',
          'Please complete all highlighted fields accurately.'
        );
        return;
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnHtml = submitBtn.innerHTML;

      const formData = new FormData(contactForm);
      const accessKey = (formData.get('access_key') || '').toString().trim();
      const senderName = fields.name.el.value.trim();
      const senderEmail = fields.email.el.value.trim();
      const rawSubject = fields.subject.el.value.trim();
      const cleanMessage = fields.message.el.value.trim();

      // Ensure trimmed values & Reply-To go directly to the recruiter's email address
      formData.set('name', senderName);
      formData.set('email', senderEmail);
      formData.set('message', cleanMessage);
      formData.set('replyto', senderEmail);
      formData.set('subject', `[Portfolio Inquiry] ${rawSubject} — from ${senderName}`);

      // Guard if placeholder access key hasn't been replaced yet
      if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE') {
        renderFormStatus(
          'error',
          'Web3Forms Access Key Needed',
          'Paste your free Web3Forms Access Key into index.html (id="web3forms-access-key") to activate live delivery to lingdaniel999@gmail.com.'
        );
        showContactToast(
          'error',
          'Access Key Required',
          'Add your free Web3Forms key in index.html to enable email delivery.'
        );
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-black inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <span>Sending Message...</span>
      `;

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
          },
          body: formData,
        });

        const data = await response.json();

        if (response.status === 200 && data.success) {
          renderFormStatus(
            'success',
            'Message Sent Successfully',
            `Thank you, ${senderName}! Your message has been delivered to Daniel Ling (lingdaniel999@gmail.com).`
          );
          showContactToast(
            'success',
            'Message Delivered!',
            'Thank you for reaching out — Daniel will reply to your email shortly.'
          );
          contactForm.reset();
          if (messageCountEl) messageCountEl.textContent = '0 / 2000';
          Object.keys(fields).forEach((key) => setFieldError(fields[key], ''));
        } else {
          const errMsg = data.message || 'Something went wrong while sending your message. Please try again.';
          renderFormStatus('error', 'Delivery Failed', errMsg);
          showContactToast('error', 'Submission Error', errMsg);
        }
      } catch (error) {
        const fallbackMsg = 'Unable to reach the mail server right now. Please email lingdaniel999@gmail.com directly.';
        renderFormStatus('error', 'Network Error', fallbackMsg);
        showContactToast('error', 'Connection Error', fallbackMsg);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
      }
    });
  }

  // ------------------------------------------------------------------------
  // 6. Navigation Safety: BFCache & Browser History Transitions
  // ------------------------------------------------------------------------
  window.addEventListener('pageshow', (e) => {
    if (e.persisted || sessionStorage.getItem('visited_session') === 'true') {
      document.body.classList.remove('intro-active');
      document.body.classList.add('intro-revealed');
      const introEl = document.getElementById('intro-screen');
      if (introEl) introEl.style.display = 'none';

      const curHash = window.location.hash;
      if (curHash && curHash !== '#home') {
        const target = document.querySelector(curHash);
        if (target) {
          triggerSectionAnimation(target);
        }
      } else {
        const homeSection = document.getElementById('home');
        if (homeSection) triggerSectionAnimation(homeSection);
      }
    }
  });

  window.addEventListener('hashchange', () => {
    const curHash = window.location.hash;
    if (curHash && curHash !== '#home') {
      const target = document.querySelector(curHash);
      if (target) {
        triggerSectionAnimation(target);
        desktopPillLinks.forEach((pill) => {
          if (pill.getAttribute('href') === curHash) {
            pill.classList.add('active');
          } else {
            pill.classList.remove('active');
          }
        });
      }
    } else {
      const homeSection = document.getElementById('home');
      if (homeSection) triggerSectionAnimation(homeSection);
      desktopPillLinks.forEach((pill) => {
        if (pill.getAttribute('href') === '#home') {
          pill.classList.add('active');
        } else {
          pill.classList.remove('active');
        }
      });
    }
  });

  // Strip hash before unload so browser reload naturally targets the top of index.html
  window.addEventListener('beforeunload', () => {
    if (window.location.hash && history.replaceState) {
      history.replaceState(null, null, window.location.pathname);
    }
  });
});
