// Anzhelika Korobeynyk - Campaign Website
// Main script file with navigation and animations

// Performance optimization for animations
const animationPerformance = {
    // Check device capability
    checkCapability: function() {
        // Check if the device is low-end or has reduce motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isLowEndDevice = navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 2 : false;

        // Store performance level
        this.performanceLevel = prefersReducedMotion || isLowEndDevice ? 'low' : 'high';
        console.log(`Animation performance level: ${this.performanceLevel}`);

        return this.performanceLevel;
    },

    // Apply appropriate animation settings based on device capability
    applySettings: function() {
        if (this.performanceLevel === 'low') {
            // Simplify animations for low-end devices
            document.body.classList.add('reduced-motion');

            // Update AOS settings
            if (typeof AOS !== 'undefined') {
                AOS.init({
                    duration: 400, // Reduce animation duration
                    once: true,    // Only animate once
                    mirror: false, // Don't mirror animations
                    disable: window.innerWidth < 768 // Disable on mobile
                });
            }

            // Simplify GSAP animations if available
            if (typeof gsap !== 'undefined') {
                gsap.defaults({
                    duration: 0.5,
                    ease: 'power1.out'
                });
            }
        } else {
            // Full animations for high-end devices
            if (typeof AOS !== 'undefined') {
                AOS.init({
                    duration: 800,
                    easing: 'ease-in-out',
                    once: false,
                    mirror: true
                });
            }
        }
    },

    // Initialize performance checks
    init: function() {
        this.checkCapability();
        this.applySettings();

        // Handle resize events to adjust animations on window resize
        window.addEventListener('resize', this.handleResize.bind(this));
    },

    // Handle resize events to adjust animations dynamically
    handleResize: function() {
        // Refresh AOS on resize
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }

        // Refresh ScrollTrigger on resize if available
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');

    // Register GSAP ScrollTrigger plugin if available
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        console.log('ScrollTrigger plugin registered');
    }

    // Initialize performance settings first
    animationPerformance.checkCapability();
    animationPerformance.applySettings();

    // Ensure AOS doesn't prevent theme cards from showing
    if (typeof AOS !== 'undefined') {
        // Get theme cards and remove AOS attributes to prevent animation issues
        const themeCards = document.querySelectorAll('#about .theme-card, #about .theme-card *');
        themeCards.forEach(card => {
            if (card.hasAttribute('data-aos')) {
                card.removeAttribute('data-aos');
            }
            if (card.hasAttribute('data-aos-delay')) {
                card.removeAttribute('data-aos-delay');
            }
            if (card.hasAttribute('data-aos-duration')) {
                card.removeAttribute('data-aos-duration');
            }
        });

        // Configure AOS with reduced durations
        AOS.init({
            duration: 600,
            once: true,      // Only animate once
            mirror: false,   // Don't mirror animations when scrolling back up
            offset: 50,      // Offset (in px) from the original trigger point
            disable: window.innerWidth < 768 // Disable on mobile
        });
    }

    // Handle preloader - hide it after resources are loaded
    const preloader = document.querySelector('.preloader');
    window.addEventListener('load', function() {
        // Create an entry animation timeline with faster durations
        const entryTimeline = gsap.timeline({
            defaults: {
                ease: "power2.out",
                duration: 0.6 // Faster default duration
            }
        });

        // First hide the preloader quickly
        entryTimeline.to(preloader, {
            opacity: 0,
            duration: 0.3, // Faster fade out
            onComplete: () => {
                preloader.style.display = 'none';
            }
        });

        // Then animate the background quickly
        entryTimeline.fromTo('.page-background',
            { scale: 1.05, opacity: 0 }, // Less scaling for faster transition
            { scale: 1, opacity: 0.15, duration: 0.5 }, // Faster animation
            "-=0.2" // Overlap more for speed
        );

        // Fade in the header quickly
        entryTimeline.fromTo('.main-header',
            { y: -20, opacity: 0 }, // Less movement for faster transition
            { y: 0, opacity: 1, duration: 0.4 }, // Faster animation
            "-=0.3" // Overlap more for speed
        );

        // Prepare the main section
        const initialSection = window.location.hash ? window.location.hash.substring(1) : 'home';
        const mainSection = document.getElementById(initialSection);

        if (mainSection) {
            // Make section visible but transparent
            mainSection.style.display = 'block';
            mainSection.style.opacity = 0;
            mainSection.classList.add('active');

            // Animate the section content
            entryTimeline.fromTo(mainSection,
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8 },
                "-=0.5"
            );

            // Special animation for hero content if on home page
            if (initialSection === 'home') {
                const heroElements = [
                    '#home h1',
                    '#home h2',
                    '#home .intro',
                    '#home .cta-buttons'
                ];

                heroElements.forEach((selector, index) => {
                    const element = document.querySelector(selector);
                    if (element) {
                        entryTimeline.fromTo(element,
                            { y: 40, opacity: 0 },
                            { y: 0, opacity: 1, duration: 0.7 },
                            "-=0.6"
                        );
                    }
                });
            }

            // Fade in the progress indicators
            entryTimeline.fromTo('.progress-indicator',
                { opacity: 0, x: 30 },
                { opacity: 1, x: 0, duration: 0.5 },
                "-=0.4"
            );

            // Animate footer at the end
            entryTimeline.fromTo('.main-footer',
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5 },
                "-=0.3"
            );

            // Handle direct URL navigation with hash on page load
            if (window.location.hash) {
                const sectionId = window.location.hash.substring(1);
                setTimeout(() => {
                    navigateToSection(sectionId);
                    console.log('Navigated to section from URL hash:', sectionId);
                }, 200);
            }
        } else {
            // Fallback if section not found
            console.error(`Initial section ${initialSection} not found`);
            // Handle direct URL navigation with hash on page load
            if (window.location.hash) {
                const sectionId = window.location.hash.substring(1);
                setTimeout(() => {
                    navigateToSection(sectionId);
                    console.log('Navigated to section from URL hash:', sectionId);
                }, 100);
            }
        }
    });

    // Initialize header behavior
    initHeader();

    // Initialize all animations and effects
    initAnimations();
    initScrollSafeguard();
    initParallaxEffects();
    initBackgroundAnimation();
    revealProtectedContent();

    // Handle window resize to adjust scrollable areas
    window.addEventListener('resize', debounce(function() {
        adjustScrollableSections();
    }, 250));

    // Run initial section adjustment
    adjustScrollableSections();

    // AOS is now initialized in the performance optimization

    // Call the function to ensure theme cards are visible
    ensureThemeCardsVisible();

    // Call it again after a short delay to handle any race conditions
    setTimeout(ensureThemeCardsVisible, 500);

    // Call again after load to be extra sure
    window.addEventListener('load', function() {
        setTimeout(ensureThemeCardsVisible, 100);
    });
});

