/* 
========================================================================
   INTERACTIVITY CONTROLLER ENGINE (app.js)
   Apex Arena - Go Karting, Cricket Turf & Café Lounge
========================================================================
*/

document.addEventListener('DOMContentLoaded', () => {

  // Initialize GSAP plugins
  gsap.registerPlugin(ScrollTrigger);

  /* ==========================================
     1. STICKY HEADER & MOBILE NAVIGATION
     ========================================== */
  const navbar = document.getElementById('mainNavbar');
  const menuToggle = document.getElementById('menuToggle');
  const navLinksList = document.getElementById('navLinks');
  
  let isScrolling = false;
  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        // Sticky Header
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }

        // ScrollSpy (Active nav link tracking)
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 150; // offset header height

        sections.forEach(section => {
          const top = section.offsetTop;
          const height = section.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            currentSectionId = section.getAttribute('id');
          }
        });

        navItems.forEach(item => {
          item.classList.remove('active');
          const href = item.querySelector('a').getAttribute('href');
          if (href === `#${currentSectionId}`) {
            item.classList.add('active');
          }
        });

        isScrolling = false;
      });
      isScrolling = true;
    }
  });

  // Mobile Toggle menu click
  menuToggle.addEventListener('click', () => {
    navbar.classList.toggle('mobile-active');
  });

  // Close mobile nav when clicking links
  document.querySelectorAll('.nav-item a').forEach(link => {
    link.addEventListener('click', () => {
      navbar.classList.remove('mobile-active');
    });
  });

  /* ==========================================
     2. SCROLLSPY (ACTIVE NAV LINK TRACKING)
     ========================================== */
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('.nav-item');

  /* ==========================================
     3.about STATS COUNT UP SCROLL TRIGGER
     ========================================== */
  const stats = document.querySelectorAll('.stat-number');
  
  stats.forEach(stat => {
    const targetCount = parseFloat(stat.getAttribute('data-count'));
    const isDecimal = targetCount % 1 !== 0;

    gsap.fromTo(stat, 
      { textContent: 0 }, 
      {
        textContent: targetCount,
        duration: 2.5,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: stat,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        snap: { textContent: isDecimal ? 0.1 : 1 },
        onUpdate: function() {
          if (isDecimal) {
            stat.textContent = parseFloat(stat.textContent).toFixed(1);
          }
        }
      }
    );
  });

  /* ==========================================
     4. KARTING DIGITAL DASHBOARD & SPEEDOMETER
     ========================================== */
  const speedFill = document.getElementById('speedFill');
  const speedGlow = document.getElementById('speedGlow');
  const speedNum = document.getElementById('speedNum');
  const lapVal = document.getElementById('lapVal');
  const gForceVal = document.getElementById('gForceVal');

  let lapTimeMs = 0;
  let lapTimerInterval = null;
  let speedFluctuationInterval = null;

  // Run dynamic stopwatch loop
  function startLapTimer() {
    if (lapTimerInterval) clearInterval(lapTimerInterval);
    lapTimeMs = 0;
    lapTimerInterval = setInterval(() => {
      lapTimeMs += 30; // increments of 30ms
      
      const minutes = Math.floor(lapTimeMs / 60000);
      const seconds = Math.floor((lapTimeMs % 60000) / 1000);
      const ms = Math.floor((lapTimeMs % 1000) / 10);
      
      const minStr = String(minutes).padStart(2, '0');
      const secStr = String(seconds).padStart(2, '0');
      const msStr = String(ms).padStart(2, '0');
      
      lapVal.textContent = `${minStr}:${secStr}.${msStr}`;
    }, 30);
  }

  function stopLapTimer() {
    if (lapTimerInterval) {
      clearInterval(lapTimerInterval);
      lapTimerInterval = null;
    }
  }

  // Speedometer Gauge Update
  // Max speed is 120, gauge stroke-dashoffset ranges from 630 (0%) to 180 (100%)
  function setGaugeSpeed(speed) {
    const maxSpeed = 120;
    const speedPercent = Math.min(speed / maxSpeed, 1);
    const strokeDash = 630 - (speedPercent * (630 - 180));
    
    speedFill.style.strokeDashoffset = strokeDash;
    speedGlow.style.strokeDashoffset = strokeDash;
    
    // Dynamic text counting
    gsap.to(speedNum, {
      textContent: speed,
      duration: 0.8,
      snap: { textContent: 1 },
      ease: 'power2.out'
    });
  }

  let dashboardTimeouts = [];

  function startDashboardSimulation() {
    startLapTimer();
    
    // Speed fluctuation visual simulation
    const t1 = setTimeout(() => {
      setGaugeSpeed(78);
      gForceVal.textContent = '1.8 G';
    }, 200);
    dashboardTimeouts.push(t1);
    
    if (speedFluctuationInterval) clearInterval(speedFluctuationInterval);
    speedFluctuationInterval = setInterval(() => {
      if (ScrollTrigger.isInViewport('.dashboard-visual')) {
        const randomSpeed = Math.floor(Math.random() * 20) + 65; // speed between 65 and 85
        const randomG = (Math.random() * 0.9 + 1.1).toFixed(1);
        setGaugeSpeed(randomSpeed);
        gForceVal.textContent = `${randomG} G`;
      }
    }, 3500);
  }

  function stopDashboardSimulation() {
    stopLapTimer();
    if (speedFluctuationInterval) {
      clearInterval(speedFluctuationInterval);
      speedFluctuationInterval = null;
    }
    dashboardTimeouts.forEach(t => clearTimeout(t));
    dashboardTimeouts = [];
  }

  // Dashboard Scroll Trigger Actions
  ScrollTrigger.create({
    trigger: '.dashboard-visual',
    start: 'top 75%',
    onEnter: startDashboardSimulation,
    onLeave: stopDashboardSimulation,
    onEnterBack: startDashboardSimulation,
    onLeaveBack: stopDashboardSimulation
  });

  /* ==========================================
     5. DYNAMIC BOOKING SYSTEM CONTROLLER
     ========================================== */
  const bookingDateInput = document.getElementById('bookingDate');
  const activityBtns = document.querySelectorAll('.activity-select-btn');
  const slotsGrid = document.getElementById('slotsGrid');
  const summaryActivity = document.getElementById('summaryActivity');
  const summaryDate = document.getElementById('summaryDate');
  const summaryTime = document.getElementById('summaryTime');
  const summaryRate = document.getElementById('summaryRate');
  const summaryTotal = document.getElementById('summaryTotal');
  const btnSubmitBooking = document.getElementById('btnSubmitBooking');
  const stepIndicators = document.querySelectorAll('.step-indicator');

  // Set default date as today
  const today = new Date().toISOString().split('T')[0];
  bookingDateInput.value = today;
  bookingDateInput.min = today;
  summaryDate.textContent = formatDate(today);

  let selectedActivity = 'Go Karting';
  let selectedRate = 25;
  let selectedTime = '10:00 AM';

  // Format date helper
  function formatDate(dateStr) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  }

  // Generate Slots dynamically depending on sports selection
  const bookingSlotsData = {
    'Go Karting': [
      { time: '09:00 AM', status: 'available' },
      { time: '10:30 AM', status: 'available' },
      { time: '12:00 PM', status: 'booked' },
      { time: '01:30 PM', status: 'available' },
      { time: '03:00 PM', status: 'available' },
      { time: '04:30 PM', status: 'booked' },
      { time: '06:00 PM', status: 'available' },
      { time: '07:30 PM', status: 'available' },
      { time: '09:00 PM', status: 'available' }
    ],
    'Cricket Turf': [
      { time: '06:00 AM - 07:00 AM', status: 'available' },
      { time: '07:00 AM - 08:00 AM', status: 'available' },
      { time: '04:00 PM - 05:00 PM', status: 'booked' },
      { time: '05:00 PM - 06:00 PM', status: 'available' },
      { time: '06:00 PM - 07:00 PM', status: 'available' },
      { time: '07:00 PM - 08:00 PM', status: 'booked' },
      { time: '08:00 PM - 09:00 PM', status: 'available' },
      { time: '09:00 PM - 10:00 PM', status: 'available' }
    ],
    'Café Lounge': [
      { time: '11:00 AM', status: 'available' },
      { time: '12:30 PM', status: 'available' },
      { time: '02:00 PM', status: 'available' },
      { time: '03:30 PM', status: 'available' },
      { time: '05:00 PM', status: 'available' },
      { time: '06:30 PM', status: 'available' },
      { time: '08:00 PM', status: 'available' },
      { time: '09:30 PM', status: 'available' }
    ]
  };

  function renderSlots(activity) {
    slotsGrid.innerHTML = '';
    const slots = bookingSlotsData[activity] || [];
    
    slots.forEach((slot, index) => {
      const chip = document.createElement('div');
      chip.className = `slot-chip ${slot.status === 'booked' ? 'disabled' : ''}`;
      if (index === 0 && slot.status === 'available') {
        chip.classList.add('selected');
        selectedTime = slot.time;
        summaryTime.textContent = selectedTime;
        updateIndicatorsStep(2);
      }
      chip.textContent = slot.time.split(' - ')[0]; // short display
      chip.title = slot.time;
      chip.setAttribute('data-time', slot.time);
      
      if (slot.status === 'available') {
        chip.addEventListener('click', () => {
          document.querySelectorAll('.slot-chip').forEach(c => c.classList.remove('selected'));
          chip.classList.add('selected');
          selectedTime = slot.time;
          summaryTime.textContent = selectedTime;
          updateIndicatorsStep(2);
        });
      }
      slotsGrid.appendChild(chip);
    });
  }

  // Handle activity selection clicks
  activityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      activityBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      
      selectedActivity = btn.getAttribute('data-activity');
      selectedRate = parseInt(btn.getAttribute('data-price'));
      
      // Update Summary Receipt
      summaryActivity.textContent = selectedActivity;
      
      if (selectedActivity === 'Café Lounge') {
        summaryRate.textContent = 'Table Reservation';
        summaryTotal.textContent = 'FREE';
      } else {
        summaryRate.textContent = `$${selectedRate} / ${selectedActivity === 'Go Karting' ? '10 Mins' : 'Hour'}`;
        summaryTotal.textContent = `$${selectedRate.toFixed(2)}`;
      }
      
      renderSlots(selectedActivity);
      updateIndicatorsStep(1);
    });
  });

  // Date picker modification
  bookingDateInput.addEventListener('change', (e) => {
    const selectedD = e.target.value;
    if (selectedD) {
      summaryDate.textContent = formatDate(selectedD);
      updateIndicatorsStep(2);
    }
  });

  // Helper tracking step state
  function updateIndicatorsStep(step) {
    stepIndicators.forEach((ind, index) => {
      if (index < step) {
        ind.classList.add('active');
      } else {
        ind.classList.remove('active');
      }
    });
  }

  // Form input interactions trigger step 3 completion indicator
  const inputName = document.getElementById('bookingName');
  const inputPhone = document.getElementById('bookingPhone');

  function checkFormInputs() {
    if (inputName.value.trim() !== '' && inputPhone.value.trim() !== '') {
      updateIndicatorsStep(3);
    } else {
      updateIndicatorsStep(2);
    }
  }
  inputName.addEventListener('input', checkFormInputs);
  inputPhone.addEventListener('input', checkFormInputs);

  // Initialize Slots
  renderSlots('Go Karting');

  // Submit Booking handler
  btnSubmitBooking.addEventListener('click', (e) => {
    e.preventDefault();
    if (!inputName.value.trim() || !inputPhone.value.trim()) {
      alert('Please fill in your Name and Phone Number to complete the session booking.');
      return;
    }
    
    // Animate Success confirmation
    gsap.timeline()
      .to('.booking-panel', { opacity: 0.3, duration: 0.3 })
      .call(() => {
        alert(`RACE SECURED! 🏁\n\nHi ${inputName.value}, your booking for ${selectedActivity} on ${summaryDate.textContent} at ${selectedTime} is confirmed.\n\nA coordinate dispatch confirmation was sent to ${inputPhone.value}. See you on the track!`);
        // Reset
        inputName.value = '';
        inputPhone.value = '';
        updateIndicatorsStep(1);
      })
      .to('.booking-panel', { opacity: 1, duration: 0.3 });
  });


  /* ==========================================
     6. MASONRY GALLERY & LIGHTBOX PREVIEW
     ========================================== */
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('galleryLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeLightbox = document.getElementById('closeLightbox');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const src = item.getAttribute('data-src');
      lightboxImg.src = src;
      lightbox.classList.add('active');
      gsap.fromTo('.lightbox-content', { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.2)' });
    });
  });

  closeLightbox.addEventListener('click', () => {
    gsap.to('.lightbox-content', {
      scale: 0.8,
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        lightbox.classList.remove('active');
      }
    });
  });

  // Close on outside overlay click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox.click();
    }
  });


  /* ==========================================
     7. PREMIUM CAROUSEL TESTIMONIALS SLIDER
     ========================================== */
  const track = document.getElementById('carouselTrack');
  const slides = document.querySelectorAll('.carousel-slide');
  const btnPrev = document.getElementById('carouselPrev');
  const btnNext = document.getElementById('carouselNext');
  const dotsContainer = document.getElementById('carouselDots');
  
  let currentSlideIndex = 0;
  const totalSlides = slides.length;

  // Generate Navigation Dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
    dot.setAttribute('aria-label', `Navigate to testimonial slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll('.carousel-dot');

  function updateCarouselState() {
    track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    
    dots.forEach((d, idx) => {
      d.classList.toggle('active', idx === currentSlideIndex);
    });
  }

  function goToSlide(index) {
    currentSlideIndex = (index + totalSlides) % totalSlides;
    updateCarouselState();
  }

  btnNext.addEventListener('click', () => goToSlide(currentSlideIndex + 1));
  btnPrev.addEventListener('click', () => goToSlide(currentSlideIndex - 1));

  // Auto loop interval
  let autoSlideTimer = setInterval(() => {
    goToSlide(currentSlideIndex + 1);
  }, 7000);

  // Stop auto slide on hover or interaction
  const container = document.querySelector('.carousel-container');
  container.addEventListener('mouseenter', () => clearInterval(autoSlideTimer));
  container.addEventListener('mouseleave', () => {
    clearInterval(autoSlideTimer);
    autoSlideTimer = setInterval(() => {
      goToSlide(currentSlideIndex + 1);
    }, 7000);
  });


  /* ==========================================
     8. GLOBAL GSAP SCROLL TRIGGERS & EFFECTS
     ========================================== */
  // Nav items reveal
  gsap.from('.logo', { y: -50, opacity: 0, duration: 0.8, ease: 'power2.out' });
  gsap.from('.nav-item', { y: -50, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out' });
  gsap.from('.nav-cta', { y: -50, opacity: 0, duration: 0.8, ease: 'power2.out' });

  // Hero Section animated elements
  gsap.from('.hero-tagline', { scale: 0.8, opacity: 0, duration: 0.8, delay: 0.3, ease: 'back.out(1.5)' });
  gsap.from('.hero-title span', { y: 100, opacity: 0, duration: 1, delay: 0.5, ease: 'power4.out' });
  gsap.from('.hero-subtitle', { y: 30, opacity: 0, duration: 1, delay: 0.8, ease: 'power3.out' });
  gsap.from('.hero-ctas .btn', { y: 30, opacity: 0, duration: 1, stagger: 0.1, delay: 1, ease: 'power3.out' });
  gsap.from('.hero-scroll-indicator', { opacity: 0, duration: 1, delay: 1.5 });

  // Fade Reveal animation utility for general layout headers
  const sectionHeaders = document.querySelectorAll('.section-header');
  sectionHeaders.forEach(hdr => {
    gsap.from(hdr.querySelectorAll('.section-subtitle, .section-title, .section-desc'), {
      y: 40,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: hdr,
        start: 'top 85%'
      }
    });
  });

  // Services Grid Cards reveal
  gsap.from('.service-card', {
    y: 80,
    opacity: 0,
    duration: 1.2,
    stagger: 0.2,
    ease: 'power4.out',
    scrollTrigger: {
      trigger: '.services-grid',
      start: 'top 80%'
    }
  });

  // Dashboard Dial visual slide-in
  gsap.from('.dashboard-visual', {
    x: -80,
    opacity: 0,
    duration: 1.2,
    ease: 'power4.out',
    scrollTrigger: {
      trigger: '.karting-grid',
      start: 'top 80%'
    }
  });

  // Turf and Café visual panel slide-in
  gsap.from('.turf-visual-wrapper', {
    x: 80,
    opacity: 0,
    duration: 1.2,
    ease: 'power4.out',
    scrollTrigger: {
      trigger: '.turf-grid',
      start: 'top 80%'
    }
  });

  gsap.from('.cafe-menu-grid', {
    y: 60,
    opacity: 0,
    duration: 1.2,
    ease: 'power4.out',
    scrollTrigger: {
      trigger: '.cafe-grid',
      start: 'top 80%'
    }
  });

  // Pricing cards slide-up reveal
  gsap.from('.pricing-card', {
    y: 80,
    opacity: 0,
    duration: 1.2,
    stagger: 0.2,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.pricing-grid',
      start: 'top 80%'
    }
  });

  // Gallery items trigger animations
  gsap.from('.gallery-item', {
    scale: 0.9,
    opacity: 0,
    duration: 1,
    stagger: 0.08,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '.gallery-grid',
      start: 'top 85%'
    }
  });

});
