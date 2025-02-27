// Anzhelika Korobeynyk - Campaign Website
// Main script file with navigation and animations

document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    const sections = document.querySelectorAll('.section');
    let currentSectionIndex = 0;
    let isNavigating = false;
    let lastScrollTime = Date.now();
    let scrollTimeout;
    const wheelThreshold = 120; // Increased threshold for better control
    let wheelDelta = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    let safeguardActive = false;
    let safeguardTimer;
    // Add a flag to track if we've just activated a section
    let activationTime = Date.now();
    const activationDelay = 700; // Delay in ms to prevent accidental navigation right after section change

    // Start background zoom animation
    initBackgroundAnimation();

    // Fix display styles of all sections first
    sections.forEach(section => {
        section.style.display = 'none';
        section.style.opacity = '0';
        section.style.visibility = 'hidden';

        // Ensure section-inner has correct styles
        const sectionInner = section.querySelector('.section-inner');
        if (sectionInner) {
            sectionInner.style.opacity = '1';
            sectionInner.style.visibility = 'visible';
            sectionInner.style.display = 'flex';
        }
    });

    // Find the active section on page load based on URL hash
    const initialHash = window.location.hash;
    let targetSectionIndex = 0; // Default to first section

    if (initialHash) {
        const targetSection = document.querySelector(initialHash);
        if (targetSection) {
            // Find the index of the section with this ID
            for (let i = 0; i < sections.length; i++) {
                if (sections[i].id === targetSection.id) {
                    targetSectionIndex = i;
                    break;
                }
            }
        }
    }

    // Force activate the target section
    forceActivateSection(targetSectionIndex);
    currentSectionIndex = targetSectionIndex;

    // Initial setup
    initProgressIndicator();
    initScrollIndicator();
    initMobileMenu();
    initContactProtection();
    initPolicyCards(); // Initialize policy cards
    setupNavigationEvents();
    addNavigationSafeguards();
    calculateSectionDimensions(); // Calculate dimensions after all elements are created

    // Recalculate on resize
    window.addEventListener('resize', calculateSectionDimensions);

    // Initialize AOS and animate the initial section
    initAOS();
    animateSection(sections[currentSectionIndex].id);

    /**
     * Force activate a section without animations
     */
    function forceActivateSection(index) {
        // Deactivate all sections first
        sections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
            section.style.opacity = '0';
            section.style.visibility = 'hidden';
        });

        // Activate the target section
        const targetSection = sections[index];
        targetSection.classList.add('active');
        targetSection.style.display = 'block';
        targetSection.style.opacity = '1';
        targetSection.style.visibility = 'visible';

        // Ensure inner content is visible
        const innerContent = targetSection.querySelector('.section-inner');
        if (innerContent) {
            innerContent.style.opacity = '1';
            innerContent.style.visibility = 'visible';
            innerContent.style.display = 'flex';
        }

        currentSectionIndex = index;
        updateNavigation();
    }

    /**
     * Initialize background animation with GSAP
     */
    function initBackgroundAnimation() {
        if (typeof gsap !== 'undefined') {
            const background = document.querySelector('.page-background');
            if (background) {
                // Add zoom class
                background.classList.add('zoom-bg');

                // Use GSAP for smoother animation control
                gsap.set(background, { transformOrigin: 'center center' });
            }
        }
    }

    /**
     * Add navigation safeguards to prevent accidental navigation
     */
    function addNavigationSafeguards() {
        // Add debounce function to prevent rapid firing of scroll events
        let debounceTimer;
        const debounce = (callback, time) => {
            window.clearTimeout(debounceTimer);
            debounceTimer = window.setTimeout(callback, time);
        };

        // Track if we're checking scroll position to avoid triggering multiple times
        let isCheckingScroll = false;

        // Add a cooldown period to prevent rapid toggling
        let lastToggleTime = 0;
        const toggleCooldown = 1000; // 1 second cooldown between state changes

        sections.forEach(section => {
            const sectionInner = section.querySelector('.section-inner');
            if (sectionInner) {
                // Create safeguard element if it doesn't exist already
                let safeguard = section.querySelector('.navigation-safeguard');
                if (!safeguard) {
                    safeguard = document.createElement('div');
                    safeguard.className = 'navigation-safeguard';
                    safeguard.innerHTML = `
                        <div class="message">
                            Vaihda seuraavaan osioon?
                            <button class="confirm-btn">Kyllä</button>
                        </div>
                    `;

                    // Add to section
                    sectionInner.appendChild(safeguard);
                }

                // Add event listener to the confirm button
                const confirmBtn = safeguard.querySelector('.confirm-btn');
                confirmBtn.addEventListener('click', function() {
                    safeguard.classList.remove('active');
                    safeguardActive = false;

                    // Navigate to next section after confirmation
                    navigateToSection(currentSectionIndex + 1);
                });

                // Improved scroll detection with debouncing
                sectionInner.addEventListener('scroll', function() {
                    // Only process if not currently checking and this is the active section
                    if (isCheckingScroll || !section.classList.contains('active')) return;

                    // Set flag to prevent multiple simultaneous checks
                    isCheckingScroll = true;

                    // Use debounce to prevent rapid firing - increased to 300ms
                    debounce(() => {
                        // Only check if this is still the active section
                        if (!section.classList.contains('active')) {
                            isCheckingScroll = false;
                            return;
                        }

                        // Get the actual content height vs visible height
                        const scrollHeight = this.scrollHeight;
                        const scrollTop = this.scrollTop;
                        const clientHeight = this.clientHeight;

                        // Calculate the distance from bottom in pixels
                        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

                        // Use different thresholds for showing vs hiding to prevent flickering
                        const showThreshold = 50; // Show when within 50px of bottom
                        const hideThreshold = 100; // Hide only when 100px away from bottom

                        // Check if we've scrolled enough content to warrant safeguard
                        const hasScrolledEnough = scrollHeight > (clientHeight + 100);

                        // Get current time for cooldown check
                        const now = Date.now();

                        if (distanceFromBottom <= showThreshold && !safeguardActive && !isNavigating && hasScrolledEnough) {
                            // Only toggle if we're outside the cooldown period
                            if (now - lastToggleTime > toggleCooldown) {
                                // Show safeguard
                                clearTimeout(safeguardTimer);

                                if (safeguard) {
                                    console.log("Showing safeguard");
                                    safeguard.classList.add('active');
                                    safeguardActive = true;
                                    lastToggleTime = now;

                                    // Auto-hide after 3 seconds
                                    safeguardTimer = setTimeout(() => {
                                        if (safeguardActive) {
                                            console.log("Auto-hiding safeguard after timeout");
                                            safeguard.classList.remove('active');
                                            safeguardActive = false;
                                            lastToggleTime = Date.now();
                                        }
                                    }, 3000);
                                }
                            }
                        } else if (distanceFromBottom > hideThreshold && safeguardActive) {
                            // Only hide if outside the cooldown period
                            if (now - lastToggleTime > toggleCooldown) {
                                if (safeguard) {
                                    console.log("Hiding safeguard - scrolled away");
                                    safeguard.classList.remove('active');
                                    safeguardActive = false;
                                    lastToggleTime = now;
                                    clearTimeout(safeguardTimer);
                                }
                            }
                        }

                        // Reset the checking flag
                        isCheckingScroll = false;
                    }, 300); // Increased debounce delay to 300ms
                }, { passive: true });

                // Force an initial scroll check when the section becomes active - with longer delay
                section.addEventListener('transitionend', function(e) {
                    // Only trigger for opacity transitions on this section
                    if (e.propertyName === 'opacity' && section.classList.contains('active')) {
                        // Add longer delay before checking
                        setTimeout(() => {
                            if (section.classList.contains('active')) {
                                const scrollEvent = new Event('scroll');
                                sectionInner.dispatchEvent(scrollEvent);
                            }
                        }, 1000); // Increased to 1 second delay
                    }
                });
            }
        });

        // Add global check for when sections change
        document.addEventListener('sectionChanged', function() {
            // Reset any active safeguards
            document.querySelectorAll('.navigation-safeguard.active').forEach(safeguard => {
                safeguard.classList.remove('active');
            });

            // Reset safeguard state
            safeguardActive = false;
            clearTimeout(safeguardTimer);
            lastToggleTime = Date.now(); // Reset the toggle time

            // Get the current active section
            const activeSection = sections[currentSectionIndex];
            const activeSectionInner = activeSection?.querySelector('.section-inner');

            // Check if we should show the safeguard (with longer delay)
            if (activeSectionInner) {
                setTimeout(() => {
                    if (!safeguardActive && !isNavigating) {
                        const scrollHeight = activeSectionInner.scrollHeight;
                        const scrollTop = activeSectionInner.scrollTop;
                        const clientHeight = activeSectionInner.clientHeight;

                        // Only check if there's enough content to warrant showing safeguard
                        if (scrollHeight > clientHeight + 100) {
                            // Calculate if already at bottom
                            const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
                            const isNearBottom = distanceFromBottom <= 50;

                            if (isNearBottom) {
                                const safeguard = activeSection.querySelector('.navigation-safeguard');
                                if (safeguard) {
                                    console.log("Auto-showing safeguard on section change");
                                    safeguard.classList.add('active');
                                    safeguardActive = true;
                                    lastToggleTime = Date.now(); // Update toggle time

                                    safeguardTimer = setTimeout(() => {
                                        if (safeguardActive) {
                                            safeguard.classList.remove('active');
                                            safeguardActive = false;
                                            lastToggleTime = Date.now(); // Update toggle time
                                        }
                                    }, 3000);
                                }
                            }
                        }
                    }
                }, 1500); // Longer delay to ensure everything is settled
            }
        });
    }

    /**
     * Create progress indicator for navigation
     */
    function initProgressIndicator() {
        // Create progress indicator
        const progressIndicator = document.createElement('div');
        progressIndicator.className = 'progress-indicator';
        document.body.appendChild(progressIndicator);

        // Create progress dots
        for (let i = 0; i < sections.length; i++) {
            const dot = document.createElement('div');
            dot.className = 'progress-dot';
            if (i === currentSectionIndex) {
                dot.classList.add('active');
            }
            dot.addEventListener('click', function() {
                navigateToSection(i);
            });
            progressIndicator.appendChild(dot);
        }
    }

    /**
     * Create scroll indicator at the bottom of the page
     */
    function initScrollIndicator() {
        const scrollIndicator = document.createElement('div');
        scrollIndicator.className = 'scroll-indicator';
        scrollIndicator.innerHTML = `
            <span>Vieritä sisältöä</span>
            <div class="mouse"></div>
        `;
        document.body.appendChild(scrollIndicator);

        // Auto-hide scroll indicator after 5 seconds
        setTimeout(() => {
            scrollIndicator.style.opacity = '0';
            setTimeout(() => {
                scrollIndicator.style.display = 'none';
            }, 500);
        }, 5000);
    }

    /**
     * Function to navigate to a specific section by index
     */
    function navigateToSection(sectionIndex) {
        if (sectionIndex < 0 || sectionIndex >= sections.length || sectionIndex === currentSectionIndex || isNavigating) {
            return;
        }

        isNavigating = true;
        safeguardActive = false; // Reset safeguard state

        // Hide any active safeguards
        const activeSafeguard = document.querySelector('.navigation-safeguard.active');
        if (activeSafeguard) {
            activeSafeguard.classList.remove('active');
        }

        const currentSection = sections[currentSectionIndex];
        const targetSection = sections[sectionIndex];

        // Use GSAP for smooth transitions if available
        if (typeof gsap !== 'undefined') {
            // First make sure target section is ready to be animated
            gsap.set(targetSection, {
                display: 'block',
                opacity: 0,
                visibility: 'visible',
            });

            // Make sure inner content of target section is ready
            const targetInner = targetSection.querySelector('.section-inner');
            if (targetInner) {
                gsap.set(targetInner, {
                    opacity: 1,
                    visibility: 'visible',
                    display: 'flex'
                });
            }

            // Create transition timeline
            gsap.timeline({
                onComplete: () => {
                    isNavigating = false;
                    // Set the activation time to prevent immediate navigation
                    activationTime = Date.now();

                    // Reset scroll position to top for the new section
                    const targetSectionInner = targetSection.querySelector('.section-inner');
                    if (targetSectionInner) {
                        targetSectionInner.scrollTop = 0;

                        // Double-check visibility after animation
                        gsap.set(targetSectionInner, {
                            opacity: 1,
                            visibility: 'visible',
                            display: 'flex'
                        });
                    }

                    // Force display on section
                    gsap.set(targetSection, {
                        display: 'block',
                        opacity: 1,
                        visibility: 'visible'
                    });

                    // Log for debugging
                    console.log('Section navigation complete to: ' + targetSection.id);
                }
            })
            // Fade out current section content
            .to(currentSection.querySelector('.section-inner'), {
                opacity: 0,
                y: -30,
                duration: 0.6,
                ease: 'power2.inOut',
                onComplete: () => {
                    currentSection.classList.remove('active');
                    gsap.set(currentSection, {
                        visibility: 'hidden',
                        display: 'none'
                    });
                }
            })
            .add(() => {
                // Activate new section
                targetSection.classList.add('active');
                currentSectionIndex = sectionIndex;
                updateNavigation();

                // Animate the section elements
                animateSection(targetSection.id);

                // Dispatch event for section change (for AOS refresh)
                document.dispatchEvent(new Event('sectionChanged'));
            })
            // Fade in target section content
            .fromTo(targetSection.querySelector('.section-inner'),
                { opacity: 0, y: 30, visibility: 'visible', display: 'flex' },
                {
                    opacity: 1,
                    y: 0,
                    visibility: 'visible',
                    display: 'flex',
                    duration: 0.8,
                    ease: 'power2.out'
                }
            );
        } else {
            // Fallback without GSAP
            currentSection.classList.remove('active');
            currentSection.style.display = 'none';
            currentSection.style.opacity = '0';
            currentSection.style.visibility = 'hidden';

            targetSection.classList.add('active');
            targetSection.style.display = 'block';
            targetSection.style.opacity = '1';
            targetSection.style.visibility = 'visible';

            currentSectionIndex = sectionIndex;
            updateNavigation();
            isNavigating = false;
            activationTime = Date.now();

            // Reset scroll position and ensure visibility
            const targetSectionInner = targetSection.querySelector('.section-inner');
            if (targetSectionInner) {
                targetSectionInner.scrollTop = 0;
                targetSectionInner.style.opacity = '1';
                targetSectionInner.style.visibility = 'visible';
                targetSectionInner.style.display = 'flex';
            }

            // Animate section
            animateSection(targetSection.id);

            // Dispatch event for section change
            document.dispatchEvent(new Event('sectionChanged'));
        }

        // Update URL hash without scrolling
        const sectionId = sections[sectionIndex].id;
        history.pushState(null, null, `#${sectionId}`);
    }

    /**
     * Initialize AOS animations
     */
    function initAOS() {
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true, // Changed to true to improve performance
                mirror: false,
                disable: 'mobile',
                startEvent: 'DOMContentLoaded', // Ensure AOS elements initialize on page load
                offset: 50,
                delay: 100
            });

            // Refresh AOS when changing sections to ensure animations trigger correctly
            document.addEventListener('sectionChanged', function() {
                setTimeout(function() {
                    AOS.refresh();
                }, 500);
            });

            // Initial refresh
            setTimeout(function() {
                AOS.refresh();
            }, 200);
        }
    }

    /**
     * Animate elements in a specific section using GSAP
     */
    function animateSection(sectionId) {
        if (typeof gsap === 'undefined') return;

        const section = document.getElementById(sectionId);
        if (!section) return;

        // Ensure the section is displayed and visible before animating
        gsap.set(section, {
            display: 'block',
            opacity: 1,
            visibility: 'visible'
        });

        // Also force-set inner to be visible
        const sectionInner = section.querySelector('.section-inner');
        if (sectionInner) {
            gsap.set(sectionInner, {
                opacity: 1,
                visibility: 'visible',
                display: 'flex'
            });
        }

        // Create a timeline for this section
        const tl = gsap.timeline();

        // Different animations based on section
        switch (sectionId) {
            case 'home':
                tl.from('.hero h1', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' })
                  .from('.hero h2', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
                  .from('.hero .intro', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
                  .from('.hero .cta-buttons', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6');
                break;

            case 'about':
                tl.from('.about .section-title', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' })
                  .from('.about-image img', { x: -30, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
                  .from('.about-text p', { y: 20, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out' }, '-=0.4')
                  .from('.theme-card', { y: 30, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'back.out(1.7)' }, '-=0.8');
                break;

            case 'policies':
                // First ensure the section and container are visible
                gsap.set('#policies', {
                    opacity: 1,
                    visibility: 'visible',
                    display: 'block'
                });

                // Then animate the content
                tl.from('.policies .section-title', {
                        y: 30,
                        opacity: 0,
                        duration: 0.8,
                        ease: 'power3.out',
                        onComplete: function() {
                            // After title animation, ensure grid is properly displayed
                            gsap.set('.policy-grid', {
                                display: 'grid',
                                opacity: 1,
                                visibility: 'visible'
                            });
                        }
                    })
                    .from('.policy-card', {
                        y: 30,
                        opacity: 0,
                        duration: 0.6,
                        stagger: 0.12,
                        ease: 'power2.out',
                        onStart: function() {
                            console.log('Animating policy cards');
                        }
                    });

                // Make sure we delay this a bit to ensure everything is visible
                setTimeout(() => {
                    console.log('Additional visibility check for Politika section');
                    document.querySelectorAll('.policy-card').forEach(card => {
                        card.style.opacity = '1';
                        card.style.visibility = 'visible';
                    });

                    const grid = document.querySelector('.policy-grid');
                    if (grid) {
                        grid.style.opacity = '1';
                        grid.style.visibility = 'visible';
                        grid.style.display = 'grid';
                    }
                }, 500);
                break;

            case 'achievements':
                tl.from('.achievements .section-title', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' })
                  .from('.timeline-item', { x: -50, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out' }, '-=0.4');
                break;

            case 'contact':
                tl.from('.contact .section-title', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' })
                  .from('.info-item', { y: 30, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'back.out(1.7)' }, '-=0.4');
                break;
        }

        // Refresh AOS animations if present
        if (typeof AOS !== 'undefined') {
            setTimeout(() => {
                AOS.refresh();
            }, 500);
        }
    }

    /**
     * Initialize mobile menu
     */
    function initMobileMenu() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const nav = document.querySelector('nav');

        if (mobileMenuBtn && nav) {
            mobileMenuBtn.addEventListener('click', function() {
                this.classList.toggle('active');
                nav.classList.toggle('active');
            });

            // Close menu when clicking on links
            const navLinks = nav.querySelectorAll('a');
            navLinks.forEach(link => {
                link.addEventListener('click', function() {
                    mobileMenuBtn.classList.remove('active');
                    nav.classList.remove('active');
                });
            });
        }
    }

    /**
     * Initialize contact protection features
     */
    function initContactProtection() {
        // Protect email address
        const protectEmail = () => {
            const emailElement = document.querySelector('.protected-email');
            if (emailElement) {
                const user = 'angelmoon1992';
                const domain = 'gmail.com';

                // Check if email was previously revealed
                const emailRevealed = localStorage.getItem('emailRevealed') === 'true';

                if (emailRevealed) {
                    emailElement.textContent = `${user}@${domain}`;
                } else {
                    // Create reveal button
                    const emailButton = document.createElement('button');
                    emailButton.className = 'btn primary-btn';
                    emailButton.textContent = 'Näytä sähköpostiosoite';
                    emailButton.addEventListener('click', function() {
                        emailElement.textContent = `${user}@${domain}`;
                        emailButton.style.display = 'none';
                        localStorage.setItem('emailRevealed', 'true');
                    });

                    emailElement.textContent = '';
                    emailElement.appendChild(emailButton);
                }
            }
        };

        // Protect phone number
        const protectPhone = () => {
            const phoneElement = document.querySelector('.protected-phone');
            if (phoneElement) {
                const countryCode = '+358';
                const firstPart = '44';
                const secondPart = '321';
                const thirdPart = '9126';

                // Check if phone was previously revealed
                const phoneRevealed = localStorage.getItem('phoneRevealed') === 'true';

                if (phoneRevealed) {
                    phoneElement.textContent = `${countryCode} ${firstPart}${secondPart}${thirdPart}`;
                } else {
                    // Create reveal button
                    const phoneButton = document.createElement('button');
                    phoneButton.className = 'btn secondary-btn';
                    phoneButton.textContent = 'Näytä puhelinnumero';
                    phoneButton.addEventListener('click', function() {
                        phoneElement.textContent = `${countryCode} ${firstPart}${secondPart}${thirdPart}`;
                        phoneButton.style.display = 'none';
                        localStorage.setItem('phoneRevealed', 'true');
                    });

                    phoneElement.textContent = '';
                    phoneElement.appendChild(phoneButton);
                }
            }
        };

        // Initialize contact protection
        protectEmail();
        protectPhone();
    }

    /**
     * Initialize policy cards with proper attributes
     */
    function initPolicyCards() {
        const policyCards = document.querySelectorAll('.policy-card');
        if (policyCards.length) {
            policyCards.forEach((card, index) => {
                // Set initial visibility
                card.style.opacity = '1';
                card.style.visibility = 'visible';

                // Add data-aos attributes for additional animation support
                card.setAttribute('data-aos', 'fade-up');
                card.setAttribute('data-aos-delay', (index * 100).toString());

                // Ensure cards are displayed properly
                card.style.display = 'flex';
            });

            // Ensure the grid itself is visible
            const policyGrid = document.querySelector('.policy-grid');
            if (policyGrid) {
                policyGrid.style.opacity = '1';
                policyGrid.style.visibility = 'visible';
                policyGrid.style.display = 'grid';
            }
        }
    }

    /**
     * Set up navigation event listeners
     */
    function setupNavigationEvents() {
        // Navigation links
        const navLinks = document.querySelectorAll('nav a, .footer-nav a, .cta-buttons a');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Get target section
                const targetId = this.getAttribute('href');

                // Only handle internal links (starting with #)
                if (targetId && targetId.startsWith('#')) {
                    e.preventDefault();
                    const targetSection = document.querySelector(targetId);

                    // Find section index
                    if (targetSection) {
                        for (let i = 0; i < sections.length; i++) {
                            if (sections[i].id === targetSection.id.replace('#', '')) {
                                navigateToSection(i);
                                break;
                            }
                        }
                    }
                }
            });
        });

        // Mouse wheel navigation - Re-enabled for section navigation
        window.addEventListener('wheel', function(e) {
            // Get current section inner content
            const currentSectionInner = sections[currentSectionIndex].querySelector('.section-inner');
            if (!currentSectionInner) return;

            const now = Date.now();

            // Add delay check to prevent accidental navigation
            if (now - activationTime < activationDelay) return;

            // Check if we can scroll in the current section
            const isAtTop = currentSectionInner.scrollTop <= 0;
            const isAtBottom = currentSectionInner.scrollHeight - currentSectionInner.scrollTop <= currentSectionInner.clientHeight + 5;

            // Only prevent default when we need to navigate between sections
            if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
                e.preventDefault();

                // Accumulate wheel delta for section navigation
                wheelDelta += e.deltaY;

                // Reset after a delay if no scrolling occurs
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    wheelDelta = 0;
                }, 200);

                // Check if we've reached the threshold to navigate
                if (Math.abs(wheelDelta) >= wheelThreshold) {
                    if (wheelDelta > 0 && isAtBottom) {
                        // Scrolling down at bottom
                        if (safeguardActive) {
                            // If safeguard is active, hide it and navigate
                            const activeSafeguard = document.querySelector('.navigation-safeguard.active');
                            if (activeSafeguard) {
                                activeSafeguard.classList.remove('active');
                                safeguardActive = false;
                            }
                            navigateToSection(currentSectionIndex + 1);
                        } else {
                            // Show safeguard if not already shown
                            if (!safeguardActive) {
                                const currentSafeguard = sections[currentSectionIndex].querySelector('.navigation-safeguard');
                                if (currentSafeguard) {
                                    currentSafeguard.classList.add('active');
                                    safeguardActive = true;

                                    // Auto-hide after 3 seconds
                                    clearTimeout(safeguardTimer);
                                    safeguardTimer = setTimeout(() => {
                                        currentSafeguard.classList.remove('active');
                                        safeguardActive = false;
                                    }, 3000);
                                }
                            }
                        }
                    } else if (wheelDelta < 0 && isAtTop) {
                        // Scrolling up at top - navigate to previous section
                        navigateToSection(currentSectionIndex - 1);
                    }

                    // Reset delta after navigation
                    wheelDelta = 0;
                }
            }
            // Let default behavior occur for normal scrolling within section
        }, { passive: false }); // Must be non-passive to call preventDefault

        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            const now = Date.now();
            // Add delay check to prevent accidental navigation
            if (now - activationTime < activationDelay) return;

            // Handle navigation keys
            if (e.key === 'ArrowDown' || e.key === 'PageDown') {
                // Check if safeguard is active - directly navigate if so
                if (safeguardActive) {
                    // Hide safeguard
                    const activeSafeguard = document.querySelector('.navigation-safeguard.active');
                    if (activeSafeguard) {
                        activeSafeguard.classList.remove('active');
                        safeguardActive = false;
                    }
                    navigateToSection(currentSectionIndex + 1);
                }
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                navigateToSection(currentSectionIndex - 1);
            } else if (e.key === 'Home') {
                navigateToSection(0);
            } else if (e.key === 'End') {
                navigateToSection(sections.length - 1);
            }
        });

        // Touch navigation for mobile
        document.addEventListener('touchstart', function(e) {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', function(e) {
            const now = Date.now();
            // Add delay check to prevent accidental navigation
            if (now - activationTime < activationDelay) return;

            touchEndY = e.changedTouches[0].clientY;
            const touchDiff = touchStartY - touchEndY;

            // Only handle significant swipes
            if (Math.abs(touchDiff) > 100) { // Increased threshold for better control
                if (touchDiff > 0 && safeguardActive) {
                    // Swiping up - only navigate if safeguard is already active
                    // Hide safeguard
                    const activeSafeguard = document.querySelector('.navigation-safeguard.active');
                    if (activeSafeguard) {
                        activeSafeguard.classList.remove('active');
                        safeguardActive = false;
                    }
                    navigateToSection(currentSectionIndex + 1);
                } else if (touchDiff < 0) {
                    // Swiping down - navigate to previous section
                    navigateToSection(currentSectionIndex - 1);
                }
            }
        }, { passive: true });

        // Handle hash changes from browser back/forward buttons
        window.addEventListener('hashchange', function() {
            const hash = window.location.hash;
            if (hash) {
                const targetSection = document.querySelector(hash);
                if (targetSection) {
                    for (let i = 0; i < sections.length; i++) {
                        if (sections[i].id === targetSection.id) {
                            if (i !== currentSectionIndex) {
                                navigateToSection(i);
                            }
                            break;
                        }
                    }
                }
            } else {
                // No hash, go to first section
                if (currentSectionIndex !== 0) {
                    navigateToSection(0);
                }
            }
        });
    }

    /**
     * Update navigation elements based on current section
     */
    function updateNavigation() {
        // Update progress dots
        const dots = document.querySelectorAll('.progress-dot');
        dots.forEach((dot, index) => {
            if (index === currentSectionIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });

        // Update navigation links
        const navLinks = document.querySelectorAll('nav a');
        navLinks.forEach(link => {
            const href = link.getAttribute('href').replace('#', '');
            if (href === sections[currentSectionIndex].id) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Update body class to indicate current section
        document.body.className = `section-${sections[currentSectionIndex].id}`;
    }

    /**
     * Calculate and apply proper dimensions for sections based on viewport
     */
    function calculateSectionDimensions() {
        // Get header and footer heights
        const header = document.querySelector('.main-header');
        const footer = document.querySelector('.main-footer');
        const headerHeight = header ? header.offsetHeight : 80; // Default if not found
        const footerHeight = footer ? footer.offsetHeight : 50; // Updated default to match new footer size

        // Calculate available height for sections
        const viewportHeight = window.innerHeight;
        const availableHeight = viewportHeight - headerHeight - footerHeight;

        // Apply to all section-inners
        document.querySelectorAll('.section-inner').forEach(sectionInner => {
            // Set a min-height to ensure content has room to display
            sectionInner.style.minHeight = `${availableHeight}px`;

            // Ensure bottom padding is sufficient to prevent content hiding behind footer
            // Increased buffer from 20px to 30px for better spacing
            const currentPaddingBottom = parseInt(window.getComputedStyle(sectionInner).paddingBottom);
            const neededPadding = footerHeight + 30;

            if (currentPaddingBottom < neededPadding) {
                sectionInner.style.paddingBottom = `${neededPadding}px`;
            }
        });

        // Update navigation safeguard positions
        document.querySelectorAll('.navigation-safeguard').forEach(safeguard => {
            safeguard.style.bottom = `${footerHeight}px`;
        });

        // Ensure policy grid has proper spacing and all cards are visible
        const policyGrid = document.querySelector('.policy-grid');
        if (policyGrid) {
            // Make sure grid is displayed properly
            policyGrid.style.display = 'grid';
            policyGrid.style.opacity = '1';
            policyGrid.style.visibility = 'visible';

            // Add bottom margin to ensure last row doesn't touch footer
            policyGrid.style.marginBottom = '30px';
        }
    }
});