// Function to reveal protected content
function revealProtectedContent() {
    // Email protection
    const protectedEmail = document.querySelector('.protected-email');
    if (protectedEmail) {
        const emailParts = ['angellmoon1992', '@', 'gmail', '.', 'com'];
        const emailAddress = emailParts.join('');

        // Create a more descriptive initial text
        protectedEmail.innerHTML = 'Klikkaa kopioidaksesi';
        protectedEmail.classList.add('clickable');

        protectedEmail.addEventListener('click', function() {
            if (!this.classList.contains('revealed')) {
                // First click - show the email
                this.innerHTML = emailAddress;
                this.classList.add('revealed');

                // Show a tooltip to indicate it's copyable
                const tooltip = document.createElement('div');
                tooltip.className = 'copy-tooltip';
                tooltip.innerHTML = 'Klikkaa kopioidaksesi';
                this.appendChild(tooltip);

                // Remove tooltip after 4 seconds
                setTimeout(() => {
                    if (tooltip && tooltip.parentNode) {
                        tooltip.parentNode.removeChild(tooltip);
                    }
                }, 4000);
            } else {
                // Second click - copy to clipboard
                navigator.clipboard.writeText(emailAddress)
                    .then(() => {
                        // Show copy success message
                        if (this.querySelector('.copy-tooltip')) {
                            this.querySelector('.copy-tooltip').remove();
                        }

                        const copySuccess = document.createElement('div');
                        copySuccess.className = 'copy-tooltip';
                        copySuccess.innerHTML = 'Kopioitu!';
                        this.appendChild(copySuccess);

                        // Remove tooltip after 2 seconds
                        setTimeout(() => {
                            if (copySuccess && copySuccess.parentNode) {
                                copySuccess.parentNode.removeChild(copySuccess);
                            }
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Could not copy text: ', err);
                    });
            }
        });
    }

    // Phone protection - similar approach
    const protectedPhone = document.querySelector('.protected-phone');
    if (protectedPhone) {
        const phoneParts = ['+358', ' ', '40', ' ', '123', ' ', '4567'];
        const phoneNumber = phoneParts.join('');

        protectedPhone.innerHTML = 'Klikkaa kopioidaksesi';
        protectedPhone.classList.add('clickable');

        protectedPhone.addEventListener('click', function() {
            if (!this.classList.contains('revealed')) {
                // First click - show the phone number
                this.innerHTML = phoneNumber;
                this.classList.add('revealed');

                // Show a tooltip to indicate it's copyable
                const tooltip = document.createElement('div');
                tooltip.className = 'copy-tooltip';
                tooltip.innerHTML = 'Klikkaa kopioidaksesi';
                this.appendChild(tooltip);

                // Remove tooltip after 4 seconds
                setTimeout(() => {
                    if (tooltip && tooltip.parentNode) {
                        tooltip.parentNode.removeChild(tooltip);
                    }
                }, 4000);
            } else {
                // Second click - copy to clipboard
                navigator.clipboard.writeText(phoneNumber)
                    .then(() => {
                        // Show copy success message
                        if (this.querySelector('.copy-tooltip')) {
                            this.querySelector('.copy-tooltip').remove();
                        }

                        const copySuccess = document.createElement('div');
                        copySuccess.className = 'copy-tooltip';
                        copySuccess.innerHTML = 'Kopioitu!';
                        this.appendChild(copySuccess);

                        // Remove tooltip after 2 seconds
                        setTimeout(() => {
                            if (copySuccess && copySuccess.parentNode) {
                                copySuccess.parentNode.removeChild(copySuccess);
                            }
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Could not copy text: ', err);
                    });
            }
        });
    }
}

// Function to initialize ScrollTrigger-based parallax effects
function initParallaxEffects() {
    // Make sure ScrollTrigger is available
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP or ScrollTrigger not loaded, skipping parallax effects');
        return;
    }

    // Create parallax effect for the about section image
    gsap.to('.about-image img', {
        scrollTrigger: {
            trigger: '.about-content',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
        },
        y: -40, // Move up by 40px during scroll
        ease: 'none'
    });

    // Create parallax effect for timeline items
    gsap.utils.toArray('.timeline-item').forEach(item => {
        gsap.to(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.5
            },
            y: -20, // Move up by 20px during scroll
            ease: 'power1.out'
        });
    });

    // Add subtle rotation effect to policy cards on scroll
    gsap.utils.toArray('.policy-card').forEach((card, i) => {
        const direction = i % 2 === 0 ? 1 : -1;
        gsap.to(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.5
            },
            rotation: 2 * direction, // Rotate slightly in alternating directions
            y: -10, // Move up slightly
            ease: 'power1.inOut'
        });
    });
}

