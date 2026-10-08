/* ================================================================
   DISPATCH — Landing Page v2 JavaScript (Framer-Level Sandbox)
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // Global State
  // ============================================================
  let billingCycle = 'monthly'; // 'monthly' or 'yearly'
  let currentCriticHarshness = 'harsh'; // 'gentle', 'harsh', 'brutal'
  let isDevMode = false;
  let activeStarCount = 1428;
  let hasStarred = false;

  // Predefined Database of Wire Dispatches
  const dispatchesDb = {
    "1": {
      project: "swiftcart.io",
      time: "14:02 UTC",
      summary: "Shipped semantic search across filter parameters",
      drafts: {
        linkedin: "🚀 Big update on swiftcart.io — we just shipped semantic search across all filter parameters!\n\nInstead of matching simple words, filters now analyze search intent. A filter for 'gaming comments' will automatically identify creative spelling bypasses and contextual sarcasm that basic systems fail to see.\n\nTechnical details:\n- Configured pgvector embeddings\n- Hybrid sparse-dense retrieval\n- Latency remained under 50ms at p99\n\nNext sprint: customized semantic threshold boundaries in natural English.",
        x: "Shipped semantic search on swiftcart.io. \n\nFilters now understand search meaning rather than matching plain strings. Built using pgvector embeddings + hybrid dense/sparse search.\n\np99 latency is sub-50ms.\n\nNext step is letting users define custom semantic guidelines.",
        reddit: "Show r/selfhosted: Just shipped semantic search filters using pgvector on swiftcart.io. It understands context, not just keyword matches. We are holding sub-50ms latency by using hybrid retrieval. Fully MIT licensed codebase. AMA!",
        threads: "Finally shipped semantic search on swiftcart.io! Now filters read meaning instead of raw text. So a block for 'angry comments' actually catches context. Latency is super fast under 50ms. Let me know what you think!"
      },
      score: "9/10",
      critique: "Strong technical summary. The p99 latency metric is your best proof point; moving it to the middle keeps readers engaged. Hook is solid."
    },
    "2": {
      project: "vectorstore.ai",
      time: "09:40 UTC",
      summary: "Fixed critical memory leak in RAG embeddings",
      drafts: {
        linkedin: "🔧 Technical update on vectorstore.ai: Fixed a memory leak in the RAG chunk embedding loop.\n\nWhile running large document runs, we identified memory consumption spiking by 200MB/hr. We isolated the leak to unreleased tensor references in Python PyTorch runtime.\n\nAfter clearing garbage collector hooks, memory usage recovered by 40% under sustained RAG loads.\n\nSelf-host configs are updated in our latest release.",
        x: "Fixed a nasty PyTorch memory leak in vectorstore.ai's RAG embeddings loop.\n\nSpiked 200MB/hr. Solved by explicitly dereferencing tensors and clearing cache.\n\nResult: 40% memory usage reduction under heavy RAG document indexing.",
        reddit: "r/Python: How we debugged a PyTorch tensor leak in our RAG indexing script. Memory was spiking 200MB/hr. Discovered that reference counts were held by local exception variables. We reclaimed 40% RAM. Code details in thread.",
        threads: "Spent 6 hours hunting a memory leak in vectorstore.ai's embedding engine. PyTorch was holding tensors in memory, raising usage by 200MB/hr. Solved it and memory usage dropped by 40%. Time for coffee."
      },
      score: "8/10",
      critique: "Great problem-solution breakdown. Emphasize the PyTorch specific gotcha since that is highly useful for Python devs."
    },
    "3": {
      project: "clip-extension",
      time: "Yesterday",
      summary: "Beta Chrome Extension launch to 100 testers",
      drafts: {
        linkedin: "⚡ clip-extension is taking its next step. We've officially launched our Chrome Extension beta to the first 100 developers!\n\nclip-extension captures your terminal activities and visualizes code sprints automatically. This release tests background syncing latency under massive terminal logs.\n\nSpecial thanks to our early builders. Sign up inside for the next batch.",
        x: "clip-extension Chrome Extension beta is now live for the first 100 testers.\n\nTests background logging sync speeds for terminal scripts.\n\nDM if you want early access to the next batch.",
        reddit: "r/startups: Launching our Chrome Extension beta to our first cohort of 100 testers. It helps developers document terminal logs automatically. Lessons learned from extension reviews inside.",
        threads: "clip-extension beta is live for 100 testers! It links terminal activity straight to your browser tabs. Let's see how the sync performance holds up."
      },
      score: "8.5/10",
      critique: "Clear CTA. Good pacing. Ensure you link the extension install page directly in the first comment of your social posts."
    },
    "4": {
      project: "paybridge.co",
      time: "2 days ago",
      summary: "UPI transaction gateway successfully processing first live transactions",
      drafts: {
        linkedin: "💸 Milestone reached for paybridge.co: Our UPI payment gateway is officially live in production and has processed its first live transactions!\n\nWe built custom webhooks to verify payment hashes, decreasing checkout completion time to under 4 seconds.\n\nAwesome to watch the first real revenue flow through the platform.",
        x: "paybridge.co UPI checkout is live.\n\nProcessed our first live transactions today. Custom payment hash verification webhooks reduced checkout speeds to < 4s.\n\nReal volume is flowing.",
        reddit: "r/developer: Shipped a custom UPI webhook pipeline for paybridge.co. Decreased checkout time to 4s and processed our first live payments. Happy to answer questions about Indian payment integration API quirks.",
        threads: "paybridge.co is officially taking payments! Checkout is under 4 seconds. Watching transactions hit the dashboard live is the best feeling in startup building."
      },
      score: "9.5/10",
      critique: "Excellent milestone post. Emojis work well here to highlight financial success. High conversion potential."
    }
  };

  let activeDraftId = "1";
  let activePlatform = "linkedin";

  // ============================================================
  // 1. TOAST NOTIFICATIONS MANAGER
  // ============================================================
  window.showToast = function(title, desc, type = 'default') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'success' : ''}`;

    let iconSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    if (type === 'success') {
      iconSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    }

    toast.innerHTML = `
      ${iconSVG}
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-desc">${desc}</div>
      </div>
    `;

    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.classList.add('active');
    }, 10);

    // Remove after 3.5s
    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3500);
  };

  // ============================================================
  // 2. SCROLL REVEALS (Intersection Observer)
  // ============================================================
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ============================================================
  // 3. NAVBAR SCROLL EFFECT
  // ============================================================
  const navbar = document.getElementById('navbar');
  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ============================================================
  // 4. MOBILE MENU DRAWER
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
  // 5. BENTO CARDS PARALLAX GLOW HOVER
  // ============================================================
  const bentoCards = document.querySelectorAll('.bento-card');
  bentoCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // ============================================================
  // 6. COPY COMMAND ACTIONS
  // ============================================================
  const setupClipboardCopy = (triggerId, textToCopy, successMsg) => {
    const el = document.getElementById(triggerId);
    if (!el) return;

    el.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(textToCopy);
        showToast("Copied to Clipboard", successMsg, "success");
      } catch (err) {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = textToCopy;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        showToast("Copied to Clipboard", successMsg, "success");
      }
    });
  };

  setupClipboardCopy('cta-copy', 'docker compose up -d', 'Docker compose command copied.');
  setupClipboardCopy('cli-bento-copy', 'dispatch log "Shipped webhook router v2 to paybridge.co"', 'CLI demo command copied.');
  setupClipboardCopy('github-clone-copy', 'git clone https://github.com/dispatch/dispatch.git', 'Git repository clone command copied.');

  // ============================================================
  // 7. INTERACTIVE WIRE FEED & COMPOSING DESK
  // ============================================================
  const wireListContainer = document.getElementById('wire-list-container');
  const deskTitle = document.getElementById('desk-title');
  const deskSubtitle = document.getElementById('desk-subtitle');
  const composeInput = document.getElementById('compose-input');
  const projectSelect = document.getElementById('project-select');
  const angleSelect = document.getElementById('angle-select');
  
  const composerInputPanel = document.getElementById('composer-input-panel');
  const composerOutputPanel = document.getElementById('composer-output-panel');
  const simulatorLoader = document.getElementById('simulator-loader');
  const loaderStatus = document.getElementById('loader-status');
  
  const draftTextScreen = document.getElementById('draft-text-screen');
  const criticScore = document.getElementById('critic-score');
  const criticComment = document.getElementById('critic-comment');
  const wireCounter = document.getElementById('wire-counter');
  
  const logToWireBtn = document.getElementById('log-to-wire-btn');
  const copyDraftBtn = document.getElementById('copy-draft-btn');
  const backToComposeBtn = document.getElementById('back-to-compose-btn');
  const draftPlatformTabs = document.getElementById('draft-platform-tabs');

  // Load active dispatch into details desk
  const loadActiveDispatch = (id) => {
    const data = dispatchesDb[id];
    if (!data) return;
    
    activeDraftId = id;
    deskTitle.innerHTML = `${data.project} · <span style="font-weight:400; color:var(--text-secondary);">${data.summary}</span>`;
    deskSubtitle.textContent = `Wire logged at ${data.time}`;
    
    // Switch to output panel view
    composerInputPanel.style.display = 'none';
    composerOutputPanel.style.display = 'flex';
    
    updateDraftScreenText();
  };

  const updateDraftScreenText = () => {
    const data = dispatchesDb[activeDraftId];
    if (!data) return;

    draftTextScreen.textContent = data.drafts[activePlatform];
    criticScore.textContent = data.score;
    criticComment.textContent = data.critique;

    if (isDevMode) {
      draftTextScreen.innerHTML = `<span style="color:var(--accent-gold); font-family:var(--font-mono); font-size:0.75rem; display:block; border-bottom:1px solid var(--border-subtle); padding-bottom:4px; margin-bottom:12px;">SYSTEM_PROMPT: Adapt summary "${data.summary}" for project "${data.project}" using tone "${activePlatform.toUpperCase()}" with constraints.</span>` + data.drafts[activePlatform];
    }
  };

  // Wire list item clicks
  if (wireListContainer) {
    wireListContainer.addEventListener('click', (e) => {
      const item = e.target.closest('.simulator-wire-item');
      if (!item) return;

      document.querySelectorAll('.simulator-wire-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');

      const id = item.getAttribute('data-id');
      loadActiveDispatch(id);
    });
  }

  // Composing Tabs Click
  if (draftPlatformTabs) {
    draftPlatformTabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.simulator-tab');
      if (!tab) return;

      draftPlatformTabs.querySelectorAll('.simulator-tab').forEach(el => el.classList.remove('active'));
      tab.classList.add('active');

      activePlatform = tab.getAttribute('data-tab');
      updateDraftScreenText();
    });
  }

  // Back to compose screen
  if (backToComposeBtn) {
    backToComposeBtn.addEventListener('click', () => {
      composerOutputPanel.style.display = 'none';
      composerInputPanel.style.display = 'flex';
      deskTitle.textContent = "Compose a new dispatch";
      deskSubtitle.textContent = "Simulate the generative engine locally";
      composeInput.value = "";
      composeInput.focus();
    });
  }

  // Copy Active Draft
  if (copyDraftBtn) {
    copyDraftBtn.addEventListener('click', async () => {
      const data = dispatchesDb[activeDraftId];
      if (!data) return;

      const txt = data.drafts[activePlatform];
      try {
        await navigator.clipboard.writeText(txt);
        showToast("Draft Copied", `Active ${activePlatform.toUpperCase()} draft copied to clipboard.`, "success");
      } catch (err) {
        showToast("Error Copying", "Clipboard access failed.", "error");
      }
    });
  }

  // Generate simulated dispatch drafts client-side
  const generateSimulatedDrafts = (projectName, textLog, angle) => {
    const timeStr = new Date().toUTCString().replace(/.*(\d{2}:\d{2}):\d{2}.*/, "$1 UTC");
    
    // Synthesize platform drafts based on input
    const cleanText = textLog.trim();
    
    const drafts = {
      linkedin: `🚀 Fresh build on ${projectName}: Just shipped: ${cleanText}!\n\nBy centering this update on real implementation details, we optimized workflow pacing.\n\nAngle: ${angle} Mode\nStack Context: Node + LangGraph\n\n#BuildingInPublic #OpenSource`,
      x: `Shipped on ${projectName}: ${cleanText}.\n\nBuilt with ${angle.toLowerCase()} constraints. p99 latency optimized. \n\n#buildinpublic`,
      reddit: `r/selfhosted: Shipped this on ${projectName}: ${cleanText}. Built under a completely open source stack, MIT licensed. Let me know if you want the docker run configs!`,
      threads: `Just shipped: ${cleanText} on ${projectName}. ${angle === 'Hype' ? 'Lets goooo!' : 'Writing code in the dark room.'}`
    };

    let score = "8.2/10";
    let comment = "Strong update. Hook highlights the feature clearly. Emojis are balanced.";

    if (currentCriticHarshness === 'brutal') {
      score = "6.0/10";
      comment = "Feels generic and robotic. Trim 'just shipped' and start with the raw engineering challenge instead. Emojis are distracting.";
    } else if (currentCriticHarshness === 'gentle') {
      score = "9.5/10";
      comment = "Excellent log! Solid structure, clean alignment, and fits the audience nicely. Keep shipping!";
    }

    return {
      project: projectName,
      time: timeStr,
      summary: cleanText,
      drafts: drafts,
      score: score,
      critique: comment
    };
  };

  // Log to wire submit handler
  if (logToWireBtn) {
    logToWireBtn.addEventListener('click', () => {
      const val = composeInput.value.trim();
      if (!val) {
        showToast("Input Empty", "Please write what you shipped to test drafts.", "error");
        return;
      }

      const pName = projectSelect.value === 'Custom' ? 'MyProject' : projectSelect.value;
      const angle = angleSelect.value;

      // 1. Show loader
      composerInputPanel.style.display = 'none';
      simulatorLoader.style.display = 'flex';
      loaderStatus.textContent = "Retrieving project variables...";

      // Staged status simulation
      setTimeout(() => {
        loaderStatus.textContent = "Running prompt template pipeline...";
        setTimeout(() => {
          loaderStatus.textContent = "Invoking AI Editorial board audit...";
          setTimeout(() => {
            // 2. Build mock dispatch db record
            const newId = (Object.keys(dispatchesDb).length + 1).toString();
            const result = generateSimulatedDrafts(pName, val, angle);
            
            dispatchesDb[newId] = result;

            // 3. Insert new item into Wire list top
            const wireItem = document.createElement('div');
            wireItem.className = 'simulator-wire-item active';
            wireItem.setAttribute('data-id', newId);
            wireItem.innerHTML = `
              <div class="simulator-wire-item-meta">
                <span class="simulator-wire-item-name">${result.project}</span>
                <span class="simulator-wire-item-time">Just now</span>
              </div>
              <div class="simulator-wire-item-desc">${result.summary}</div>
            `;
            
            // Remove active from others
            document.querySelectorAll('.simulator-wire-item').forEach(el => el.classList.remove('active'));
            wireListContainer.insertBefore(wireItem, wireListContainer.firstChild);

            // Update counter
            const totalCount = Object.keys(dispatchesDb).length;
            wireCounter.textContent = `${totalCount} records`;

            // 4. Hide loader, load active dispatch drafts
            simulatorLoader.style.display = 'none';
            loadActiveDispatch(newId);

            showToast("Wire Dispatch Logged", `Successfully generated drafts for ${result.project}.`, "success");

          }, 600);
        }, 650);
      }, 700);
    });
  }

  // ============================================================
  // 8. PRICING BILLING CYCLE & MODALS
  // ============================================================
  const billingToggle = document.getElementById('billing-cycle-toggle');
  const proPriceNum = document.getElementById('pro-price-num');
  const proPricePeriod = document.getElementById('pro-price-period');
  const entPriceNum = document.getElementById('ent-price-num');
  const entPricePeriod = document.getElementById('ent-price-period');
  const monthlyLabel = document.getElementById('toggle-monthly-label');
  const yearlyLabel = document.getElementById('toggle-yearly-label');

  const updatePricingDisplay = () => {
    if (billingCycle === 'monthly') {
      proPriceNum.textContent = "$12";
      proPricePeriod.textContent = "/ month";
      entPriceNum.textContent = "$49";
      entPricePeriod.textContent = "/ month";
      monthlyLabel.classList.add('active');
      yearlyLabel.classList.remove('active');
      billingToggle.classList.remove('yearly');
    } else {
      proPriceNum.textContent = "$10";
      proPricePeriod.textContent = "/ mo billed yearly";
      entPriceNum.textContent = "$39";
      entPricePeriod.textContent = "/ mo billed yearly";
      yearlyLabel.classList.add('active');
      monthlyLabel.classList.remove('active');
      billingToggle.classList.add('yearly');
    }
  };

  if (billingToggle) {
    billingToggle.addEventListener('click', () => {
      billingCycle = billingCycle === 'monthly' ? 'yearly' : 'monthly';
      updatePricingDisplay();
      showToast("Billing Cycle Updated", `Pricing switched to ${billingCycle} billing.`, "default");
    });
  }

  // ============================================================
  // 9. MODALS STATE MANAGEMENT
  // ============================================================
  const setupModal = (triggerBtnId, modalId) => {
    const btn = document.getElementById(triggerBtnId);
    const modal = document.getElementById(modalId);
    if (!btn || !modal) return;

    const closeBtn = modal.querySelector('.modal-close-btn');

    const openModal = () => modal.classList.add('active');
    const closeModal = () => modal.classList.remove('active');

    btn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  };

  setupModal('tier-btn-community', 'selfhost-modal');
  setupModal('cta-bottom-host', 'selfhost-modal');
  setupModal('tier-btn-pro', 'checkout-modal');
  setupModal('cta-bottom-trial', 'checkout-modal');

  // Contact Sales Enterprise simulation
  const entBtn = document.getElementById('tier-btn-ent');
  if (entBtn) {
    entBtn.addEventListener('click', () => {
      showToast("Enterprise Contact", "Opening simulated team support calendar channel...", "default");
      setTimeout(() => {
        showToast("Waitlist Registered", "Your enterprise agency request has been logged.", "success");
      }, 1000);
    });
  }

  // Stripe trial checkout submit
  const checkoutForm = document.getElementById('checkout-form');
  const checkoutModal = document.getElementById('checkout-modal');
  if (checkoutForm && checkoutModal) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('checkout-email').value;
      
      const submitBtn = checkoutForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Syncing with Stripe payment API...";
      submitBtn.disabled = true;

      setTimeout(() => {
        checkoutModal.classList.remove('active');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        checkoutForm.reset();

        showToast("Pro Cloud Account Active", `14-day trial activated for ${email}. Welcome aboard!`, "success");
      }, 1500);
    });
  }

  // Docker config copy button in modal
  const selfhostCopyBtn = document.getElementById('selfhost-copy-btn');
  const selfhostModal = document.getElementById('selfhost-modal');
  if (selfhostCopyBtn && selfhostModal) {
    selfhostCopyBtn.addEventListener('click', async () => {
      const codeBlock = selfhostModal.querySelector('pre');
      if (!codeBlock) return;

      try {
        await navigator.clipboard.writeText(codeBlock.innerText);
        showToast("Config Copied", "docker-compose.yml text file copied to clipboard.", "success");
        selfhostModal.classList.remove('active');
      } catch (err) {
        showToast("Error Copying", "Failed to access clipboard.", "error");
      }
    });
  }

  // ============================================================
  // 10. GITHUB MODAL AND STAR COUNT INCREMENTER
  // ============================================================
  const githubModal = document.getElementById('github-modal');
  const navStarBtn = document.getElementById('nav-star-btn');
  const heroCtaGithub = document.getElementById('hero-cta-github');
  const navStarCount = document.getElementById('nav-star-count');
  const modalStarCount = document.getElementById('modal-star-count');

  const openGithubModal = () => {
    if (githubModal) githubModal.classList.add('active');
  };

  if (navStarBtn) navStarBtn.addEventListener('click', openGithubModal);
  if (heroCtaGithub) heroCtaGithub.addEventListener('click', openGithubModal);
  
  if (githubModal) {
    const closeBtn = githubModal.querySelector('.modal-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => githubModal.classList.remove('active'));
    githubModal.addEventListener('click', (e) => {
      if (e.target === githubModal) githubModal.classList.remove('active');
    });
  }

  // Star Increment Simulation
  const handleGithubStar = () => {
    if (hasStarred) {
      showToast("Already Starred", "You have already starred the Dispatch repository. Thank you!", "success");
      return;
    }

    activeStarCount++;
    if (navStarCount) navStarCount.textContent = activeStarCount.toLocaleString();
    if (modalStarCount) modalStarCount.textContent = activeStarCount.toLocaleString();
    hasStarred = true;

    // Change visual states of buttons
    if (navStarBtn) {
      navStarBtn.style.color = '#fff';
      navStarBtn.style.background = 'var(--accent-gold)';
    }

    showToast("Milestone Unlocked!", "Starred on GitHub! You are contributor #1,429.", "success");
  };

  if (navStarBtn) {
    navStarBtn.addEventListener('dblclick', handleGithubStar); // Double click to simulate actual Git Star
    // Add simple click hook to raise star too, for intuitive UX
    navStarBtn.addEventListener('click', (e) => {
      // Small timeout to prevent conflict with modal overlay if modal is open
      setTimeout(handleGithubStar, 100);
    });
  }

  // ============================================================
  // 11. FAQ ACCORDION
  // ============================================================
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const isActive = item.classList.contains('active');

      document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));
      
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // ============================================================
  // 12. COMMAND PALETTE (`Ctrl+K` Raycast Overlay)
  // ============================================================
  const cmdPalette = document.getElementById('command-palette');
  const cmdInput = document.getElementById('command-input');
  const cmdResults = document.getElementById('command-results');
  const navSearchBtn = document.getElementById('nav-search-btn');

  const openCommandPalette = () => {
    if (cmdPalette) {
      cmdPalette.classList.add('active');
      setTimeout(() => cmdInput.focus(), 50);
    }
  };

  const closeCommandPalette = () => {
    if (cmdPalette) cmdPalette.classList.remove('active');
  };

  if (navSearchBtn) navSearchBtn.addEventListener('click', openCommandPalette);

  // Shortcut key triggers
  document.addEventListener('keydown', (e) => {
    // Ctrl+K or Cmd+K
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      if (cmdPalette.classList.contains('active')) {
        closeCommandPalette();
      } else {
        openCommandPalette();
      }
    }
    
    // Esc closes modals and palette
    if (e.key === 'Escape') {
      closeCommandPalette();
      document.querySelectorAll('.modal-overlay').forEach(el => el.classList.remove('active'));
    }
  });

  // Handle Command Palette items selection (arrow keys, enter)
  let selectedIndex = 0;

  const updatePaletteSelection = () => {
    const items = cmdResults.querySelectorAll('.command-item');
    items.forEach((item, idx) => {
      if (idx === selectedIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  };

  if (cmdInput) {
    cmdInput.addEventListener('keydown', (e) => {
      const items = cmdResults.querySelectorAll('.command-item');
      if (items.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % items.length;
        updatePaletteSelection();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        updatePaletteSelection();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const activeItem = items[selectedIndex];
        if (activeItem) {
          executeCommandAction(activeItem);
        }
      }
    });

    // Filtering command items
    cmdInput.addEventListener('input', () => {
      const filter = cmdInput.value.toLowerCase();
      const items = cmdResults.querySelectorAll('.command-item');
      let visibleIdx = 0;

      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(filter)) {
          item.style.display = 'flex';
          if (visibleIdx === 0) {
            item.classList.add('selected');
          } else {
            item.classList.remove('selected');
          }
          visibleIdx++;
        } else {
          item.style.display = 'none';
        }
      });
      
      selectedIndex = 0;
    });
  }

  // Click handler on command items
  if (cmdResults) {
    cmdResults.addEventListener('click', (e) => {
      const item = e.target.closest('.command-item');
      if (item) executeCommandAction(item);
    });
  }

  const executeCommandAction = (item) => {
    const action = item.getAttribute('data-action');
    closeCommandPalette();

    if (action === 'scroll') {
      const targetId = item.getAttribute('data-target');
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        const navHeight = navbar.offsetHeight;
        const targetPos = targetEl.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
        showToast("Navigation", `Scrolled to ${targetId.replace('#','')}`, "default");
      }
    } 
    else if (action === 'toggle-billing') {
      billingCycle = billingCycle === 'monthly' ? 'yearly' : 'monthly';
      updatePricingDisplay();
      showToast("Billing Cycle Updated", `Pricing switched to ${billingCycle} billing.`, "default");
    } 
    else if (action === 'critic-harshness') {
      const level = item.getAttribute('data-level');
      currentCriticHarshness = level;
      showToast("AI Critic Mode Set", `Harshness mode set to ${level.toUpperCase()}.`, "success");
      // If we are currently showing a draft, update the score/critique
      if (composerOutputPanel.style.display === 'flex') {
        const data = dispatchesDb[activeDraftId];
        if (data) {
          if (level === 'brutal') {
            data.score = "6.0/10";
            data.critique = "Feels generic and robotic. Trim 'just shipped' and start with the raw engineering challenge instead. Emojis are distracting.";
          } else if (level === 'harsh') {
            data.score = "8.2/10";
            data.critique = "Strong update. Hook highlights the feature clearly. Emojis are balanced.";
          } else {
            data.score = "9.5/10";
            data.critique = "Excellent log! Solid structure, clean alignment, and fits the audience nicely. Keep shipping!";
          }
          updateDraftScreenText();
        }
      }
    } 
    else if (action === 'toggle-dev-mode') {
      isDevMode = !isDevMode;
      showToast("Developer Prompt Debugger", `Dev mode is now ${isDevMode ? 'ENABLED' : 'DISABLED'}.`, "success");
      if (composerOutputPanel.style.display === 'flex') {
        updateDraftScreenText();
      }
    } 
    else if (action === 'copy-cli') {
      navigator.clipboard.writeText('npm install -g @dispatch/cli');
      showToast("Copied to Clipboard", "dispatch global installation command copied.", "success");
    }
  };

});
