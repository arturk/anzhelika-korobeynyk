/**
 * Anzhelika Korobeynyk - Campaign Website
 * Main JavaScript file
 */

// Add this at the top level of the script - a registry to track elements being dissolved
// This allows us to ensure every element can be properly restored
let dissolvingElements = new Map();

// Document Ready function
document.addEventListener('DOMContentLoaded', function() {
    "use strict";

    // Initialize hero elements immediately
    if (typeof gsap !== 'undefined') {
        // Initialize and prepare hero elements - ensure they're visible but ready for animation
        initHeroElements();

        // Initialize background
        const heroBackground = document.querySelector('.hero-background');
        if (heroBackground) {
            heroBackground.classList.add('loaded');
            animateHeroBackground();
        }
    }

    // Initialize AOS (Animate on Scroll) with optimized settings
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: false,
            mirror: true, // Enable animations when scrolling up too
            offset: 80,
            disable: 'mobile', // Disable on mobile devices for better performance
            anchorPlacement: 'top-bottom',
            disableMutationObserver: false, // Keep mutation observer enabled for dynamic content
        });

        // Handle AOS refreshing on window resize
        window.addEventListener('resize', function() {
            AOS.refresh();
        });

        // Refresh AOS after a short delay to ensure all elements are properly initialized
        setTimeout(function() {
            AOS.refresh();
        }, 500);
    }

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
 * Initialize hero elements with modern animation setup
 */
function initHeroElements() {
    // Get all hero text elements
    const h1 = document.querySelector('.hero-content h1');
    const h2 = document.querySelector('.hero-content h2');
    const intro = document.querySelector('.hero-content .intro');
    const buttons = document.querySelector('.cta-buttons');
    const badge = document.querySelector('.badge-kokoomus');
    const scrollIndicator = document.querySelector('.scroll-indicator');

    if (!h1 || !h2 || !intro || !buttons) return;

    // Set all elements to invisible initially to prevent flashing
    gsap.set([h1, h2, intro, buttons], {
        opacity: 0,
        y: 0, // Ensure they're in the correct position
        scale: 1 // Ensure they're at the correct scale
    });

    // Set initial state for badge and scroll indicator
    gsap.set(badge, {
        opacity: 0,
        scale: 0.5,
        rotation: 45
    });

    gsap.set(scrollIndicator, {
        opacity: 0,
        y: 20
    });
}

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

        // Add dissolve effects for elements leaving viewport
        addDissolveEffects();
    }
}

/**
 * Animate the hero background with smooth zoom and pan effects
 */
