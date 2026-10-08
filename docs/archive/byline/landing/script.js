/* ================================================================
   DISPATCH — Landing Page Interactivity
   Scroll reveals, navbar behavior, wire-feed demo, stamp animations
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ============================================================
  // 1. SCROLL REVEAL (IntersectionObserver)
  // ============================================================
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Don't unobserve — let elements re-animate if scrolled back? 
        // No, better UX to only animate once:
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ============================================================
  // 2. NAVBAR SCROLL EFFECT
  // ============================================================
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  const handleNavbarScroll = () => {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = scrollY;
  };

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll(); // Initial state

  // ============================================================
  // 3. MOBILE MENU TOGGLE
  // ============================================================
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navbarLinks = document.getElementById('navbar-links');

  if (mobileMenuBtn && navbarLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('active');
      navbarLinks.classList.toggle('mobile-open');
    });

    // Close on link click
    navbarLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        navbarLinks.classList.remove('mobile-open');
      });
    });
  }

  // ============================================================
  // 4. SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navbarHeight = navbar.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ============================================================
  // 5. STAMP SEQUENCE ANIMATION (Hero Wire Demo)
  // ============================================================
  const wireDemo = document.getElementById('wire-demo');

  if (wireDemo) {
    // Animate stamps in the first (active) entry with staggered delays
    const activeEntry = wireDemo.querySelector('.wire-entry.active');
    if (activeEntry) {
      const stamps = activeEntry.querySelectorAll('.stamp');
      stamps.forEach((stamp, index) => {
        // Remove filled classes initially, then re-add with delay
        const originalClasses = [...stamp.classList].filter(c => c.startsWith('filled-'));

        if (originalClasses.length > 0) {
          // Store the fill class
          const fillClass = originalClasses[0];
          stamp.classList.remove(fillClass);

          // Animate in with delay
          setTimeout(() => {
            stamp.classList.add(fillClass);
          }, 1500 + (index * 500)); // Start after hero loads
        }
      });
    }
  }

  // ============================================================
  // 6. WIRE FEED TYPING SIMULATION
  // ============================================================
  // The wire entries use CSS animation (wire-entry-appear) for initial load.
  // After initial load, we periodically "pulse" the active entry.

  const wireEntries = document.querySelectorAll('#wire-demo-body .wire-entry');
  let currentActiveIndex = 0;

  if (wireEntries.length > 0) {
    setInterval(() => {
      // Remove active from current
      wireEntries[currentActiveIndex].classList.remove('active');

      // Move to next
      currentActiveIndex = (currentActiveIndex + 1) % wireEntries.length;

      // Add active to new
      wireEntries[currentActiveIndex].classList.add('active');
    }, 4000);
  }

  // ============================================================
  // 7. COPY DOCKER COMMAND
  // ============================================================
  const copyBtn = document.getElementById('cta-copy');

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('docker compose up -d');

        // Visual feedback
        const originalText = copyBtn.querySelector('span:nth-child(2)').textContent;
        copyBtn.querySelector('span:nth-child(2)').textContent = 'Copied!';
        copyBtn.style.borderColor = 'var(--accent-mint)';

        setTimeout(() => {
          copyBtn.querySelector('span:nth-child(2)').textContent = originalText;
          copyBtn.style.borderColor = '';
        }, 2000);
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = 'docker compose up -d';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    });
  }

  // ============================================================
  // 8. DEMO TABS INTERACTION
  // ============================================================
  const demoTabs = document.querySelectorAll('.demo-tab');

  demoTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      demoTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // ============================================================
  // 9. PARALLAX SUBTLE GLOW MOVEMENT
  // ============================================================
  let ticking = false;

  const handleMouseMove = (e) => {
    if (ticking) return;

    ticking = true;
    requestAnimationFrame(() => {
      const hero = document.querySelector('.hero');
      if (!hero) { ticking = false; return; }

      const rect = hero.getBoundingClientRect();

      // Only apply when hero is visible
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        ticking = false;
        return;
      }

      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;

      hero.style.setProperty('--glow-x', `${x}px`);
      hero.style.setProperty('--glow-y', `${y}px`);

      ticking = false;
    });
  };

  document.addEventListener('mousemove', handleMouseMove, { passive: true });

  // ============================================================
  // 10. PERFORMANCE: Reduce animations when tab is hidden
  // ============================================================
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      document.body.style.animationPlayState = 'paused';
    } else {
      document.body.style.animationPlayState = 'running';
    }
  });
});
