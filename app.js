/**
 * TASCFAST // MODERN OBSIDIAN ENGINE
 * Core Interactive System: Waveform Audio, Scheduler, Countdown, AI Concierge
 */

document.addEventListener('DOMContentLoaded', () => {
  initWaveformAudioPlayer();
  initEditorialCountdown();
  initCalendarScheduler();
  initFaqAccordion();
  initMobileBottomNav();
  initAiConcierge();
  initCaptureForm();
  initLegalModals();
});

/* ==========================================================================
   1. Interactive Voice Agent Audio Demo & Dynamic Waveform Synthesizer
   ========================================================================== */
function initWaveformAudioPlayer() {
  const playBtn = document.getElementById('demo-play-btn');
  const playIcon = document.getElementById('play-btn-icon');
  const playText = document.getElementById('play-btn-text');
  const timeDisplay = document.getElementById('demo-time-display');
  const canvas = document.getElementById('waveform-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let isPlaying = false;
  let audioCtx = null;
  let oscillator = null;
  let gainNode = null;
  let animFrameId = null;
  let startTime = 0;
  const totalDuration = 28; // 28 seconds call
  let currentElapsed = 0;

  // Dialogue timestamps in seconds
  const transcriptLines = [
    { id: 'line-0', start: 0, end: 7, speaker: 'caller' },
    { id: 'line-1', start: 7, end: 15, speaker: 'agent' },
    { id: 'line-2', start: 15, end: 20, speaker: 'caller' },
    { id: 'line-3', start: 20, end: 28, speaker: 'agent' }
  ];

  // Resize canvas for sharp retina rendering
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Initialize Web Audio Context for realistic telephony sound simulation
  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
  }

  // Play voice synthesized sound tones to emulate call audio
  function playPhoneAudioBeep(freq, type, duration) {
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      // Bandpass filter to simulate telephone 300Hz-3400Hz frequency
      filter.type = 'bandpass';
      filter.frequency.value = 1200;
      filter.Q.value = 1.2;

      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio playback note:", e);
    }
  }

  function startPlayback() {
    initAudio();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    isPlaying = true;
    playText.textContent = 'PAUSE CALL';
    playIcon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
    
    startTime = performance.now() - (currentElapsed * 1000);
    renderWaveform();
  }

  function pausePlayback() {
    isPlaying = false;
    playText.textContent = 'RESUME CALL';
    playIcon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
    if (animFrameId) cancelAnimationFrame(animFrameId);
  }

  function resetPlayback() {
    isPlaying = false;
    currentElapsed = 0;
    playText.textContent = 'HEAR IT LIVE (30s)';
    playIcon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
    timeDisplay.textContent = '00:00 / 00:28';
    if (animFrameId) cancelAnimationFrame(animFrameId);
    
    // Clear transcript active states
    transcriptLines.forEach(line => {
      const el = document.getElementById(line.id);
      if (el) el.classList.remove('active');
    });
    drawIdleWaveform();
  }

  // Draw idle stationary wave
  function drawIdleWaveform() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    const bars = 48;
    const barWidth = 3;
    const gap = (rect.width - (bars * barWidth)) / (bars - 1);

    for (let i = 0; i < bars; i++) {
      const x = i * (barWidth + gap);
      const h = 4 + Math.sin(i * 0.4) * 3;
      const y = (rect.height - h) / 2;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(x, y, barWidth, h);
    }
  }
  drawIdleWaveform();

  // Animation Loop with live audio waveform simulation and transcript sync
  let lastAudioTick = 0;
  function renderWaveform() {
    if (!isPlaying) return;

    const now = performance.now();
    currentElapsed = (now - startTime) / 1000;

    if (currentElapsed >= totalDuration) {
      resetPlayback();
      return;
    }

    // Format MM:SS
    const curSec = Math.floor(currentElapsed);
    const formatted = `00:${curSec < 10 ? '0' + curSec : curSec} / 00:${totalDuration}`;
    timeDisplay.textContent = formatted;

    // Synchronize transcript lines
    transcriptLines.forEach((line) => {
      const el = document.getElementById(line.id);
      if (!el) return;
      if (currentElapsed >= line.start && currentElapsed < line.end) {
        if (!el.classList.contains('active')) {
          el.classList.add('active');
          // Soft telephone voice modulation chime on line switch
          if (line.speaker === 'agent') {
            playPhoneAudioBeep(440, 'triangle', 0.12);
          } else {
            playPhoneAudioBeep(320, 'sine', 0.15);
          }
        }
      } else {
        el.classList.remove('active');
      }
    });

    // Generate random subtle audio tick tone when speaking
    if (now - lastAudioTick > 450) {
      lastAudioTick = now;
      const currentActive = transcriptLines.find(l => currentElapsed >= l.start && currentElapsed < l.end);
      if (currentActive) {
        const baseFreq = currentActive.speaker === 'agent' ? 520 : 360;
        playPhoneAudioBeep(baseFreq + (Math.random() * 80 - 40), 'sine', 0.08);
      }
    }

    // Render Animated Bars
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    const bars = 48;
    const barWidth = 3;
    const gap = (rect.width - (bars * barWidth)) / (bars - 1);
    const progress = currentElapsed / totalDuration;

    for (let i = 0; i < bars; i++) {
      const barProgress = i / bars;
      const x = i * (barWidth + gap);
      
      // Dynamic height modulated by sine waves + random voice flutter
      let amp = Math.sin((i * 0.3) + (now * 0.008)) * 12 + Math.cos(now * 0.005 + i) * 6;
      let h = Math.max(4, Math.abs(amp) + 8);
      if (Math.random() > 0.6) h += 4;
      const y = (rect.height - h) / 2;

      // Color active bars with silver-white gradient, inactive with subtle opacity
      if (barProgress <= progress) {
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.shadowBlur = 6;
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.shadowBlur = 0;
      }

      ctx.fillRect(x, y, barWidth, h);
    }
    ctx.shadowBlur = 0;

    animFrameId = requestAnimationFrame(renderWaveform);
  }

  playBtn.addEventListener('click', () => {
    if (isPlaying) {
      pausePlayback();
    } else {
      startPlayback();
    }
  });
}