function animateHeroBackground() {
    const heroBackground = document.querySelector('.hero-background');

    if (!heroBackground) return;

    // Create color overlay for subtle color transitions
    const colorOverlay = document.createElement('div');
    colorOverlay.className = 'color-overlay';
    heroBackground.parentNode.appendChild(colorOverlay);

    // Initial color state
    gsap.set(colorOverlay, {
        opacity: 0
    });

    // Animate color overlay with subtle shifts over time
    const colorTimeline = gsap.timeline({repeat: -1, repeatDelay: 2});

    // Warm golden hue
    colorTimeline.to(colorOverlay, {
        backgroundColor: 'rgba(255, 209, 0, 0.1)',
        opacity: 0.15,
        duration: 8,
        ease: "sine.inOut"
    });

    // Shift to cool blue hue
    colorTimeline.to(colorOverlay, {
        backgroundColor: 'rgba(0, 61, 165, 0.1)',
        opacity: 0.15,
        duration: 8,
        ease: "sine.inOut"
    });

    // Fade out before repeating
    colorTimeline.to(colorOverlay, {
        opacity: 0,
        duration: 4,
        ease: "power1.out"
    });

    // Create light rays element for dramatic effect
    const raysContainer = document.createElement('div');
    raysContainer.className = 'light-rays-container';
    heroBackground.parentNode.appendChild(raysContainer);

    // Create 5 light rays with different positions
    for (let i = 0; i < 5; i++) {
        const ray = document.createElement('div');
        ray.className = 'light-ray';
        raysContainer.appendChild(ray);

        // Set random positions and angles for rays
        gsap.set(ray, {
            rotation: 30 + (i * 25) + (Math.random() * 15),
            width: 50 + (Math.random() * 100) + '%',
            opacity: 0.05 + (Math.random() * 0.1),
            top: -200 + (Math.random() * 500) + 'px',
            left: -300 + (Math.random() * 1000) + 'px',
        });
    }

    // Create particles container for depth effect
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    heroBackground.parentNode.appendChild(particlesContainer);

    // Create 30 particles with different characteristics
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particlesContainer.appendChild(particle);

        // Set random sizes and starting positions
        const size = 2 + (Math.random() * 4);
        gsap.set(particle, {
            width: size + 'px',
            height: size + 'px',
            opacity: 0.2 + (Math.random() * 0.6),
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            backgroundColor: Math.random() > 0.5 ? 'rgba(255,255,255,0.6)' : 'rgba(255,209,0,0.6)'
        });

        // Animate each particle with random parameters
        gsap.to(particle, {
            left: '+=' + (Math.random() * 40 - 20) + '%',
            top: '+=' + (Math.random() * 40 - 20) + '%',
            opacity: 0.1 + (Math.random() * 0.5),
            duration: 15 + (Math.random() * 20),
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true
        });
    }

    // Create a new image to check when it's fully loaded
    const img = new Image();
    img.src = window.getComputedStyle(heroBackground).backgroundImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2');

    // Wait for the image to load
    img.onload = function() {
        // Start with a more dramatic initial zoom state
        gsap.set(heroBackground, { scale: 1.1, opacity: 0 });

        // Create a more dramatic fade in
        gsap.to(heroBackground, {
            opacity: 1,
            duration: 2.0, // Longer fade in for more impact
            ease: "power2.out", // More dramatic easing
            onComplete: function() {
                // Only add the loaded class after the initial animation
                heroBackground.classList.add('loaded');

                // Animate the light rays
                animateLightRays();
            }
        });

        // Start the animation sequence
        createRandomAnimation();
    };

    // Function to animate light rays for a dynamic effect
    function animateLightRays() {
        const rays = document.querySelectorAll('.light-ray');
        rays.forEach((ray, index) => {
            // Create timeline for each ray
            const rayTimeline = gsap.timeline({repeat: -1, repeatDelay: 3 + (Math.random() * 5)});

            // Fade in
            rayTimeline.to(ray, {
                opacity: 0.15 + (Math.random() * 0.15),
                duration: 4 + (Math.random() * 3),
                ease: "power1.inOut"
            });

            // Move across background
            rayTimeline.to(ray, {
                x: 200 + (Math.random() * 400),
                duration: 15 + (Math.random() * 10),
                ease: "none"
            }, "<");

            // Fade out
            rayTimeline.to(ray, {
                opacity: 0,
                duration: 4 + (Math.random() * 3),
                ease: "power1.in"
            }, ">-5");

            // Reset position for next animation cycle
            rayTimeline.set(ray, {
                x: 0
            });
        });
    }

    // If the image fails to load or is already cached, still run the animation
    img.onerror = function() {
        heroBackground.classList.add('loaded');
        gsap.set(heroBackground, { scale: 1.1 });
        createRandomAnimation();
        animateLightRays();
    };

    if (img.complete) img.onload();

    // Set a timeout to ensure animation runs even if something goes wrong with loading
    setTimeout(function() {
        if (!heroBackground.classList.contains('loaded')) {
            heroBackground.classList.add('loaded');
            gsap.set(heroBackground, { scale: 1.1 });
            createRandomAnimation();
            animateLightRays();
        }
    }, 2000);

    // Function to create a smooth random animation with more pronounced effects
    function createRandomAnimation() {
        // Random values with increased range for more dramatic effect
        const randomScale = 1.1 + (Math.random() * 0.25); // Random scale between 1.1 and 1.35 (more zoomed)
        const randomX = (Math.random() - 0.5) * 10; // Random X movement between -5% and 5% (doubled)
        const randomY = (Math.random() - 0.5) * 10; // Random Y movement between -5% and 5% (doubled)
        const randomDuration = 12 + (Math.random() * 15); // Random duration between 12 and 27 seconds (slightly faster)

        // Create smoother, more dramatic animation to these random values
        gsap.to(heroBackground, {
            scale: randomScale,
            x: randomX,
            y: randomY,
            duration: randomDuration,
            ease: "sine.inOut",
            onComplete: createRandomAnimation // Loop by calling the function again when done
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

                // Trigger modern hero animations
                animateHeroWithModernStyle();
            }, 600);
        });
    }
}

