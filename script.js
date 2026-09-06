/* ============================================================
   STARFIELD
   ============================================================ */
(function () {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let W, H, stars = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function makeStar() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.6,
      a: Math.random() * 0.6 + 0.2,
      spd: Math.random() * 0.07 + 0.008,
      tw: Math.random() * Math.PI * 2,
    };
  }

  function drawLines() {
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 85) {
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.strokeStyle = `rgba(79,255,207,${(1 - d / 85) * 0.055})`;
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    requestAnimationFrame(loop);
    ctx.clearRect(0, 0, W, H);
    drawLines();
    stars.forEach(s => {
      s.tw += 0.018;
      const a = s.a * (0.65 + 0.35 * Math.sin(s.tw));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,200,230,${a})`;
      ctx.fill();
      s.y -= s.spd;
      if (s.y < -2) { s.y = H + 2; s.x = Math.random() * W; }
    });
  }

  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < 300; i++) stars.push(makeStar());
  loop();
})();

/* ============================================================
   LIVE CLOCK (Colombo time)
   ============================================================ */
function tickClock() {
  const now = new Date();
  const cmb = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }));
  const pad = n => String(n).padStart(2, '0');
  const el = document.getElementById('clk');
  if (el) el.textContent = `${pad(cmb.getHours())}:${pad(cmb.getMinutes())}:${pad(cmb.getSeconds())}`;
}
tickClock();
setInterval(tickClock, 1000);

/* ============================================================
   ACTIVE NAV LINK ON SCROLL
   ============================================================ */
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const sections = document.querySelectorAll('section[id], div[id]');

const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => navObserver.observe(s));

/* ============================================================
   SCROLL REVEAL
   ============================================================ */

// Generic elements — class-based so CSS hover transforms aren't overridden by inline styles
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); });
}, { threshold: 0.07 });

document.querySelectorAll('.si, .contact-row, .stack-row').forEach(el => {
  el.classList.add('reveal-el');
  revealObserver.observe(el);
});

// Project cards — staggered bounce-in on scroll into view
const cardObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('card-revealed'); });
}, { threshold: 0.08 });

document.querySelectorAll('.proj-card').forEach((el, i) => {
  el.style.transitionDelay = `${i * 60}ms`;
  cardObserver.observe(el);
});

// Education entries — slide in from sides as you scroll
const eduObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('edu-revealed'); });
}, { threshold: 0.15 });

document.querySelectorAll('.edu-entry').forEach((el, i) => {
  el.style.transitionDelay = `${i * 120}ms`;
  eduObserver.observe(el);
});

// Timeline line — grows downward as section enters view
const timelineObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('timeline-active'); });
}, { threshold: 0.05 });

const timeline = document.querySelector('.edu-timeline');
if (timeline) timelineObserver.observe(timeline);

/* ============================================================
   PROJECT CAROUSEL
   ============================================================ */
(function () {
  const carousel   = document.getElementById('projCarousel');
  const dotsWrap   = document.getElementById('projDots');
  const prevBtn    = document.getElementById('projPrev');
  const nextBtn    = document.getElementById('projNext');
  if (!carousel) return;

  const cards      = Array.from(carousel.querySelectorAll('.proj-card'));
  const total      = cards.length;
  // Show 3 at a time on desktop, 1 on mobile
  let perPage      = window.innerWidth < 900 ? 1 : 3;
  let current      = 0; // index of the leftmost visible card

  function maxIndex() { return Math.max(0, total - perPage); }

  // Build dots — one per "page"
  function buildDots() {
    dotsWrap.innerHTML = '';
    const pages = maxIndex() + 1;
    for (let i = 0; i < pages; i++) {
      const d = document.createElement('button');
      d.className = 'proj-dot' + (i === current ? ' active' : '');
      d.setAttribute('aria-label', `Go to slide ${i + 1}`);
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    }
  }

  function updateDots() {
    dotsWrap.querySelectorAll('.proj-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function getCardWidth() {
    // Width of one card + gap (1.25rem = 20px)
    return cards[0].getBoundingClientRect().width + 20;
  }

  function goTo(index) {
    current = Math.max(0, Math.min(index, maxIndex()));
    carousel.style.transform = `translateX(-${current * getCardWidth()}px)`;
    updateDots();
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === maxIndex();
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // Touch / drag swipe
  let startX = 0, dragging = false;
  carousel.addEventListener('pointerdown', e => { startX = e.clientX; dragging = true; });
  carousel.addEventListener('pointermove', e => { if (!dragging) return; });
  carousel.addEventListener('pointerup', e => {
    if (!dragging) return;
    dragging = false;
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
  });

  // Responsive resize
  window.addEventListener('resize', () => {
    const newPer = window.innerWidth < 900 ? 1 : 3;
    if (newPer !== perPage) {
      perPage = newPer;
      current = 0;
      buildDots();
    }
    goTo(current);
  });

  buildDots();
  goTo(0);
})();


document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
/* ============================================================
   CASE STUDY MODAL
   ============================================================ */
(function () {
  const overlay = document.getElementById('caseStudyOverlay');
  const close   = document.getElementById('caseStudyClose');
  const title = document.getElementById('caseStudyTitle');
  const role = document.getElementById('caseStudyRole');
  const tools = document.getElementById('caseStudyTools');
  const type = document.getElementById('caseStudyType');
  const problem = document.getElementById('caseStudyProblem');
  const process = document.getElementById('caseStudyProcess');
  const result = document.getElementById('caseStudyResult');
  const outcomes = document.getElementById('caseStudyOutcomes');
  if (!overlay || !close) return;

  const caseStudies = {
    "fake-news": {
      title: "Fake News Detection System",
      role: "Designer & Developer",
      tools: "Python, Pandas, NumPy, Scikit-learn, Django, Bootstrap",
      type: "Final Year Project",
      problem: "The rapid spread of misinformation online creates a need for an accessible tool that can classify news content using modern NLP and machine learning techniques.",
      process: "Built an end-to-end pipeline covering data collection, cleaning, preprocessing, NLP tokenization, TF-IDF feature extraction, Logistic Regression training, evaluation, and prediction. Integrated the model into a Django web application.",
      result: "Delivered a modular news-classification pipeline and a Django application that provides real-time classification results and user-facing insights.",
      outcomes: ["End-to-end ML pipeline from preprocessing to prediction", "TF-IDF vectorization and NLP tokenization", "Logistic Regression classifier evaluated against real-world datasets", "Modular pipeline designed for maintainability", "Live Django web application with real-time classification", "Validation and debugging throughout the pipeline"]
    },
    "ecommerce": {
      title: "Cosmic Beauty E-Commerce Platform",
      role: "Full-Stack Developer",
      tools: "React, Node.js, Express.js, MongoDB, JWT, Bootstrap",
      type: "Full-Stack Web Development Project",
      problem: "Small online cosmetic businesses often rely on social media or manual ordering processes that lack inventory management, secure authentication, and streamlined purchasing workflows.",
      process: "Developed the frontend and backend using the MERN stack. Designed MongoDB collections for products, users, and orders, then built RESTful APIs for authentication, product management, cart operations, and checkout. Implemented JWT authentication and reusable React components.",
      result: "Produced a complete online shopping platform where users can register, browse products, manage their cart, and place orders through a secure authenticated workflow.",
      outcomes: ["Full MERN stack architecture with React frontend and Express backend", "JWT-based authentication and protected routes", "MongoDB schema design for products, customers, and orders", "RESTful APIs supporting CRUD operations and shopping workflows", "Responsive product catalog and shopping cart experience", "Modular frontend components and backend routing structure"]
    },
    "bus-reservation": {
      title: "Routis Online Bus Reservation System",
      role: "Full-Stack Developer",
      tools: "React, TypeScript, Node.js, Express.js, SQLite, JWT, Bcrypt",
      type: "Full-Stack Software Engineering Project",
      problem: "Traditional bus reservation systems often require manual booking processes and provide limited visibility into available routes and seat availability.",
      process: "Designed an Express.js backend with SQLite for persistent reservation storage. Implemented JWT authentication and bcrypt password hashing, developed REST APIs, and built a responsive React and TypeScript frontend. Applied sorting, stacks, queues, and graph-based route recommendation.",
      result: "Delivered a reservation platform where authenticated users can browse routes, reserve seats, and manage bookings through a responsive interface backed by secure persistent storage.",
      outcomes: ["Full-stack reservation system using React, Node.js, and SQLite", "Secure authentication using JWT and bcrypt", "RESTful APIs for reservations, routes, and user management", "Graph-based route recommendation algorithms", "Responsive booking interface built with TypeScript", "Persistent reservation management using SQLite"]
    },
    "production": {
      title: "Quiet Attic Films Production Management System",
      role: "Software Developer",
      tools: "C#, .NET Framework (Windows Forms), SQL Server",
      type: "Desktop Database Management System",
      problem: "Film production teams often manage cast, crew, schedules, and production records manually, making it difficult to track operational information consistently.",
      process: "Designed a layered Windows Forms application connected to SQL Server. Built CRUD functionality for production information using object-oriented design to separate presentation, business logic, and database access. Designed relational tables and SQL queries for operational records.",
      result: "Developed a desktop management application that centralizes production information, simplifies administration, and improves the accuracy of production records through SQL Server integration.",
      outcomes: ["Windows Forms desktop application with SQL Server integration", "CRUD functionality across multiple production entities", "Relational database design and SQL query implementation", "Layered application architecture using OOP principles", "Centralized data management for operational workflows", "Improved reporting and record organization"]
    },
    "healthmate": {
      title: "HealthMate Health Tracking Mobile App",
      role: "Mobile Application Developer",
      tools: "Flutter, Dart, SQLite (SQFLite)",
      type: "Cross-Platform Mobile Development Project",
      problem: "Many personal health tracking applications depend on internet connectivity or store information across disconnected tools. The goal was to provide lightweight local health tracking.",
      process: "Developed a Flutter application with SQLite local persistence using SQFLite. Designed screens for recording and viewing health information, implemented offline CRUD operations, and managed application state for smooth navigation and interaction.",
      result: "Delivered a cross-platform mobile application that lets users record, update, and monitor personal health information entirely offline through a clean Flutter interface.",
      outcomes: ["Cross-platform Flutter application for Android devices", "Local offline storage using SQLite and SQFLite", "CRUD operations for health record management", "Responsive mobile interface and navigation flow", "Efficient local persistence without internet dependency", "Modular Flutter codebase for maintainability"]
    },
    "payroll": {
      title: "Payroll Management System",
      role: "Desktop Application Developer",
      tools: "C#, .NET Framework 4.7.2, Windows Forms, SQL Server LocalDB",
      type: "Desktop Payroll Management System",
      problem: "Payroll processing involves employee records, salary calculations, deductions, and reporting, which becomes inefficient when handled manually.",
      process: "Developed a Windows Forms application connected to SQL Server LocalDB. Implemented payroll calculations, employee CRUD functionality, salary validation, deductions, allowances, and automated reporting using maintainable OOP and .NET practices.",
      result: "Delivered a payroll management application that automates salary calculations, securely stores payroll records, and generates reports through an integrated desktop interface.",
      outcomes: ["Payroll automation using C# and .NET Framework", "Employee record management with SQL Server LocalDB", "Salary calculation, deductions, and allowance processing", "CRUD operations with secure database connectivity", "Data validation to improve payroll accuracy", "Automated payroll reporting and maintainable OOP architecture"]
    },
    "sales": {
      title: "Sales Analysis System",
      role: "Python Software Developer",
      tools: "Python, unittest, SOLID Principles",
      type: "Command-Line Business Analytics Application",
      problem: "Manual sales report generation is repetitive and prone to errors, making it harder for retail businesses to evaluate monthly performance and identify trends.",
      process: "Designed modular business logic around SOLID principles. Built data-processing modules to analyze monthly sales records and generate summarized reports, then added automated unit tests with Python unittest.",
      result: "Delivered a command-line sales analytics application that processes datasets, calculates business metrics, and generates structured reports with validated logic.",
      outcomes: ["Python application applying SOLID design principles", "Automated sales data processing and report generation", "Modular architecture for maintainability and scalability", "Unit testing using Python unittest", "Debugging and validation of business calculations", "Reliable reporting through reusable components"]
    },
    "eco-ride": {
      title: "EcoRide Car Rental System",
      role: "Java Software Developer",
      tools: "Java, Object-Oriented Programming (OOP)",
      type: "Console-Based Java Application",
      problem: "Small vehicle rental businesses often manage reservations and fleet information manually, making it difficult to track availability, customer bookings, and rental transactions.",
      process: "Designed a modular Java application using encapsulation, inheritance, polymorphism, and abstraction. Created classes for customers, vehicles, reservations, and rental operations, with input validation and business rules for availability.",
      result: "Delivered a console-based rental management system capable of handling customer registration, vehicle reservations, rental transactions, and fleet management.",
      outcomes: ["Object-oriented Java application with modular class design", "Customer, vehicle, and reservation management workflows", "Encapsulation, inheritance, polymorphism, and abstraction", "Rental availability and booking validation logic", "Input validation for consistent data", "Reusable architecture for future expansion"]
    },
    "library": {
      title: "Smart Library Management System",
      role: "Java Software Developer",
      tools: "Java, Object-Oriented Programming (OOP)",
      type: "Console-Based Library Management System",
      problem: "Library operations such as cataloguing books, managing members, and tracking borrowing records are time-consuming when handled manually.",
      process: "Designed a modular Java application using object-oriented programming. Developed modules for book cataloguing, member registration, borrowing, returning, and record management, with validation to prevent invalid transactions.",
      result: "Built a console-based library management application that organizes book inventories, member records, and borrowing workflows through reusable object-oriented design.",
      outcomes: ["Modular Java application following OOP design principles", "Book catalogue and inventory management", "Member registration and borrowing/return workflows", "Borrowing validation and record tracking", "Maintainable architecture with reusable classes", "Organized library record management"]
    }
  };

  function renderCaseStudy(key) {
    const study = caseStudies[key];
    if (!study) return;
    title.textContent = study.title;
    role.textContent = study.role;
    tools.textContent = study.tools;
    type.textContent = study.type;
    problem.textContent = study.problem;
    process.textContent = study.process;
    result.textContent = study.result;
    outcomes.replaceChildren(...study.outcomes.map(outcome => {
      const item = document.createElement('li');
      item.textContent = outcome;
      return item;
    }));
  }

  function openModal() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.case-study-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      renderCaseStudy(btn.dataset.caseStudy);
      openModal();
    });
  });
  close.addEventListener('click', closeModal);

  // Click outside modal to close
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });

  // Escape key to close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
})();