/* ==========================================================================
   2. Editorial Countdown Timer
   ========================================================================== */
function initEditorialCountdown() {
  const hoursEl = document.getElementById('hours-val');
  const minutesEl = document.getElementById('minutes-val');
  const secondsEl = document.getElementById('seconds-val');
  if (!hoursEl || !minutesEl || !secondsEl) return;

  // Set target to end of current week or 18 hours 42 mins from load
  const now = new Date();
  const targetDate = new Date(now.getTime() + (18 * 3600 + 42 * 60 + 20) * 1000);

  function updateTimer() {
    const current = new Date();
    const diff = Math.max(0, targetDate - current);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    hoursEl.textContent = hours < 10 ? '0' + hours : hours;
    minutesEl.textContent = minutes < 10 ? '0' + minutes : minutes;
    secondsEl.textContent = seconds < 10 ? '0' + seconds : seconds;
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* ==========================================================================
   3. Interactive Calendar Scheduling Terminal & Booking Engine
   ========================================================================== */
function initCalendarScheduler() {
  const datePillsRow = document.getElementById('date-pills-row');
  const timeSlotsContainer = document.getElementById('time-slots-container');
  const tzSelect = document.getElementById('tz-select');
  const activeTzLabel = document.getElementById('active-tz-label');
  const selectedSlotBadge = document.getElementById('selected-slot-badge');
  const bookingForm = document.getElementById('booking-form');
  const bookingSuccessState = document.getElementById('booking-success-state');
  const bookAnotherBtn = document.getElementById('book-another-btn');
  const calendarDownloadBtn = document.getElementById('calendar-download-btn');

  let selectedDate = null;
  let selectedTimeSlot = null;

  // Timezone offsets & labels
  const tzData = {
    'EST': { name: 'US Eastern (EDT)', label: 'EST' },
    'PST': { name: 'US Pacific (PDT)', label: 'PST' },
    'CST': { name: 'US Central (CDT)', label: 'CST' },
    'GST': { name: 'UAE Gulf (GST)', label: 'GST' },
    'IST': { name: 'India Standard (IST)', label: 'IST' },
    'GMT': { name: 'London (GMT)', label: 'GMT' }
  };

  // Generate 6 upcoming business days
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const today = new Date();
  const dateOptions = [];

  let dayOffset = 1;
  while (dateOptions.length < 5) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + dayOffset);
    const dayOfWeek = nextDate.getDay();
    // Exclude Sundays for discovery bookings
    if (dayOfWeek !== 0) {
      dateOptions.push(nextDate);
    }
    dayOffset++;
  }

  // Populate Date Pills
  if (datePillsRow) {
    datePillsRow.innerHTML = '';
    dateOptions.forEach((d, idx) => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = `date-pill ${idx === 0 ? 'active' : ''}`;
      const dayName = days[d.getDay()];
      const dayNum = d.getDate();
      const monthName = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();

      pill.innerHTML = `
        <span class="day-name">${dayName}</span>
        <span class="day-num">${dayNum}</span>
      `;

      pill.addEventListener('click', () => {
        document.querySelectorAll('.date-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        selectedDate = `${dayName}, ${monthName} ${dayNum}`;
        updateSelectedBadge();
      });

      datePillsRow.appendChild(pill);
      if (idx === 0) {
        selectedDate = `${dayName}, ${monthName} ${dayNum}`;
      }
    });
  }

  // Available slots by timezone
  const slotsByTz = {
    'EST': ['09:00 AM', '10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM'],
    'PST': ['08:00 AM', '09:30 AM', '11:00 AM', '01:30 PM', '03:00 PM', '04:30 PM'],
    'CST': ['09:30 AM', '11:00 AM', '01:30 PM', '03:00 PM', '04:30 PM', '05:00 PM'],
    'GST': ['11:00 AM', '01:30 PM', '03:30 PM', '05:00 PM', '07:30 PM', '09:00 PM'],
    'IST': ['12:30 PM', '03:00 PM', '05:00 PM', '06:30 PM', '08:00 PM', '09:30 PM'],
    'GMT': ['08:30 AM', '10:00 AM', '12:30 PM', '02:00 PM', '03:30 PM', '05:00 PM']
  };

  function renderTimeSlots() {
    const currentTz = tzSelect ? tzSelect.value : 'GST';
    const slots = slotsByTz[currentTz] || slotsByTz['GST'];
    if (activeTzLabel) activeTzLabel.textContent = currentTz;

    if (timeSlotsContainer) {
      timeSlotsContainer.innerHTML = '';
      slots.forEach((timeStr, idx) => {
        const slotBtn = document.createElement('button');
        slotBtn.type = 'button';
        slotBtn.className = `time-slot-btn ${idx === 1 ? 'active' : ''}`;
        slotBtn.textContent = timeStr;

        slotBtn.addEventListener('click', () => {
          document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('active'));
          slotBtn.classList.add('active');
          selectedTimeSlot = timeStr;
          updateSelectedBadge();
        });

        timeSlotsContainer.appendChild(slotBtn);
        if (idx === 1) {
          selectedTimeSlot = timeStr;
        }
      });
      updateSelectedBadge();
    }
  }

  function updateSelectedBadge() {
    if (!selectedSlotBadge) return;
    const tz = tzSelect ? tzSelect.value : 'GST';
    if (selectedDate && selectedTimeSlot) {
      selectedSlotBadge.textContent = `${selectedDate} @ ${selectedTimeSlot} (${tz})`;
      selectedSlotBadge.style.color = '#FFFFFF';
      selectedSlotBadge.style.borderColor = 'rgba(255, 255, 255, 0.3)';
    } else {
      selectedSlotBadge.textContent = 'SELECT A TIME SLOT';
    }
  }

  if (tzSelect) {
    tzSelect.addEventListener('change', () => {
      renderTimeSlots();
    });
  }

  renderTimeSlots();

  // Booking Form Submission & CRM simulation
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('booking-name').value;
      const emailInput = document.getElementById('booking-email').value;
      const phoneInput = document.getElementById('booking-phone').value;
      const nicheInput = document.getElementById('booking-niche').value;
      const notesInput = document.getElementById('booking-notes').value;

      const submitBtn = document.getElementById('confirm-booking-btn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>DISPATCHING TO GOHIGHLEVEL &amp; N8N...</span>`;

      setTimeout(() => {
        bookingForm.style.display = 'none';
        bookingSuccessState.style.display = 'flex';

        const confName = document.getElementById('conf-name-display');
        const confTime = document.getElementById('conf-time-display');
        const tz = tzSelect ? tzSelect.value : 'GST';

        if (confName) confName.textContent = nameInput.toUpperCase();
        if (confTime) confTime.textContent = `${selectedDate} AT ${selectedTimeSlot} (${tz})`;

        // Trigger simulated browser notification or console alert
        console.log(`[TASCFAST DISPATCH] Lead logged: ${nameInput} | ${emailInput} | ${nicheInput}`);
      }, 750);
    });
  }

  // Reset booking form
  if (bookAnotherBtn) {
    bookAnotherBtn.addEventListener('click', () => {
      bookingSuccessState.style.display = 'none';
      bookingForm.style.display = 'block';
      bookingForm.reset();
      const submitBtn = document.getElementById('confirm-booking-btn');
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>CONFIRM 30-MINUTE DISCOVERY CALL</span><svg width="12" height="12" viewBox="0 0 12 12" fill="none" class="btn-arrow" aria-hidden="true"><path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      renderTimeSlots();
    });
  }

  // Download .ics Calendar File generator
  if (calendarDownloadBtn) {
    calendarDownloadBtn.addEventListener('click', () => {
      const icsData = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Tascfast Technologies//Discovery Call//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:REQUEST',
        'BEGIN:VEVENT',
        'SUMMARY:Tascfast AI Discovery Session with Sahil Verma',
        'DESCRIPTION:Mapping existing lead bottlenecks and scoping autonomous voice agents & back-office automations.',
        'LOCATION:Google Meet (Link will be dispatched via SMS)',
        `DTSTART:${new Date().toISOString().replace(/-|:|\.\d\d\d/g, "")}`,
        'DURATION:PT30M',
        'STATUS:CONFIRMED',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', 'Tascfast-Discovery-Session.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
}

/* ==========================================================================
   4. FAQ Accordion Component
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');
    const icon = item.querySelector('.faq-toggle-icon');

    if (!trigger || !content) return;

    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

      // Close all other accordion items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherTrigger = otherItem.querySelector('.faq-trigger');
          const otherContent = otherItem.querySelector('.faq-content');
          const otherIcon = otherItem.querySelector('.faq-toggle-icon');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          if (otherContent) otherContent.hidden = true;
          if (otherIcon) otherIcon.textContent = '+';
        }
      });

      // Toggle current item
      if (isExpanded) {
        item.classList.remove('active');
        trigger.setAttribute('aria-expanded', 'false');
        content.hidden = true;
        if (icon) icon.textContent = '+';
      } else {
        item.classList.add('active');
        trigger.setAttribute('aria-expanded', 'true');
        content.hidden = false;
        if (icon) icon.textContent = '−';
      }
    });
  });
}

/* ==========================================================================
   5. Floating Mobile Bottom Nav (Appears after hero is scrolled)
   ========================================================================== */
function initMobileBottomNav() {
  const mobileNav = document.getElementById('mobile-nav');
  const heroSection = document.getElementById('hero');
  if (!mobileNav || !heroSection) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // If hero is NOT intersecting, show floating bottom nav
      if (!entry.isIntersecting) {
        mobileNav.classList.add('visible');
      } else {
        mobileNav.classList.remove('visible');
      }
    });
  }, {
    threshold: 0.15
  });

  observer.observe(heroSection);
}