/**
 * Create modern style animations for hero section
 * Uses a contemporary staggered reveal with subtle effects
 */
function animateHeroWithModernStyle() {
    if (typeof gsap !== 'undefined') {
        // Create a master timeline
        const masterTl = gsap.timeline();

        // Badge animation
        masterTl.to('.badge-kokoomus', {
            opacity: 1,
            scale: 1,
            rotation: 15,
            duration: 0.8,
            ease: "elastic.out(1.2, 0.5)"
        });

        // Modern text animation - create letter-by-letter reveal
        // First, split the text in the heading
        const mainHeading = document.querySelector('.hero-content h1');
        if (mainHeading && mainHeading.textContent) {
            // Make sure the container is visible first
            gsap.set(mainHeading, { opacity: 1 });

            // Split the heading text into span elements for each letter
            const headingText = mainHeading.textContent;
            mainHeading.innerHTML = '';

            // Create letter spans
            headingText.split('').forEach(letter => {
                const span = document.createElement('span');
                span.textContent = letter === ' ' ? '\u00A0' : letter; // Use non-breaking space for spaces
                span.style.display = 'inline-block'; // Allow transform on letters
                span.style.opacity = '0'; // Start hidden
                mainHeading.appendChild(span);
            });

            // Animate each letter in sequence
            gsap.to(mainHeading.children, {
                opacity: 1,
                duration: 0.03, // Very short duration per letter
                stagger: 0.035, // Short delay between letters
                ease: "none",
                onComplete: function() {
                    // Add a subtle highlight effect after all letters appear
                    gsap.to(mainHeading, {
                        textShadow: "0px 0px 10px rgba(255,255,255,0.3), 0px 0px 20px rgba(255,255,255,0.2)",
                        duration: 0.8,
                        ease: "power2.out"
                    });
                }
            });
        }

        // Subtitle fade up and in with slight delay
        masterTl.fromTo('.hero-content h2',
            {
                y: 20,
                opacity: 0
            },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: "power2.out"
            },
            "+=0.2" // Start after the main heading animation
        );

        // Intro text fade in with slight scaling
        masterTl.fromTo('.hero-content .intro',
            {
                opacity: 0,
                scale: 0.98
            },
            {
                opacity: 1,
                scale: 1,
                duration: 0.8,
                ease: "power1.out"
            },
            "-=0.6"
        );

        // Button animation - subtle scale and glow effect
        masterTl.fromTo('.cta-buttons .btn',
            {
                scale: 0.95,
                opacity: 0,
                y: 15
            },
            {
                scale: 1,
                opacity: 1,
                y: 0,
                boxShadow: "0px 5px 15px rgba(0,0,0,0.2)",
                stagger: 0.15, // Stagger each button
                duration: 0.7,
                ease: "back.out(1.7)"
            },
            "-=0.4"
        );

        // Scroll indicator fade in with bounce
        masterTl.to('.scroll-indicator', {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "back.out(1.5)"
        }, "-=0.3");
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

/**
 * Add dissolve particle effects for elements scrolling out of view
 * This creates a visual effect where elements dissolve into particles
 * when they leave the viewport at the bottom of the screen
 */
function addDissolveEffects() {
    // CHANGE: Use an opt-in approach where only elements with the 'dissolve-enabled' class
    // will receive the dissolve effect. This gives more control over which elements should dissolve.

    // First, apply the class to elements that traditionally had the effect
    document.querySelectorAll('.policy-card, .timeline-item, .info-item, .section-title:not(#about .section-title)')
        .forEach(el => {
            // Don't add the class to any elements in the About section
            if (!el.closest('#about')) {
                el.classList.add('dissolve-enabled');
            }
        });

    // Now, only select elements that explicitly have the dissolve-enabled class
    const sections = document.querySelectorAll('.dissolve-enabled');

    sections.forEach(section => {
        // Skip elements that don't exist in the DOM anymore or have no dimensions
        if (!section.getBoundingClientRect().width) return;

        // Create ScrollTrigger for leave animation
        ScrollTrigger.create({
            trigger: section,
            start: "top+=50% bottom",
            end: "bottom-=100 bottom",
            onLeaveBack: (self) => {
                // Get element position relative to the viewport
                const viewportPosition = ScrollTrigger.positionInViewport(section, "bottom");

                // Start dissolve effect when about 70% of the element has passed below the viewport
                // and we're scrolling up (negative velocity)
                if (self.getVelocity() < -5 && viewportPosition > 0.7) {
                    // Make sure the element is visible before dissolving it
                    if (window.getComputedStyle(section).opacity > 0.2) {
                        createDissolveEffect(section);
                    }
                }
            },
            onEnter: () => {
                // Only make the element visible if we're scrolling down into view
                // If the element is dissolving or already dissolved (opacity near 0), make it visible
                const opacity = parseFloat(window.getComputedStyle(section).opacity);
                if (opacity < 0.9 || section.classList.contains('dissolving')) {
                    // Force cancel any ongoing dissolve effect
                    cancelDissolveEffect(section);

                    // Set up a periodic check to make sure the element becomes visible
                    let visibilityChecks = 0;
                    const ensureVisible = () => {
                        visibilityChecks++;

                        // If element is not visible after 5 attempts (with increasing force), give up
                        if (visibilityChecks > 5) return;

                        // Check if element is actually visible
                        const opacity = parseFloat(window.getComputedStyle(section).opacity);
                        if (opacity < 0.9) {
                            // Force visibility again with increasing urgency
                            cancelDissolveEffect(section);

                            // Reset AOS manually if needed
                            if (section.hasAttribute('data-aos') && typeof AOS !== 'undefined') {
                                section.classList.remove('aos-animate');
                                AOS.refresh();
                            }

                            // Check again in a moment
                            setTimeout(ensureVisible, 100 * visibilityChecks);
                        }
                    };

                    // Start checking for visibility
                    setTimeout(ensureVisible, 50);
                }
            },
            markers: false // Set to true for debugging
        });

        // Add a second trigger that works when scrolling up at a slower pace
        ScrollTrigger.create({
            trigger: section,
            start: "center bottom+=100",
            end: "bottom-=50 bottom",
            onEnterBack: (self) => {
                // Only when part of the element is still below the viewport
                const viewportPosition = ScrollTrigger.positionInViewport(section, "bottom");

                // Only trigger if element is mostly out of view but starting to enter
                if (viewportPosition > 0.8 && viewportPosition < 1.2) {
                    // Don't animate if already dissolving
                    if (!section.classList.contains('dissolving') &&
                        window.getComputedStyle(section).opacity > 0.2) {
                        createDissolveEffect(section);
                    }
                }
            },
            onEnter: () => {
                // Only make the element visible if we're scrolling down into view
                // If the element is dissolving or already dissolved (opacity near 0), make it visible
                const opacity = parseFloat(window.getComputedStyle(section).opacity);
                if (opacity < 0.9 || section.classList.contains('dissolving')) {
                    // Use the same enhanced approach as the first trigger
                    cancelDissolveEffect(section);

                    // Use the same periodic check pattern to ensure visibility
                    let visibilityChecks = 0;
                    const ensureVisible = () => {
                        visibilityChecks++;

                        if (visibilityChecks > 5) return;

                        const opacity = parseFloat(window.getComputedStyle(section).opacity);
                        if (opacity < 0.9) {
                            cancelDissolveEffect(section);

                            if (section.hasAttribute('data-aos') && typeof AOS !== 'undefined') {
                                section.classList.remove('aos-animate');
                                AOS.refresh();
                            }

                            setTimeout(ensureVisible, 100 * visibilityChecks);
                        }
                    };

                    setTimeout(ensureVisible, 50);
                }
            },
            markers: false
        });
    });

    // Add specific dissolve effect for scroll indicator
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        // Add the dissolve-enabled class to the scroll indicator as well
        scrollIndicator.classList.add('dissolve-enabled');

        ScrollTrigger.create({
            trigger: '.hero-section',
            start: "20% top",
            end: "bottom top",
            onLeave: () => {
                // Special case for scroll indicator - dissolve when scrolling down past the hero
                createDissolveEffect(scrollIndicator);
            },
            onEnterBack: () => {
                // Make the scroll indicator reappear when scrolling back up to the hero section
                cancelDissolveEffect(scrollIndicator);

                // Force immediate visibility
                gsap.set(scrollIndicator, {
                    opacity: 1,
                    clearProps: "all"
                });
            },
            markers: false
        });
    }

    // Modify the emergency scroll handler to be more selective
    window.addEventListener('scroll', function() {
        // Throttle to avoid too many checks
        if (this._scrollThrottleTimeout) {
            clearTimeout(this._scrollThrottleTimeout);
        }

        this._scrollThrottleTimeout = setTimeout(() => {
            // For each element in our registry that's marked as dissolving
            dissolvingElements.forEach((isDissolving, element) => {
                if (!isDissolving) return; // Skip if not dissolving

                // Only make elements visible when scrolling down into view (check direction)
                // Get scroll direction (positive = down, negative = up)
                const scrollDirection = this._lastScrollPosition ? window.scrollY - this._lastScrollPosition : 0;
                this._lastScrollPosition = window.scrollY;

                // Only restore element if scrolling down and element is in viewport
                if (scrollDirection > 5 && isElementInViewport(element)) {
                    // Only make the element visible if it's currently in a dissolving state
                    if (element.classList.contains('dissolving')) {
                        cancelDissolveEffect(element);
                    }
                }
            });
        }, 200);
    });

    // Helper function to check if an element is in the viewport
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom > 0
        );
    }
}