// Function to initialize header and navigation
function initHeader() {
    const header = document.querySelector('.main-header');
    const navLinks = document.querySelectorAll('nav ul li a');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');

    // Handle mobile menu toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            nav.classList.toggle('active');
        });
    }

    // Handle navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            // Close mobile menu if open
            if (mobileMenuBtn && mobileMenuBtn.classList.contains('active')) {
                mobileMenuBtn.classList.remove('active');
                nav.classList.remove('active');
            }

            const targetId = this.getAttribute('href').substring(1);
            navigateToSection(targetId);

            // Update URL without reloading the page
            window.history.pushState(null, null, `#${targetId}`);

            // Update active nav link
            navLinks.forEach(link => link.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Set initial active link based on URL hash
    const initialSection = window.location.hash ? window.location.hash.substring(1) : 'home';
    const initialLink = document.querySelector(`nav ul li a[href="#${initialSection}"]`);
    if (initialLink) {
        navLinks.forEach(link => link.classList.remove('active'));
        initialLink.classList.add('active');
        navigateToSection(initialSection);
    }

    // Handle scroll event for sticky header
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Function to initialize animations
function initAnimations() {
    // Hero section animations
    const heroSection = document.getElementById('home');
    if (heroSection && heroSection.classList.contains('active')) {
        animateHeroText();
    }

    // Initialize progress navigation
    initProgressNav();
}

// Function to initialize scroll-based navigation
function initScrollSafeguard() {
    const sections = document.querySelectorAll('.section');
    const safeguard = document.createElement('div');
    safeguard.className = 'navigation-safeguard';
    safeguard.innerHTML = '<div class="message">Continue scrolling to next section <button class="confirm-btn">OK</button></div>';
    document.body.appendChild(safeguard);

    let isScrolling = false;
    let currentSectionIndex = 0;
    let lastScrollTime = Date.now();
    const cooldownPeriod = 800; // ms to prevent rapid toggling
    let wheelDelta = 0;
    const wheelThreshold = 3; // Reduced threshold for more responsive navigation

    // Helper function to determine current section
    function getCurrentSectionIndex() {
        let index = 0;
        sections.forEach((section, i) => {
            if (section.classList.contains('active')) {
                index = i;
            }
        });
        return index;
    }

    // Update current section index
    currentSectionIndex = getCurrentSectionIndex();

    // Handle safeguard toggle based on scroll position
    function handleSafeguardToggle() {
        if (Date.now() - lastScrollTime < cooldownPeriod) return;

        const activeSection = document.querySelector('.section.active');
        if (!activeSection) return;

        const sectionInner = activeSection.querySelector('.section-inner');
        if (!sectionInner) return;

        // Check if user has scrolled near the bottom of the section
        const scrollPosition = sectionInner.scrollTop;
        const scrollHeight = sectionInner.scrollHeight;
        const clientHeight = sectionInner.clientHeight;
        const scrollRemaining = scrollHeight - scrollPosition - clientHeight;

        // Show safeguard when close to bottom
        if (scrollRemaining < 50 && currentSectionIndex < sections.length - 1) {
            safeguard.classList.add('active');
        } else {
            safeguard.classList.remove('active');
        }
    }

    // Check scroll position periodically
    const checkScrollPosition = debounce(handleSafeguardToggle, 100);

    // Monitor scroll events within sections
    sections.forEach(section => {
        const sectionInner = section.querySelector('.section-inner');
        if (sectionInner) {
            sectionInner.addEventListener('scroll', function() {
                checkScrollPosition();
                // Store the scroll position for this section
                localStorage.setItem(`section_${section.id}_scrollTop`, sectionInner.scrollTop);
            });

            // Set the section-inner to be scrollable
            sectionInner.style.overflowY = 'auto';
            sectionInner.style.height = '100%';

            // Restore scroll position if saved
            const savedScrollTop = localStorage.getItem(`section_${section.id}_scrollTop`);
            if (savedScrollTop) {
                sectionInner.scrollTop = parseInt(savedScrollTop, 10);
            }
        }
    });

    // Handle confirmation to navigate to next section
    safeguard.querySelector('.confirm-btn').addEventListener('click', function() {
        safeguard.classList.remove('active');
        const nextIndex = currentSectionIndex + 1;
        if (nextIndex < sections.length) {
            const nextId = sections[nextIndex].id;
            navigateToSection(nextId);

            // Update URL and nav links
            window.history.pushState(null, null, `#${nextId}`);
            const navLinks = document.querySelectorAll('nav ul li a');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${nextId}`) {
                    link.classList.add('active');
                }
            });
        }
    });

    // When sections change, update current index and reset safeguard
    function handleSectionChange() {
        currentSectionIndex = getCurrentSectionIndex();
        safeguard.classList.remove('active');
        lastScrollTime = Date.now();
        wheelDelta = 0; // Reset wheel delta on section change
    }

    // Create a custom event for section changes
    const sectionChangeEvent = new CustomEvent('sectionchange');

    // Listen for section changes
    document.addEventListener('sectionchange', handleSectionChange);

    // Improved wheel event handler
    window.addEventListener('wheel', function(e) {
        const activeSection = document.querySelector('.section.active');
        if (!activeSection) return;

        const sectionInner = activeSection.querySelector('.section-inner');
        if (!sectionInner) return;

        // Get scroll information
        const scrollPosition = Math.round(sectionInner.scrollTop);
        const scrollHeight = Math.round(sectionInner.scrollHeight);
        const clientHeight = Math.round(sectionInner.clientHeight);
        const scrollRemaining = scrollHeight - scrollPosition - clientHeight;

        // Special case for About section to fix scrolling
        if (activeSection.id === 'about') {
            console.log(`About section wheel event - ScrollPos: ${scrollPosition}, ScrollHeight: ${scrollHeight}, ClientHeight: ${clientHeight}, Remaining: ${scrollRemaining}, Delta: ${e.deltaY}`);

            // Check if content is truly scrollable (content height significantly greater than container)
            const isSignificantlyScrollable = scrollHeight > clientHeight + 50;

            if (isSignificantlyScrollable) {
                // If we're in the scrollable content of the about section, let the default scroll happen
                // Only take control at the very top or bottom edges
                if (scrollPosition <= 0 && e.deltaY < 0) {
                    // At very top and trying to scroll up further - handle navigation
                    wheelDelta -= 1;
                    if (wheelDelta <= -wheelThreshold) {
                        if (currentSectionIndex > 0) {
                            navigateToSection(sections[currentSectionIndex - 1].id);
                            document.dispatchEvent(sectionChangeEvent);
                        }
                        wheelDelta = 0;
                    }
                    // Prevent default to avoid bouncing in some browsers
                    e.preventDefault();
                } else if (scrollRemaining <= 5 && e.deltaY > 0) {
                    // At very bottom and trying to scroll down further - handle navigation
                    wheelDelta += 1;
                    if (wheelDelta >= wheelThreshold) {
                        if (currentSectionIndex < sections.length - 1) {
                            navigateToSection(sections[currentSectionIndex + 1].id);
                            document.dispatchEvent(sectionChangeEvent);
                        }
                        wheelDelta = 0;
                    }
                    // Prevent default to avoid bouncing in some browsers
                    e.preventDefault();
                } else {
                    // In the middle of content - let normal scrolling happen
                    wheelDelta = 0;
                    // Do NOT preventDefault to allow normal scrolling
                    console.log("Allowing normal scrolling in About section");
                }

                return; // Exit early for About section to avoid the general case below
            } else {
                console.log("About section content not significantly scrollable - using normal section navigation");
            }
        }

        // More precise detection of scrollability for other sections
        const canScrollDown = scrollRemaining > 2;
        const canScrollUp = scrollPosition > 2;
        const isScrollableContent = scrollHeight > clientHeight + 10; // Content is taller than container

        // Log for debugging - can be removed in production
        console.log(`Section: ${activeSection.id}, ScrollPos: ${scrollPosition}, ScrollHeight: ${scrollHeight}, ClientHeight: ${clientHeight}, Remaining: ${scrollRemaining}, CanScrollDown: ${canScrollDown}, CanScrollUp: ${canScrollUp}, IsScrollable: ${isScrollableContent}`);

        // Determine scroll direction
        const scrollingDown = e.deltaY > 0;
        const scrollingUp = e.deltaY < 0;

        // Standard handling for sections
        if (!canScrollUp && scrollingUp) {
            wheelDelta -= 1;
            if (wheelDelta <= -wheelThreshold) {
                if (currentSectionIndex > 0) {
                    navigateToSection(sections[currentSectionIndex - 1].id);
                    document.dispatchEvent(sectionChangeEvent);
                }
                wheelDelta = 0;
            }
        } else if (!canScrollDown && scrollingDown) {
            wheelDelta += 1;
            if (wheelDelta >= wheelThreshold) {
                if (currentSectionIndex < sections.length - 1) {
                    navigateToSection(sections[currentSectionIndex + 1].id);
                    document.dispatchEvent(sectionChangeEvent);
                }
                wheelDelta = 0;
            }
        } else {
            wheelDelta = 0;
        }
    });

    // Fix Tietoa section scrolling specifically
    const tietoaSection = document.getElementById('about');
    if (tietoaSection) {
        const tietoaInner = tietoaSection.querySelector('.section-inner');
        if (tietoaInner) {
            // Ensure the content is scrollable
            tietoaInner.style.overflowY = 'scroll';
            tietoaInner.style.maxHeight = 'calc(100vh - 160px)';
            tietoaInner.style.position = 'relative';
            tietoaInner.style.paddingBottom = '160px';
            console.log('Applied specific scroll fix to Tietoa section');
        }
    }
}

// Function to navigate to a specific section
function navigateToSection(sectionId) {
    console.log(`Navigating to section: ${sectionId}`);
    const sections = document.querySelectorAll('.section');
    const targetSection = document.getElementById(sectionId);
    const currentSection = document.querySelector('.section.active');
    const pageBackground = document.querySelector('.page-background');

    if (!targetSection) {
        console.error(`Section with ID ${sectionId} not found`);
        return;
    }

    // Don't animate if already on the target section
    if (currentSection && currentSection.id === sectionId) {
        console.log('Already on this section');
        return;
    }

    // Determine transition direction (up or down)
    let direction = 1; // Default: slide down (positive)
    if (currentSection) {
        const currentIndex = Array.from(sections).indexOf(currentSection);
        const targetIndex = Array.from(sections).indexOf(targetSection);
        direction = targetIndex > currentIndex ? 1 : -1;
    }

    // Add transitioning class to body
    document.body.classList.add('page-transitioning');

    // Preload target section - make it visible but transparent
    targetSection.style.display = 'block';
    targetSection.style.opacity = '0';
    targetSection.style.zIndex = '1';

    // Ensure both sections are visible during transition
    if (currentSection) currentSection.style.display = 'block';

    // Ensure the background is visible
    if (pageBackground) {
        gsap.to(pageBackground, {
            duration: 0.3, // Faster background transition
            opacity: 0.15,
            ease: "power1.inOut"
        });
    }

    // Set initial state for target section elements - explicitly include .about-content
    const targetElements = targetSection.querySelectorAll('h1, h2, h3, p, .row, .btn, .section-title, .policy-card, .timeline-item, .info-item, .about-content');

    gsap.set(targetElements, {
        opacity: 0,
        y: 15 * direction, // Reduced movement for faster transitions
        scale: 0.98
    });

    // Set up GSAP animation timeline for element-based transitions - with faster durations
    const timeline = gsap.timeline({
        onComplete: function() {
            // After animation completes, update active section and clean up
            document.body.classList.remove('page-transitioning');

            // Handle section change
            sections.forEach(section => {
                section.classList.remove('active');
                // Hide all other sections after transition completes
                if (section !== targetSection) {
                    section.style.display = 'none';
                }
            });
            targetSection.classList.add('active');

            // Get saved scroll position for the section or default to 0
            const sectionInner = targetSection.querySelector('.section-inner');
            if (sectionInner) {
                // Check content dimensions to ensure scrolling is enabled if needed
                const contentHeight = sectionInner.scrollHeight;
                const containerHeight = sectionInner.clientHeight;
                console.log(`Section ${sectionId} - Content height: ${contentHeight}, Container height: ${containerHeight}`);

                // Set specific styles for the About section when navigating to it
                if (sectionId === 'about') {
                    const headerHeight = document.querySelector('.main-header').offsetHeight || 80;
                    const footerHeight = document.querySelector('.main-footer').offsetHeight || 60;
                    const availableHeight = window.innerHeight - headerHeight - footerHeight - 40;

                    // Apply the force-scroll class for consistent styling
                    sectionInner.classList.add('force-scroll');

                    // Force scrollability for about section
                    sectionInner.style.maxHeight = `${availableHeight}px`;
                    sectionInner.style.height = 'auto';
                    sectionInner.style.overflowY = 'scroll';
                    sectionInner.style.paddingBottom = '250px';
                    sectionInner.style.position = 'relative';
                    sectionInner.style.display = 'block';

                    // Add more bottom padding to ensure content isn't cut off
                    const aboutContent = targetSection.querySelector('.about-content');
                    if (aboutContent) {
                        aboutContent.style.marginBottom = '80px';
                        // Make sure the about-content is visible
                        aboutContent.style.opacity = '1';
                        aboutContent.style.transform = 'translateY(0)';
                        aboutContent.style.scale = '1';
                    }

                    console.log(`Adjusted about section height to ${availableHeight}px with forced scroll`);

                    // Force a reflow to ensure scrollability
                    setTimeout(() => {
                        sectionInner.classList.add('force-scroll'); // Add class again after delay to ensure it's applied
                        sectionInner.style.overflowY = 'scroll';
                        // Force the content to be re-measured
                        sectionInner.style.display = 'block';
                        console.log('Refreshed about section scroll after delay');

                        // Additional check to ensure content is scrollable
                        console.log(`After refresh - Content height: ${sectionInner.scrollHeight}, Container height: ${sectionInner.clientHeight}`);

                        // Scroll a tiny bit to activate scrolling
                        if (sectionInner.scrollHeight > sectionInner.clientHeight) {
                            sectionInner.scrollTop = 1;
                            setTimeout(() => sectionInner.scrollTop = 0, 10);
                        }
                    }, 50); // Faster timeout
                }

                const savedScrollTop = localStorage.getItem(`section_${sectionId}_scrollTop`);
                if (savedScrollTop) {
                    sectionInner.scrollTop = parseInt(savedScrollTop, 10);
                } else {
                    sectionInner.scrollTop = 0;
                }
            }

            // Update navigation highlight
            const navLinks = document.querySelectorAll('nav ul li a');
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });

            // Trigger animations for the section if needed
            if (sectionId === 'home') {
                animateHeroText();
            }

            // Update progress nav
            updateProgressNav(sectionId);

            // Recalculate section heights after navigation
            adjustScrollableSections();

            // Dispatch section change event
            const sectionChangeEvent = new CustomEvent('sectionchange', { detail: { sectionId } });
            document.dispatchEvent(sectionChangeEvent);

            // If we're navigating to the about section, ensure theme cards are visible
            if (sectionId === 'about') {
                // Call immediately and after a slight delay to ensure it works
                ensureThemeCardsVisible();
                setTimeout(ensureThemeCardsVisible, 100); // Faster timeout
            }
        }
    });

    // Choose transition type based on user's performance settings
    const isLowPerformance = animationPerformance.performanceLevel === 'low';

    // Use simpler transition for low performance devices
    if (isLowPerformance) {
        // Simple crossfade between sections
        if (currentSection) {
            timeline.to(currentSection, {
                duration: 0.25, // Faster transition
                opacity: 0,
                ease: "power1.in"
            });
        }

        // Fade in target section
        timeline.to(targetSection, {
            duration: 0.25, // Faster transition
            opacity: 1,
            ease: "power1.out"
        }, currentSection ? "-=0.1" : 0);
    }
    // Use element-based transition for high performance devices
    else {
        // First dim/fade out current section elements
        if (currentSection) {
            // Select all major elements in current section to animate
            const currentElements = currentSection.querySelectorAll('h1, h2, h3, p, .row, .btn, .section-title, .policy-card, .timeline-item, .info-item, .about-content');

            // Keep the section background transparent to allow page background to show
            timeline.to(currentSection, {
                duration: 0.3, // Faster transition
                backgroundColor: 'rgba(255,255,255,0)',
                ease: "power2.inOut"
            }, 0);

            // Fade out elements with staggered timing
            timeline.to(currentElements, {
                duration: 0.25, // Faster transition
                opacity: 0,
                y: -10 * direction, // Less movement for faster transitions
                scale: 0.95,
                stagger: 0.02, // Faster stagger
                ease: "power1.in"
            }, 0);
        }

        // Then fade in the target section - keeping it transparent to let the background show
        timeline.to(targetSection, {
            duration: 0.25, // Faster transition
            backgroundColor: 'rgba(255,255,255,0)',
            autoAlpha: 1,
            ease: "power1.out"
        }, currentSection ? "-=0.1" : 0);

        // Preload section content with minimal delay
        // Fade in the new section's elements with staggered timing
        timeline.to(targetElements, {
            duration: 0.3, // Faster transition
            opacity: 1,
            y: 0,
            scale: 1,
            stagger: 0.02, // Faster stagger
            ease: "power2.out"
        }, currentSection ? "-=0.1" : 0.05);

        // Special case for hero section animations if navigating to home
        if (sectionId === 'home') {
            const heroElements = [
                '#home h1',
                '#home h2',
                '#home .intro',
                '#home .cta-buttons'
            ];

            timeline.fromTo(heroElements,
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    stagger: 0.05, // Faster stagger
                    duration: 0.4, // Faster animation
                    ease: "power2.out"
                },
                "-=0.2"
            );
        }

        // Special case for policy cards if navigating to policies section
        if (sectionId === 'policies') {
            const policyCards = targetSection.querySelectorAll('.policy-card');

            timeline.fromTo(policyCards,
                { opacity: 0, y: 15, scale: 0.9 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    stagger: 0.05, // Faster stagger
                    duration: 0.4, // Faster animation
                    ease: "back.out(1.2)"
                },
                "-=0.1"
            );
        }

        // Special case for timeline items if navigating to achievements section
        if (sectionId === 'achievements') {
            const timelineItems = targetSection.querySelectorAll('.timeline-item');

            timeline.fromTo(timelineItems,
                { opacity: 0, x: (i) => i % 2 === 0 ? -20 : 20 }, // Less movement
                {
                    opacity: 1,
                    x: 0,
                    stagger: 0.08, // Faster stagger
                    duration: 0.4, // Faster animation
                    ease: "power2.out"
                },
                "-=0.2"
            );
        }
    }
}

// Handle browser back/forward buttons
window.addEventListener('popstate', function(event) {
    // Get the section ID from the URL hash
    const sectionId = window.location.hash ? window.location.hash.substring(1) : 'home';
    navigateToSection(sectionId);
});

// Function to initialize progress navigation dots
function initProgressNav() {
    const sections = document.querySelectorAll('.section');
    const container = document.querySelector('.progress-indicator');

    // Create progress nav if it doesn't exist
    if (!container) {
        const progressNav = document.createElement('div');
        progressNav.className = 'progress-indicator';

        sections.forEach((section, index) => {
            const dot = document.createElement('div');
            dot.className = 'progress-dot';
            dot.setAttribute('data-section', section.id);
            dot.addEventListener('click', () => {
                navigateToSection(section.id);
            });

            // Set first dot as active
            if (index === 0) {
                dot.classList.add('active');
            }

            progressNav.appendChild(dot);
        });

        document.body.appendChild(progressNav);
    }
}

// Function to update progress navigation
function updateProgressNav(sectionId) {
    const dots = document.querySelectorAll('.progress-dot');
    dots.forEach(dot => {
        dot.classList.remove('active');
        if (dot.getAttribute('data-section') === sectionId) {
            dot.classList.add('active');
        }
    });
}

// Helper function for debouncing events
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Function to animate the hero text with typewriter effect
function animateHeroText() {
    const heroTitle = document.querySelector('#hero h1');
    const subtitle = document.querySelector('#hero h2');
    const intro = document.querySelector('#hero .intro');
    const buttons = document.querySelectorAll('#hero .cta-buttons .btn');

    if (!heroTitle || !subtitle || !intro) return;

    // Clear any existing animation
    gsap.set([heroTitle, subtitle, intro, buttons], { clearProps: 'all' });

    // Add the Number 1 badge if it doesn't exist
    addNumberOneBadge();

    // Add vote stars if they don't exist
    addVoteStars();

    // Create timeline for animations
    const tl = gsap.timeline();

    // Prepare hero title for character-by-character animation
    if (!heroTitle.classList.contains('prepared')) {
        // Add highlight to part of the name
        const titleText = heroTitle.textContent;
        const highlightName = titleText.includes('Anzhelika') ? 'Anzhelika' :
                             (titleText.includes('Korobeynyk') ? 'Korobeynyk' : '');

        if (highlightName) {
            const newTitleHTML = titleText.replace(highlightName, `<span class="highlight">${highlightName}</span>`);
            heroTitle.innerHTML = newTitleHTML;
        }

        prepareTextForSplitAnimation(heroTitle, 'char', 'char-animated-');
        heroTitle.classList.add('prepared');
    }

    // Prepare subtitle for word-based animation with emphasis
    if (!subtitle.classList.contains('prepared')) {
        prepareTextForSplitAnimation(subtitle, 'word', 'word-animated-');
        subtitle.classList.add('prepared');
    }

    // Prepare intro for word-based animation
    if (!intro.classList.contains('prepared')) {
        prepareTextForSplitAnimation(intro, 'word', 'word-animated-');
        highlightKeywords(intro);
        intro.classList.add('prepared');
    }

    // Initial state for elements
    gsap.set(heroTitle, { opacity: 1 }); // Title will be visible but chars will animate
    gsap.set([subtitle, intro], { opacity: 1 }); // Set to visible but individual elements will animate
    gsap.set(buttons, { opacity: 0, y: 20, scale: 0.9 });
    gsap.set('.vote-stars', { opacity: 0, scale: 0.5 });
    gsap.set('.badge', { opacity: 0, scale: 0.5, rotation: 15 });

    // Animate title characters with staggered effects - using different effects for variety
    const titleChars = heroTitle.querySelectorAll('.char');
    titleChars.forEach((char, index) => {
        // Apply different animation styles to different sets of characters
        let animationType;
        if (index < 5) {
            animationType = 'fade'; // First few chars fade in
        } else if (index >= 5 && index < 12) {
            animationType = 'scale'; // Middle chars scale in
        } else {
            animationType = 'rotate'; // Last chars rotate in
        }

        char.classList.add(`char-animated-${animationType}`);
        char.style.animationDelay = `${index * 0.07}s`;
    });

    // Add the title underline animation
    tl.to(heroTitle.querySelector('::after'), {
        width: '80%',
        duration: 0.8,
        ease: 'power2.inOut',
        delay: 0.8 // Start after most characters have animated in
    });

    // Animate the badge with a bounce effect
    tl.to('.badge', {
        opacity: 1,
        scale: 1,
        rotation: 15,
        duration: 0.8,
        ease: 'bounce.out'
    }, "-=0.5");

    // Animate vote stars
    tl.to('.vote-stars', {
        opacity: 1,
        scale: 1,
        stagger: 0.1,
        duration: 0.5,
        ease: 'back.out(1.7)'
    }, "-=0.6");

    // Animate subtitle words with staggered effects
    const subtitleWords = subtitle.querySelectorAll('.word');
    subtitleWords.forEach((word, index) => {
        word.classList.add(index % 2 === 0 ? 'word-animated-pop' : 'word-animated-slide');
        word.style.animationDelay = `${1.2 + (index * 0.15)}s`; // Start after title finishes
    });

    // Animate intro words with staggered effects
    const introWords = intro.querySelectorAll('.word');
    introWords.forEach((word, index) => {
        // Alternate between animation types
        word.classList.add(index % 2 === 0 ? 'word-animated-slide' : 'word-animated-pop');
        word.style.animationDelay = `${1.5 + (index * 0.08)}s`; // Start after subtitle
    });

    // Animate buttons with bounce effect after all text animations
    tl.to(buttons, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.15,
        ease: 'back.out(1.7)'
    }, "+=0.5"); // Wait for text animations to mostly complete

    // Add a pulse effect to the primary button
    const primaryBtn = document.querySelector('#hero .primary-btn');
    if (primaryBtn) {
        tl.to(primaryBtn, {
            scale: 1.05,
            duration: 0.6,
            repeat: 1,
            yoyo: true,
            ease: 'power1.inOut'
        }, '-=0.2');
    }
}

// Helper function to prepare text for split character or word animations
function prepareTextForSplitAnimation(element, splitType, classPrefix) {
    const originalText = element.textContent.trim();
    const splitItems = splitType === 'char' ? originalText.split('') : originalText.split(' ');
    let html = '';

    if (splitType === 'char') {
        // Handle character splitting
        splitItems.forEach(char => {
            if (char === ' ') {
                html += ' ';
            } else {
                html += `<span class="${splitType}">${char}</span>`;
            }
        });
    } else {
        // Handle word splitting
        splitItems.forEach((word, index) => {
            html += `<span class="${splitType}">${word}</span>${index < splitItems.length - 1 ? ' ' : ''}`;
        });
    }

    // If element has highlight spans, we need to preserve them
    if (element.querySelector('.highlight')) {
        const highlightSpan = element.querySelector('.highlight');
        const highlightText = highlightSpan.textContent;

        // Process the highlight text separately
        let highlightHtml = '';
        if (splitType === 'char') {
            highlightText.split('').forEach(char => {
                highlightHtml += `<span class="${splitType}">${char}</span>`;
            });
        } else {
            highlightText.split(' ').forEach((word, index) => {
                highlightHtml += `<span class="${splitType}">${word}</span>${index < highlightText.split(' ').length - 1 ? ' ' : ''}`;
            });
        }

        // Replace the content while preserving the highlight span
        element.innerHTML = element.innerHTML.replace(highlightSpan.outerHTML, `<span class="highlight">${highlightHtml}</span>`);
    } else {
        element.innerHTML = html;
    }
}

// Helper function to add the Number 1 badge if it doesn't exist
function addNumberOneBadge() {
    const heroContent = document.querySelector('#hero .hero-content');
    if (!heroContent) return;

    // Check if badge already exists
    if (!heroContent.querySelector('.badge')) {
        const badge = document.createElement('div');
        badge.className = 'badge number-one';
        badge.innerHTML = '#1';

        // Add to hero content (next to the title)
        const heroTitle = heroContent.querySelector('h1');
        if (heroTitle) {
            heroTitle.parentNode.insertBefore(badge, heroTitle.nextSibling);
        } else {
            heroContent.appendChild(badge);
        }
    }
}

// Helper function to add decorative vote stars
function addVoteStars() {
    const heroContent = document.querySelector('#hero .hero-content');
    if (!heroContent) return;

    // Check if stars already exist
    if (!heroContent.querySelector('.vote-stars')) {
        const starsContainer = document.createElement('div');
        starsContainer.className = 'vote-stars';

        // Add 5 stars with different positions
        for (let i = 0; i < 5; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.innerHTML = '★';

            // Randomize positions around the hero content
            const positionClass = `star-pos-${i + 1}`;
            star.classList.add(positionClass);

            starsContainer.appendChild(star);
        }

        // Add to hero content
        heroContent.appendChild(starsContainer);
    }
}

// Helper function to highlight keywords in text
function highlightKeywords(element) {
    // Define keywords to highlight (based on the context)
    const keywords = [
        'Anzhelika', 'Korobeynyk', 'Kokoomuksen', 'edustaja', 'vahvempaa',
        'vakaampaa', 'Suomea', 'Rakentamassa'
    ];

    // Only run on elements with words
    const words = element.querySelectorAll('.word');
    if (!words.length) return;

    // Check each word and add highlight class if it matches keywords
    words.forEach(word => {
        const wordText = word.textContent.trim();
        if (keywords.some(keyword =>
            wordText.toLowerCase().includes(keyword.toLowerCase()) ||
            keyword.toLowerCase().includes(wordText.toLowerCase())
        )) {
            word.classList.add('highlight-word');
        }
    });
}

// Function to initialize background animation
function initBackgroundAnimation() {
    const background = document.querySelector('.page-background');
    if (!background || !gsap) return;

    // Add zoom class for basic CSS animation
    background.classList.add('zoom-bg');

    // Ensure the background is always visible
    gsap.set(background, { opacity: 0.15 });

    // Periodically check and reset background opacity if it gets too low
    setInterval(() => {
        const currentOpacity = parseFloat(window.getComputedStyle(background).opacity);
        if (currentOpacity < 0.1) {
            console.log('Background opacity too low, resetting to default');
            gsap.to(background, {
                duration: 0.5,
                opacity: 0.15,
                ease: "power1.inOut"
            });
        }
    }, 2000);

    // Initialize GSAP randomized movement
    randomizeMovement();

    function randomizeMovement() {
        // Create random values for scale and position
        const randomScale = 1 + (Math.random() * 0.06 + 0.02); // Random value between 1.02 and 1.08
        const randomX = (Math.random() - 0.5) * 3; // Random value between -1.5% and 1.5%
        const randomY = (Math.random() - 0.5) * 3; // Random value between -1.5% and 1.5%
        const duration = Math.random() * 7 + 8; // Random duration between 8 and 15 seconds

        // Animate with GSAP
        gsap.to(background, {
            scale: randomScale,
            xPercent: randomX,
            yPercent: randomY,
            duration: duration,
            ease: 'sine.inOut',
            onComplete: randomizeMovement
        });
    }
}

// Function to adjust scrollable sections on window resize
function adjustScrollableSections() {
    const sections = document.querySelectorAll('.section');
    const headerHeight = document.querySelector('.main-header').offsetHeight || 80;
    const footerHeight = document.querySelector('.main-footer').offsetHeight || 60;

    console.log('Adjusting sections for viewport height:', window.innerHeight);
    console.log('Header height:', headerHeight, 'Footer height:', footerHeight);

    sections.forEach(section => {
        const sectionInner = section.querySelector('.section-inner');
        if (sectionInner) {
            const availableHeight = window.innerHeight - headerHeight - footerHeight - 30; // Adding extra padding

            // Set height differently for different sections
            if (section.id === 'about') {
                // Special handling for about section
                const extraPadding = 40; // Additional padding for about section

                // Apply the force-scroll class for consistent styling
                sectionInner.classList.add('force-scroll');

                // Force dimensions and scrolling
                sectionInner.style.maxHeight = `${availableHeight - extraPadding}px`;
                sectionInner.style.minHeight = `${availableHeight - extraPadding}px`;
                sectionInner.style.height = 'auto'; // Let content determine height
                sectionInner.style.overflowY = 'scroll'; // Force scroll
                sectionInner.style.overflowX = 'hidden';
                sectionInner.style.position = 'relative';
                sectionInner.style.display = 'block'; // Force block display
                sectionInner.style.paddingBottom = '300px'; // Extra padding at bottom for visibility

                // Ensure the about-content is properly styled
                const aboutContent = section.querySelector('.about-content');
                if (aboutContent) {
                    aboutContent.style.marginBottom = '80px';
                    aboutContent.style.position = 'relative';
                    aboutContent.style.zIndex = '30';
                    aboutContent.style.width = '100%';
                }

                // Make sure theme cards are visible
                const themeCards = section.querySelectorAll('.theme-card');
                themeCards.forEach((card, index) => {
                    card.style.opacity = '1';
                    card.style.visibility = 'visible';
                    card.style.zIndex = '50';
                    card.style.position = 'relative';
                    // Add delay to ensure they appear even with AOS
                    setTimeout(() => {
                        card.style.display = 'block';
                    }, 100 + (index * 50));
                });

                // Ensure the theme cards row is visible
                const themeRow = section.querySelector('.row.mt-4');
                if (themeRow) {
                    themeRow.style.position = 'relative';
                    themeRow.style.zIndex = '40';
                    themeRow.style.display = 'flex';
                    themeRow.style.flexWrap = 'wrap';
                    themeRow.style.width = '100%';
                }

                // Log dimensions for debugging
                console.log(`Adjusted about section inner height to ${availableHeight-extraPadding}px with forced scroll`);
                console.log(`About section content height: ${sectionInner.scrollHeight}px, container height: ${sectionInner.clientHeight}px`);

                // Force a reflow to ensure scrollability is applied
                setTimeout(() => {
                    // Check if content is scrollable after styles are applied
                    const isScrollable = sectionInner.scrollHeight > sectionInner.clientHeight;
                    console.log(`After timeout - About section is scrollable: ${isScrollable} (content: ${sectionInner.scrollHeight}px, container: ${sectionInner.clientHeight}px)`);

                    // If not sufficiently scrollable, try to fix it
                    if (!isScrollable || sectionInner.scrollHeight < sectionInner.clientHeight + 50) {
                        sectionInner.style.paddingBottom = '350px'; // Increase padding further
                        console.log('Increasing padding to force scrollability');
                    }

                    // Add a small scroll to activate scrolling
                    sectionInner.scrollTop = 1;
                    setTimeout(() => sectionInner.scrollTop = 0, 10);
                }, 300);
            } else {
                sectionInner.style.height = `${availableHeight}px`;
                sectionInner.style.overflowY = 'auto';
            }

            // Check if content is scrollable
            const isScrollable = sectionInner.scrollHeight > sectionInner.clientHeight;
            console.log(`Section ${section.id} is scrollable: ${isScrollable} (content: ${sectionInner.scrollHeight}px, container: ${sectionInner.clientHeight}px)`);
        }
    });
}

// Add a window resize event listener to adjust sections when window size changes
window.addEventListener('resize', function() {
    // Debounce the resize event
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(function() {
        console.log('Window resized, adjusting sections...');
        adjustScrollableSections();
    }, 250);
});

// Function to ensure theme cards are visible
function ensureThemeCardsVisible() {
    const themeCards = document.querySelectorAll('#about .theme-card');
    if (!themeCards.length) return;

    console.log(`Ensuring ${themeCards.length} theme cards are visible`);

    themeCards.forEach((card, index) => {
        // Force visibility through direct style attributes
        card.style.display = 'block';
        card.style.opacity = '1';
        card.style.visibility = 'visible';
        card.style.position = 'relative';
        card.style.zIndex = '50';

        // Remove any potentially interfering animation classes
        card.classList.remove('aos-animate', 'aos-init');

        // Remove any data-aos attributes that might delay visibility
        if (card.hasAttribute('data-aos')) {
            card.removeAttribute('data-aos');
        }

        // Force immediate render with small delay between cards
        setTimeout(() => {
            card.style.display = 'block';
            card.style.opacity = '1';
        }, 100 + (index * 30));
    });

    // Also make the row containing the cards visible
    const themeRow = document.querySelector('#about .row.mt-4');
    if (themeRow) {
        themeRow.style.display = 'flex';
        themeRow.style.opacity = '1';
        themeRow.style.visibility = 'visible';
        themeRow.style.position = 'relative';
        themeRow.style.zIndex = '40';
    }
}

// Add preload function to enhance page transitions
// This function preloads sections adjacent to the current one
function preloadAdjacentSections() {
    const currentSection = document.querySelector('.section.active');
    if (!currentSection) return;

    const sections = document.querySelectorAll('.section');
    const currentIndex = Array.from(sections).indexOf(currentSection);

    // Preload next section if available
    if (currentIndex < sections.length - 1) {
        const nextSection = sections[currentIndex + 1];
        if (!nextSection.classList.contains('preloaded')) {
            console.log(`Preloading next section: ${nextSection.id}`);
            // Just make sure all images and heavy content is loaded, but keep section hidden
            nextSection.classList.add('preloaded');
            const images = nextSection.querySelectorAll('img');
            images.forEach(img => {
                if (img.dataset.src) {
                    const preloadImg = new Image();
                    preloadImg.src = img.dataset.src;
                }
            });
        }
    }

    // Preload previous section if available
    if (currentIndex > 0) {
        const prevSection = sections[currentIndex - 1];
        if (!prevSection.classList.contains('preloaded')) {
            console.log(`Preloading previous section: ${prevSection.id}`);
            prevSection.classList.add('preloaded');
            const images = prevSection.querySelectorAll('img');
            images.forEach(img => {
                if (img.dataset.src) {
                    const preloadImg = new Image();
                    preloadImg.src = img.dataset.src;
                }
            });
        }
    }
}

// Call preload function after page is loaded
window.addEventListener('load', function() {
    // Wait a bit after initial page load to preload adjacent sections
    setTimeout(preloadAdjacentSections, 1000);
});

// Also preload after each section change
document.addEventListener('sectionchange', function() {
    // Preload adjacent sections after a short delay
    setTimeout(preloadAdjacentSections, 500);
});