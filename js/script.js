/**
 * Anzhelika Korobeynyk - Campaign Website
 * Main JavaScript file
 */

// Document Ready function
document.addEventListener('DOMContentLoaded', function() {
    "use strict";

    // Initialize AOS (Animate on Scroll)
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: false,
        mirror: false,
        offset: 80
    });

    // Initialize Bootstrap components
    initBootstrap();

    // Initialize GSAP animations
    initGSAP();

    // Initialize scroll functions
    initScrollFunctions();

    // Handle protected content
    initProtectedContent();

    // Handle preloader
    handlePreloader();
});

/**
 * Initialize Bootstrap components
 */
function initBootstrap() {
    // Navbar scroll behavior
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        });
    }

    // Custom implementation of scroll spy instead of relying on Bootstrap's
    initCustomScrollSpy();

    // Properly handle navbar collapse on mobile
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    if (navbarToggler && navbarCollapse) {
        // Close navbar when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInside = navbarToggler.contains(event.target) ||
                                  navbarCollapse.contains(event.target);

            if (!isClickInside && navbarCollapse.classList.contains('show')) {
                navbarToggler.click();
            }
        });

        // Ensure navbar collapse has proper height on mobile
        const updateNavHeight = () => {
            if (window.innerWidth < 992 && navbarCollapse.classList.contains('show')) {
                const navHeight = navbarCollapse.scrollHeight;
                navbarCollapse.style.maxHeight = navHeight + 'px';
            } else {
                navbarCollapse.style.maxHeight = '';
            }
        };

        navbarToggler.addEventListener('click', function() {
            setTimeout(updateNavHeight, 10);
        });

        window.addEventListener('resize', updateNavHeight);
    }
}

/**
 * Custom implementation of scroll spy functionality
 */
function initCustomScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    function highlightNavLink() {
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const scrollPosition = window.scrollY + navHeight + 50;

        // Find the current section
        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionBottom = sectionTop + sectionHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                currentSection = section.getAttribute('id');
            }
        });

        // Handle case where we're at the top of the page
        if (window.scrollY < 100 && sections.length > 0) {
            currentSection = sections[0].getAttribute('id');
        }

        // Remove active class from all links
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to current section link
        if (currentSection) {
            const activeLink = document.querySelector(`.nav-link[href="#${currentSection}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    }

    // Initial check on page load - needs small delay to ensure correct positioning
    setTimeout(highlightNavLink, 300);

    // Check on scroll
    window.addEventListener('scroll', highlightNavLink);

    // Check on window resize
    window.addEventListener('resize', function() {
        // Small delay to ensure correct positioning after resize
        setTimeout(highlightNavLink, 100);
    });
}

/**
 * Initialize GSAP animations
 */
function initGSAP() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Background parallax effect
        gsap.to('.page-background', {
            backgroundPosition: `50% ${window.innerHeight/2}px`,
            ease: "none",
            scrollTrigger: {
                trigger: 'body',
                start: "top top",
                end: "bottom bottom",
                scrub: true
            }
        });

        // Card hover effects
        gsap.utils.toArray('.policy-card').forEach(card => {
            gsap.to(card, {
                y: -10,
                duration: 2,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
                paused: true
            }).progress(Math.random());
        });

        // Animate timeline items
        gsap.utils.toArray('.timeline-item').forEach((item, i) => {
            ScrollTrigger.create({
                trigger: item,
                start: "top bottom-=100",
                onEnter: () => {
                    gsap.to(item, {
                        opacity: 1,
                        x: 0,
                        duration: 0.8,
                        ease: "power2.out"
                    });
                },
                once: true
            });
        });

        // Glow effect on primary buttons
        gsap.to('.btn-primary', {
            boxShadow: "0 0 15px rgba(0, 61, 165, 0.6)",
            duration: 1.5,
            repeat: -1,
            yoyo: true
        });
    }
}

/**
 * Initialize scroll functions
 */
function initScrollFunctions() {
    // Scroll to top button
    const scrollTopBtn = document.getElementById('scrollToTop');

    if (scrollTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add('active');
            } else {
                scrollTopBtn.classList.remove('active');
            }
        });

        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            // Close mobile menu if open
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                navbarCollapse.classList.remove('show');
            }

            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const headerHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;

                window.scrollTo({
                    top: targetPosition - headerHeight,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Handle page preloader
 */
function handlePreloader() {
    const preloader = document.querySelector('.preloader');

    if (preloader) {
        window.addEventListener('load', function() {
            // Add fade out class
            preloader.classList.add('fade-out');

            // Remove from DOM after animation completes
            setTimeout(function() {
                preloader.style.display = 'none';
                animateHeroSection();
            }, 600);
        });
    }
}

/**
 * Animate hero section elements
 */
function animateHeroSection() {
    if (typeof gsap !== 'undefined') {
        // Create hero animation timeline
        const heroTl = gsap.timeline();

        heroTl
            // First animate the badge (now behind the text)
            .fromTo('.badge-kokoomus',
                { opacity: 0, scale: 0, rotation: 45 },
                { opacity: 1, scale: 1, rotation: 15, duration: 0.7, ease: "back.out(1.7)" }
            )
            // Then animate the name on top of it
            .fromTo('.hero-content h1',
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.8 }
            )
            .fromTo('.hero-content h2',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.7 },
                "-=0.4"
            )
            .fromTo('.hero-content .intro',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.7 },
                "-=0.4"
            )
            .fromTo('.cta-buttons',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.7 },
                "-=0.4"
            )
            .fromTo('.scroll-indicator',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.7 },
                "-=0.2"
            );
    }
}

/**
 * Initialize protected content (email/phone)
 */
function initProtectedContent() {
    // Email protection using character manipulation to prevent simple scraping
    const protectedEmail = document.querySelector('.protected-email');
    if (protectedEmail) {
        // Email components stored separately to prevent easy scraping
        const emailUser = 'angellmoon1992';
        const emailDomain = 'gmail.com';

        // Set the text content as normal for users with JavaScript
        protectedEmail.textContent = emailUser + '@' + emailDomain;

        // Create a proper mailto link when clicked
        protectedEmail.addEventListener('click', function() {
            window.location.href = 'mailto:' + emailUser + '@' + emailDomain;
        });

        // Add a tooltip to indicate it's clickable
        protectedEmail.title = 'Click to send an email';
    }

    // Phone protection using similar technique
    const protectedPhone = document.querySelector('.protected-phone');
    if (protectedPhone) {
        // Phone components stored separately
        const phonePrefix = '044';
        const phoneSuffix = '3219126';

        // Set the text content by combining components
        protectedPhone.textContent = phonePrefix + phoneSuffix;

        // Create proper tel link when clicked
        protectedPhone.addEventListener('click', function() {
            window.location.href = 'tel:' + phonePrefix + phoneSuffix;
        });

        // Add a tooltip to indicate it's clickable
        protectedPhone.title = 'Click to call';
    }
}