/**
 * Helper function to cancel any in-progress dissolve animations for an element
 * This is used when scrolling back down to ensure elements reappear correctly
 * @param {HTMLElement} element - The element to cancel dissolve effect for
 */
function cancelDissolveEffect(element) {
    // Register that we want this element to be visible again - this is a fail-safe
    dissolvingElements.set(element, false);

    // Remove any flash overlay inside the element
    const flashOverlay = element.querySelector('div[style*="mixBlendMode: overlay"]');
    if (flashOverlay) {
        flashOverlay.remove();
    }

    // Find and remove any particle containers for this element
    const elementRect = element.getBoundingClientRect();
    const elementTop = elementRect.top + window.scrollY;
    const elementLeft = elementRect.left;

    // Look for particle containers that match this element's position
    document.querySelectorAll('.dissolve-particles-container').forEach(container => {
        const containerTop = parseInt(container.style.top);
        const containerLeft = parseInt(container.style.left);

        // If container positions are close to the element position, it's likely for this element
        if (Math.abs(containerTop - elementTop) < 50 && Math.abs(containerLeft - elementLeft) < 50) {
            // Kill any ongoing GSAP animations for this container and its children
            gsap.killTweensOf(container);
            Array.from(container.children).forEach(child => {
                gsap.killTweensOf(child);
            });

            // Remove the container
            container.remove();
        }
    });

    // Kill ALL animations on this element
    gsap.killTweensOf(element);

    // Force the element to be visible again - no animation, just direct property setting
    element.classList.remove('dissolving');
    element.style.opacity = '1';
    element.style.visibility = 'visible';
    element.style.display = '';
    element.style.pointerEvents = '';

    // Clear all transform properties
    element.style.transform = '';
    element.style.scale = '';
    element.style.x = '';
    element.style.y = '';
    element.style.rotation = '';

    // Force refresh AOS if needed
    if (typeof AOS !== 'undefined' && element.hasAttribute('data-aos')) {
        // Remove aos-animate class to allow re-animation
        element.classList.remove('aos-animate');
        AOS.refresh();
    }
}