/* ==========================================================================
   6. Live Proof On-Site AI Assistant (Concierge Widget)
   ========================================================================== */
function initAiConcierge() {
  const toggleBtn = document.getElementById('concierge-toggle-btn');
  const closeBtn = document.getElementById('concierge-close-btn');
  const windowEl = document.getElementById('concierge-window');
  const inputForm = document.getElementById('concierge-input-form');
  const inputField = document.getElementById('concierge-input');
  const messagesContainer = document.getElementById('concierge-messages');
  const quickChips = document.querySelectorAll('.quick-chip');

  if (!toggleBtn || !windowEl) return;

  toggleBtn.addEventListener('click', () => {
    const isHidden = windowEl.style.display === 'none' || windowEl.style.display === '';
    windowEl.style.display = isHidden ? 'flex' : 'none';
    if (isHidden && inputField) {
      inputField.focus();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      windowEl.style.display = 'none';
    });
  }

  function appendMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `msg ${sender}`;
    if (sender === 'bot') {
      msg.innerHTML = `<span class="msg-author mono-label">TASCFAST AGENT:</span><p>${text}</p>`;
    } else {
      msg.innerHTML = `<p>${text}</p>`;
    }
    messagesContainer.appendChild(msg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function generateBotReply(userText) {
    const query = userText.toLowerCase();

    if (query.includes('price') || query.includes('cost') || query.includes('fee')) {
      return "Most builds begin at $1,500 for architecture, prompt graph engineering, and 50+ stress-test simulated calls, with monthly optimization starting at $300. You receive an unalterable fixed quote in the blueprint phase.";
    } else if (query.includes('crm') || query.includes('dentrix') || query.includes('integrate') || query.includes('software')) {
      return "We connect directly into your existing tools without forcing staff to learn new software. We build n8n & Make pipelines directly into Dentrix, GoHighLevel, FollowUpBoss, HubSpot, Kareo, and Google Calendar.";
    } else if (query.includes('call') || query.includes('book') || query.includes('sahil') || query.includes('meeting')) {
      return `You can book an exact 30-minute discovery slot with Sahil Verma directly: <a href="https://calendly.com/sahi_tascfast/30min" target="_blank" rel="noopener noreferrer" style="color:#FFFFFF;text-decoration:underline;font-weight:600;display:inline-block;margin-top:4px;">Open Sahil's Calendly (New Tab) ↗</a> or scroll down to the calendar below.`;
    } else if (query.includes('dental') || query.includes('clinic')) {
      return "For dental practices, our voice agent Ava handles after-hours emergencies, appointment rescheduling, and insurance questions, saving front-desk staff 30+ hours weekly and eliminating missed patient calls.";
    } else if (query.includes('real estate') || query.includes('realty') || query.includes('property')) {
      return "For real estate brokers, our agents respond to inbound Zillow/WhatsApp leads in under 4 seconds, pre-qualify budget and timelines, and book showings directly on the broker's calendar.";
    } else {
      return "We engineer autonomous voice agents (Vapi/Retell) and n8n back-office workflows for dental clinics, real estate, med spas, and home services. I recommend booking a free 30-min discovery call with Sahil to map your lead flow!";
    }
  }

  if (inputForm) {
    inputForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = inputField.value.trim();
      if (!text) return;

      appendMessage(text, 'user');
      inputField.value = '';

      setTimeout(() => {
        const reply = generateBotReply(text);
        appendMessage(reply, 'bot');
      }, 500);
    });
  }

  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      appendMessage(prompt, 'user');
      setTimeout(() => {
        const reply = generateBotReply(prompt);
        appendMessage(reply, 'bot');
      }, 400);
    });
  });
}

