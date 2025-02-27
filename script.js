document.addEventListener('DOMContentLoaded', function() {
    // Get all sections
    const sections = document.querySelectorAll('.section');
    const totalSections = sections.length;

    // Track the current active section
    let currentSection = 0;

    // Set initial state - first section is active
    sections[0].classList.add('active');

    // Add a scroll indicator
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator';
    scrollIndicator.innerHTML = `
        <span>Scroll to navigate</span>
        <div class="mouse"></div>
    `;
    document.body.appendChild(scrollIndicator);

    // Create a full-page overlay
    const transitionOverlay = document.createElement('div');
    transitionOverlay.className = 'transition-overlay';
    document.body.appendChild(transitionOverlay);

    // Add progress indicator
    const progressIndicator = document.createElement('div');
    progressIndicator.className = 'progress-indicator';

    for (let i = 0; i < totalSections; i++) {
        const dot = document.createElement('div');
        dot.className = 'progress-dot';
        if (i === 0) dot.classList.add('active');

        // Use an IIFE to capture the current index
        (function(index) {
            dot.addEventListener('click', function() {
                navigateToSection(index);
            });
        })(i);

        progressIndicator.appendChild(dot);
    }

    document.body.appendChild(progressIndicator);

    // Handle protected contact information
    const protectEmail = () => {
        const emailElement = document.querySelector('.protected-email');
        if (emailElement) {
            // Split email components to make it harder for bots to scrape
            const user = 'angelmoon1992';
            const domain = 'gmail.com';

            // Check if email was previously revealed
            const emailRevealed = localStorage.getItem('emailRevealed') === 'true';

            if (emailRevealed) {
                // If previously revealed, show it directly
                emailElement.textContent = `${user}@${domain}`;
            } else {
                // Create a button to reveal email that matches site design
                const emailButton = document.createElement('button');
                emailButton.className = 'btn primary-btn';
                emailButton.textContent = 'Näytä sähköpostiosoite';
                emailButton.addEventListener('click', function() {
                    emailElement.textContent = `${user}@${domain}`;
                    emailButton.style.display = 'none';
                    // Remember this choice
                    localStorage.setItem('emailRevealed', 'true');
                });

                emailElement.textContent = '';
                emailElement.appendChild(emailButton);
            }
        }
    };

    const protectPhone = () => {
        const phoneElement = document.querySelector('.protected-phone');
        if (phoneElement) {
            // Split phone number to make it harder for bots to scrape
            const countryCode = '+358';
            const firstPart = '44';
            const secondPart = '321';
            const thirdPart = '9126';

            // Check if phone was previously revealed
            const phoneRevealed = localStorage.getItem('phoneRevealed') === 'true';

            if (phoneRevealed) {
                // If previously revealed, show it directly
                phoneElement.textContent = `${countryCode} ${firstPart}${secondPart}${thirdPart}`;
            } else {
                // Create a button to reveal phone that matches site design
                const phoneButton = document.createElement('button');
                phoneButton.className = 'btn secondary-btn';
                phoneButton.textContent = 'Näytä puhelinnumero';
                phoneButton.addEventListener('click', function() {
                    phoneElement.textContent = `${countryCode} ${firstPart}${secondPart}${thirdPart}`;
                    phoneButton.style.display = 'none';
                    // Remember this choice
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

    // Track scroll state
    let isScrolling = false;
    let lastScrollTime = Date.now();
    let scrollTimeout;
    let wheelDeltaAccumulator = 0; // Track wheel movement
    const wheelThreshold = 80; // Threshold before section change

    // Disable regular scrolling and use our custom navigation instead
    document.body.style.overflow = 'hidden';

    // Setup the scroll event with wheel
    document.addEventListener('wheel', function(e) {
        const activeSection = sections[currentSection];
        const container = activeSection.querySelector('.container');

        // For scrolling within a section's container
        if (container && container.scrollHeight > container.clientHeight) {
            const scrollingDown = e.deltaY > 0;
            const scrolledToBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 5;
            const scrolledToTop = container.scrollTop <= 0;

            // If not at extremes, handle regular content scrolling
            if ((scrollingDown && !scrolledToBottom) || (!scrollingDown && !scrolledToTop)) {
                // Regular content scrolling - reset accumulator
                wheelDeltaAccumulator = 0;
                return; // Let the browser handle normal content scrolling
            }

            // At the edge of content (top or bottom), start accumulating wheel delta
            if ((scrollingDown && scrolledToBottom) || (!scrollingDown && scrolledToTop)) {
                wheelDeltaAccumulator += Math.abs(e.deltaY);

                // Only trigger section change after sufficient wheel movement
                if (wheelDeltaAccumulator < wheelThreshold) {
                    e.preventDefault();
                    return; // Don't change section until threshold is reached
                }

                // Reset accumulator when threshold is reached
                wheelDeltaAccumulator = 0;
            }
        }

        // Prevent default scrolling for section navigation
        e.preventDefault();

        // Rate limiting - don't allow scrolling too frequently
        const now = Date.now();
        if (now - lastScrollTime < 800 || isScrolling) return;
        lastScrollTime = now;

        // Determine scroll direction
        if (e.deltaY > 0) {
            // Scroll down - next section
            navigateToSection(currentSection + 1);
        } else {
            // Scroll up - previous section
            navigateToSection(currentSection - 1);
        }
    }, { passive: false });

    // Navigate with keyboard
    document.addEventListener('keydown', function(e) {
        if (isScrolling) return;

        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            navigateToSection(currentSection + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            navigateToSection(currentSection - 1);
        }
    });

    // Function to navigate to a specific section
    function navigateToSection(sectionIndex) {
        // Ensure we're within bounds
        if (sectionIndex < 0 || sectionIndex >= totalSections || isScrolling) {
            return;
        }

        // Reset wheel accumulator
        wheelDeltaAccumulator = 0;

        // REMOVED the forced scroll to bottom code that was here
        // Now we'll immediately transition to the next section

        isScrolling = true;

        // First make the overlay visible
        transitionOverlay.classList.add('active');

        // Hide current section after a small delay (let overlay become visible first)
        setTimeout(() => {
            // Hide current section
            sections[currentSection].classList.remove('active');
            sections[currentSection].style.opacity = '0';
            sections[currentSection].style.visibility = 'hidden';
            sections[currentSection].style.zIndex = '1';

            // Update current section index
            currentSection = sectionIndex;

            // Update all sections
            sections.forEach((section, index) => {
                if (index === currentSection) {
                    // Set higher z-index for active section
                    section.classList.add('active');
                    section.style.zIndex = '50';
                    section.style.opacity = '1';
                    section.style.visibility = 'visible';

                    // Reset scroll position of new section
                    const container = section.querySelector('.container');
                    if (container) {
                        container.scrollTop = 0;
                    }

                    // Ensure section content is visible
                    const sectionContent = section.querySelector('.about-content, .contact-content');
                    if (sectionContent) {
                        sectionContent.style.opacity = '1';
                        sectionContent.style.visibility = 'visible';
                        sectionContent.style.zIndex = '10';
                    }

                    // Make sure the container is visible too
                    if (container) {
                        container.style.opacity = '1';
                        container.style.visibility = 'visible';
                        container.style.zIndex = '5';
                    }
                } else {
                    section.classList.remove('active');
                    section.style.zIndex = '1';
                    section.style.opacity = '0';
                    section.style.visibility = 'hidden';
                }
            });

            // Update progress dots
            const dots = progressIndicator.querySelectorAll('.progress-dot');
            dots.forEach((dot, index) => {
                if (index === currentSection) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });

            // Wait a bit before removing the overlay
            setTimeout(() => {
                // Hide the overlay
                transitionOverlay.classList.remove('active');

                // Update aria-current for accessibility
                updateAriaCurrentForNav();

                // Allow scrolling again after transition completes
                setTimeout(() => {
                    isScrolling = false;
                }, 400);
            }, 200);
        }, 300);
    }

    // Setup navigation links to navigate to sections
    const navLinks = document.querySelectorAll('nav a, .footer-nav a, .cta-buttons a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Prevent default link behavior
            e.preventDefault();

            // Get the target section ID from the href
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            // Find the index of the target section
            const targetIndex = Array.from(sections).indexOf(targetSection);

            // Navigate to the target section
            if (targetIndex > -1) {
                navigateToSection(targetIndex);
            }
        });
    });

    // Update aria-current for accessibility
    function updateAriaCurrentForNav() {
        navLinks.forEach(link => {
            const targetId = link.getAttribute('href');
            const isCurrentSection = targetId === '#' + sections[currentSection].id;

            if (isCurrentSection) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    // Initial aria setup
    updateAriaCurrentForNav();

    // Touch support for mobile
    let touchStartY = 0;
    let touchEndY = 0;

    document.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchend', function(e) {
        if (isScrolling) return;

        touchEndY = e.changedTouches[0].screenY;
        const touchDiff = touchStartY - touchEndY;

        // Determine if it was a significant swipe (not just a tap)
        if (Math.abs(touchDiff) < 50) return;

        if (touchDiff > 0) {
            // Swipe up - next section
            navigateToSection(currentSection + 1);
        } else {
            // Swipe down - previous section
            navigateToSection(currentSection - 1);
        }
    }, { passive: true });

    // Create an animated mobile menu toggle for responsive design
    if (window.innerWidth <= 768) {
        const header = document.querySelector('.main-header');

        // Create mobile menu button
        const mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.classList.add('mobile-menu-btn');
        mobileMenuBtn.innerHTML = '<span></span><span></span><span></span>';

        // Add to header
        header.querySelector('.container').appendChild(mobileMenuBtn);

        // Get the nav menu
        const nav = document.querySelector('nav');

        // Toggle menu on click
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            nav.classList.toggle('active');
        });

        // Add CSS for mobile menu in JS since it's a dynamic feature
        const style = document.createElement('style');
        style.textContent = `
            .mobile-menu-btn {
                display: block;
                background: none;
                border: none;
                width: 30px;
                height: 20px;
                position: relative;
                cursor: pointer;
                z-index: 1001;
            }

            .mobile-menu-btn span {
                display: block;
                position: absolute;
                height: 3px;
                width: 100%;
                background: var(--primary-color);
                border-radius: 3px;
                opacity: 1;
                left: 0;
                transform: rotate(0deg);
                transition: .25s ease-in-out;
            }

            .mobile-menu-btn span:nth-child(1) {
                top: 0;
            }

            .mobile-menu-btn span:nth-child(2) {
                top: 8px;
            }

            .mobile-menu-btn span:nth-child(3) {
                top: 16px;
            }

            .mobile-menu-btn.active span:nth-child(1) {
                top: 8px;
                transform: rotate(135deg);
            }

            .mobile-menu-btn.active span:nth-child(2) {
                opacity: 0;
                left: -60px;
            }

            .mobile-menu-btn.active span:nth-child(3) {
                top: 8px;
                transform: rotate(-135deg);
            }

            nav.active {
                display: block;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: white;
                z-index: 1000;
                padding: 80px 20px 20px;
            }

            nav.active ul {
                flex-direction: column;
                align-items: center;
            }

            nav.active ul li {
                margin: 1rem 0;
            }
        `;

        document.head.appendChild(style);
    }
});