/**
 * Create particle dissolution effect for an element
 * @param {HTMLElement} element - The element to apply the effect to
 */
function createDissolveEffect(element) {
    // Don't apply effect if it's already dissolving
    if (element.classList.contains('dissolving')) return;

    // Register this element as dissolving in our global registry
    dissolvingElements.set(element, true);

    element.classList.add('dissolving');

    // Store the element's original opacity for restoration later
    const originalOpacity = window.getComputedStyle(element).opacity;

    // Store the element state for AOS reapplication
    const hasAOS = element.hasAttribute('data-aos');
    const aosValue = hasAOS ? element.getAttribute('data-aos') : null;
    const aosOffset = hasAOS ? element.getAttribute('data-aos-offset') : null;
    const aosDelay = hasAOS ? element.getAttribute('data-aos-delay') : null;

    // Get element dimensions and position
    const rect = element.getBoundingClientRect();
    const elementTop = rect.top + window.scrollY;
    const elementLeft = rect.left;
    const width = rect.width;
    const height = rect.height;

    // Create container for particles
    const particleContainer = document.createElement('div');
    particleContainer.className = 'dissolve-particles-container';
    particleContainer.style.position = 'absolute';
    particleContainer.style.top = elementTop + 'px';
    particleContainer.style.left = elementLeft + 'px';
    particleContainer.style.width = width + 'px';
    particleContainer.style.height = height + 'px';
    particleContainer.style.pointerEvents = 'none';
    particleContainer.style.zIndex = 999;
    particleContainer.style.overflow = 'visible';
    document.body.appendChild(particleContainer);

    // Store reference to the original element for cancellation
    particleContainer.dataset.forElementId = element.id || '';

    // Create an explicit link from the element to this container for efficient cleanup
    element.dataset.dissolveContainerId = Date.now().toString();
    particleContainer.dataset.containerId = element.dataset.dissolveContainerId;

    // Get colors from element for more content-aware particles
    const styles = window.getComputedStyle(element);
    const bgColor = styles.backgroundColor || 'white';
    const textColor = styles.color || 'black';
    const borderColor = styles.borderColor || bgColor;

    // Get accent color - try to find a kokoomus blue or gold color in the element
    let accentColor = 'rgba(0, 61, 165, 0.7)'; // Default to kokoomus blue
    if (element.innerHTML.includes('var(--kokoomus-gold)') ||
        element.querySelector('.highlight') ||
        element.classList.contains('policy-card')) {
        accentColor = 'rgba(255, 209, 0, 0.8)'; // Use kokoomus gold
    }

    // Increase particle density for more dramatic effect
    const areaDivider = element.classList.contains('timeline-item') ? 500 : 700; // More particles (smaller divider)
    const numParticles = Math.max(40, Math.floor((width * height) / areaDivider)); // Min 40 particles

    // Prepare to clone element's content for text particles if it has text content
    let hasTextContent = false;
    let textFragments = [];

    // Get text content from the element if it's not an image
    if (element.tagName !== 'IMG' && element.innerText && element.innerText.trim().length > 0) {
        hasTextContent = true;
        // Split text into words
        textFragments = element.innerText.split(/\s+/).filter(word => word.length > 0);
    }

    // IMPORTANT: Disable pointer events on the element while dissolving
    element.style.pointerEvents = 'none';

    // Create particle animation sequence with staggered groups for more dramatic effect
    for (let i = 0; i < numParticles; i++) {
        // Create a particle
        const particle = document.createElement('div');
        particle.className = 'dissolve-particle';

        // Random position within element
        const x = Math.random() * width;
        const y = Math.random() * height;

        // Random size with larger particles for certain elements
        const baseSize = element.classList.contains('info-item') ? 6 : 4; // Bigger base size
        const size = baseSize + Math.random() * 10; // Increased max size for more dramatic effect

        // Determine particle type - for text elements, occasionally create text particles
        let isTextParticle = false;
        if (hasTextContent && Math.random() < 0.2 && textFragments.length > 0) { // More text particles (0.2 vs 0.15)
            isTextParticle = true;
            particle.className = 'dissolve-text-particle';
            particle.textContent = textFragments[Math.floor(Math.random() * textFragments.length)];
            particle.style.fontSize = (8 + Math.random() * 8) + 'px'; // Larger text particles
            particle.style.color = textColor;
            particle.style.fontFamily = styles.fontFamily;
            particle.style.whiteSpace = 'nowrap';
            particle.style.opacity = 0.8 + Math.random() * 0.2; // Higher opacity
        } else {
            // Determine particle color - mix of background, text, and accent colors
            let particleColor;
            const colorRand = Math.random();
            if (colorRand < 0.5) {
                particleColor = bgColor;
            } else if (colorRand < 0.8) {
                particleColor = accentColor;
            } else {
                particleColor = textColor;
            }

            // Set styles for regular particle
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.borderRadius = Math.random() > 0.3 ? '50%' : (Math.random() > 0.5 ? '30%' : '5px');
            particle.style.backgroundColor = particleColor;
            particle.style.opacity = 0.8 + Math.random() * 0.2; // Higher opacity

            // Add glow effect for certain particles
            if (Math.random() > 0.4) { // More particles with glow
                const glowSize = Math.random() * 10 + 5; // Larger glow
                particle.style.boxShadow = `0 0 ${glowSize}px ${accentColor}`;
                particle.style.filter = `blur(${Math.random() * 3}px)`; // More blur
            }
        }

        // Common styles for all particles
        particle.style.position = 'absolute';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.transformOrigin = 'center center';

        // Add to container
        particleContainer.appendChild(particle);

        // Create more dynamic animation paths - wilder movement
        const randomAngle = Math.random() * Math.PI * 2; // Random angle in radians
        const randomDistance = 120 + Math.random() * 250; // Increased distance for more spread
        const targetX = Math.cos(randomAngle) * randomDistance;
        const targetY = Math.sin(randomAngle) * randomDistance + 80; // Bias slightly more downward

        // Create stagger groups for more coordinated dissolution
        const group = Math.floor(i / (numParticles / 5)); // Create 5 stagger groups
        const staggerDelay = group * 60 + Math.random() * 180; // More staggered delays (60ms per group + up to 180ms random)

        // Use fancier animation for larger particles
        const isLargeParticle = size > 10;

        // Stagger the animations slightly
        setTimeout(() => {
            // Regularly check if we should abort this animation (scrolled back in)
            if (!dissolvingElements.get(element)) {
                // If element is marked as not dissolving anymore, abandon the animation
                return;
            }

            // Only proceed if the particle container is still in the document
            if (document.body.contains(particleContainer) && particleContainer.contains(particle)) {
                // Add quick "pop" scale before flying away
                gsap.to(particle, {
                    scale: 1.4 + (Math.random() * 0.6), // More dramatic scaling
                    duration: 0.3, // Longer pop animation
                    ease: "power1.out",
                    onComplete: function() {
                        // Check again if we should continue
                        if (!dissolvingElements.get(element)) return;

                        // Only continue if the particle is still in the document
                        if (document.body.contains(particleContainer) && particleContainer.contains(particle)) {
                            // Now animate the flying away part
                            gsap.to(particle, {
                                x: targetX,
                                y: targetY,
                                opacity: 0,
                                scale: isLargeParticle ? (Math.random() * 0.5) : (Math.random() * 3),
                                rotation: (Math.random() - 0.5) * 540, // More rotation (540 vs 360)
                                duration: 1.2 + Math.random() * 1.8, // Slower animation (1.2-3s vs 0.8-2.2s)
                                ease: "power2.out",
                                onComplete: function() {
                                    // Only attempt to remove if it exists
                                    if (document.body.contains(particleContainer)) {
                                        if (particleContainer.children.length <= 1) {
                                            // Remove the container when all particles are done
                                            particleContainer.remove();
                                        }
                                        if (particleContainer.contains(particle)) {
                                            particle.remove();
                                        }
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }, staggerDelay); // Stagger start time
    }

    // Enhanced visual flash effect with element's accent color
    const flashOverlay = document.createElement('div');
    flashOverlay.style.position = 'absolute';
    flashOverlay.style.top = '0';
    flashOverlay.style.left = '0';
    flashOverlay.style.width = '100%';
    flashOverlay.style.height = '100%';

    // Use a more dynamic gradient for the flash effect
    const gradientDirection = Math.random() > 0.5 ? 'to right' : 'to bottom';
    flashOverlay.style.background = `linear-gradient(${gradientDirection}, rgba(255,255,255,0.8), ${accentColor})`;
    flashOverlay.style.opacity = '0';
    flashOverlay.style.pointerEvents = 'none';
    flashOverlay.style.mixBlendMode = 'overlay';
    element.style.position = 'relative';
    element.appendChild(flashOverlay);

    // More dramatic flash effect
    gsap.to(flashOverlay, {
        opacity: 0.6, // Higher opacity for more visible effect (0.6 vs 0.5)
        duration: 0.35, // Slower flash (0.35s vs 0.25s)
        ease: "sine.in",
        onComplete: function() {
            // Check if we should continue the effect
            if (!dissolvingElements.get(element)) {
                if (element.contains(flashOverlay)) {
                    flashOverlay.remove();
                }
                return;
            }

            if (element.contains(flashOverlay)) {  // Check if element is still in the document
                gsap.to(flashOverlay, {
                    opacity: 0,
                    duration: 0.5, // Slower fade out (0.5s vs 0.35s)
                    delay: 0.15, // Longer delay to see the flash (0.15s vs 0.1s)
                    ease: "power2.out",
                    onComplete: function() {
                        // Check again if we should continue
                        if (!dissolvingElements.get(element)) return;

                        if (element.contains(flashOverlay)) {  // Double-check before manipulating the DOM
                            flashOverlay.remove();

                            // Fade out the original element
                            gsap.to(element, {
                                opacity: 0,
                                duration: 0.4, // Slower fade out (0.4s vs 0.3s)
                                ease: "power1.out",
                                onComplete: function() {
                                    // Check one last time if we should continue
                                    if (!dissolvingElements.get(element)) return;

                                    setTimeout(() => {
                                        // Final check to make sure element should still be dissolving
                                        if (!dissolvingElements.get(element)) return;

                                        if (!particleContainer || !document.body.contains(particleContainer)) {
                                            resetElementAfterDissolve();
                                        } else {
                                            // Use a more reliable method to reset elements
                                            // Set a timeout to ensure element is reset after a maximum time
                                            setTimeout(() => {
                                                if (dissolvingElements.get(element)) {
                                                    resetElementAfterDissolve();
                                                }
                                            }, 3000); // Longer maximum time (3s vs 2s)
                                        }
                                    }, 100);
                                }
                            });
                        }
                    }
                });
            }
        }
    });

    // Function to reset the element state after dissolve animation
    function resetElementAfterDissolve() {
        // Mark element as not dissolving anymore but keep it invisible
        dissolvingElements.set(element, false);

        // Skip if element no longer exists in DOM
        if (!document.body.contains(element)) return;

        // For AOS elements, we need to reapply the AOS attributes
        if (hasAOS) {
            // Reset AOS attributes
            element.setAttribute('data-aos', aosValue);
            if (aosOffset) element.setAttribute('data-aos-offset', aosOffset);
            if (aosDelay) element.setAttribute('data-aos-delay', aosDelay);

            // Temporarily remove the AOS-animate class to allow for re-animation
            element.classList.remove('aos-animate');

            // Refresh AOS to recognize these elements again
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
        }

        // Keep the element invisible but ready to appear when scrolled into view
        element.style.opacity = '0';  // IMPORTANT: Keep opacity at 0 when reset
        element.classList.remove('dissolving');

        // Re-enable pointer events
        element.style.pointerEvents = '';

        // Clear any inline styles that might have been added during the animation
        // This allows the element to properly use CSS transitions later
        const inlineProps = ['transform', 'scale', 'x', 'y', 'rotation', 'filter', 'perspective'];
        inlineProps.forEach(prop => {
            element.style[prop] = '';
        });

        // Remove the container ID reference
        if (element.dataset.dissolveContainerId) {
            delete element.dataset.dissolveContainerId;
        }

        // Set a timeout to ensure AOS is ready when needed
        setTimeout(() => {
            if (typeof AOS !== 'undefined' && hasAOS) {
                // Force AOS to check visibility again
                AOS.refresh();
            }
        }, 100);
    }
}