/* ==========================================================================
   7. Quick Blueprint Lead Capture Form
   ========================================================================== */
function initCaptureForm() {
  const form = document.getElementById('quick-capture-form');
  const input = document.getElementById('capture-email');
  const feedback = document.getElementById('capture-feedback');
  const btn = document.getElementById('capture-btn');

  if (!form || !input || !feedback) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = input.value.trim();

    if (!email || !email.includes('@')) {
      feedback.textContent = 'PLEASE ENTER A VALID WORK EMAIL ADDRESS.';
      feedback.style.color = '#EF4444';
      return;
    }

    btn.disabled = true;
    btn.innerHTML = `<span>GENERATING...</span>`;

    setTimeout(() => {
      feedback.textContent = `✓ ARCHITECTURE BLUEPRINT DISPATCHED TO ${email.toUpperCase()}. CHECK INBOX.`;
      feedback.style.color = '#FFFFFF';
      input.value = '';
      btn.disabled = false;
      btn.innerHTML = `<span>BLUEPRINT SENT</span>`;
    }, 700);
  });
}

/* ==========================================================================
   8. Legal / Privacy Modals
   ========================================================================== */
function initLegalModals() {
  const modal = document.getElementById('legal-modal');
  const openPrivacyBtn = document.getElementById('open-privacy-btn');
  const openTermsBtn = document.getElementById('open-terms-btn');
  const closeBtn = document.getElementById('close-modal-btn');
  const modalTitle = document.getElementById('modal-title');
  const modalBody = document.getElementById('modal-content-body');

  if (!modal) return;

  function openModal(title, htmlContent) {
    if (modalTitle) modalTitle.textContent = title;
    if (modalBody && htmlContent) modalBody.innerHTML = htmlContent;
    modal.style.display = 'flex';
  }

  function closeModal() {
    modal.style.display = 'none';
  }

  if (openPrivacyBtn) {
    openPrivacyBtn.addEventListener('click', () => {
      openModal('Privacy Policy & Data Security Protocol', `
        <p><strong>Tascfast Technologies Inc. — Security Standard (2026)</strong></p>
        <p>1. <strong>Zero Model Training:</strong> Client calls, SMS logs, and customer records are processed via dedicated zero-retention enterprise endpoints. They are never ingested into public LLMs.</p>
        <p>2. <strong>HIPAA &amp; SOC2 Encryption:</strong> In-transit traffic is secured with TLS 1.3. At-rest voice audio is encrypted using AES-256 GCM.</p>
        <p>3. <strong>Client Data Ownership:</strong> You retain perpetual, exclusive ownership over all operational workflows, prompts, and lead datasets.</p>
      `);
    });
  }

  if (openTermsBtn) {
    openTermsBtn.addEventListener('click', () => {
      openModal('Client Terms of Engagement', `
        <p><strong>Scope of Architecture &amp; Service:</strong></p>
        <p>1. <strong>Blueprint Guarantee:</strong> Every deployment commences with a 3-day architectural blueprint outlining exact webhook connections, latency bounds, and total fixed costs.</p>
        <p>2. <strong>Testing Period:</strong> Before production traffic cutover, agents undergo a mandatory 50-call stress-testing evaluation with client sign-off.</p>
        <p>3. <strong>Active Tuning:</strong> Our engineering team conducts active daily auditing for 14 continuous calendar days post-deployment.</p>
      `);
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}
