document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------
    // 1. Theme Switcher (Light / Dark Mode)
    // ----------------------------------------
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Load theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
    } else {
        htmlElement.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
    }

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Minor visual feedback on button click
        themeToggleBtn.style.transform = 'scale(0.9) rotate(45deg)';
        setTimeout(() => {
            themeToggleBtn.style.transform = '';
        }, 150);
    });

    // ----------------------------------------
    // 2. Mobile Navigation Menu
    // ----------------------------------------
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const menuIcon = mobileMenuBtn.querySelector('i');

    const toggleMenu = () => {
        navMenu.classList.toggle('active');
        if (navMenu.classList.contains('active')) {
            menuIcon.classList.remove('fa-bars');
            menuIcon.classList.add('fa-xmark');
        } else {
            menuIcon.classList.remove('fa-xmark');
            menuIcon.classList.add('fa-bars');
        }
    };

    mobileMenuBtn.addEventListener('click', toggleMenu);

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') && 
            !navMenu.contains(e.target) && 
            !mobileMenuBtn.contains(e.target)) {
            toggleMenu();
        }
    });

    // ----------------------------------------
    // 3. Scroll-spy & Navbar Scroll Effect
    // ----------------------------------------
    const navbar = document.getElementById('navbar');
    const sections = document.querySelectorAll('section');
    const backToTopBtn = document.getElementById('back-to-top');

    const handleScroll = () => {
        const scrollY = window.scrollY;

        // Navbar shadow/background change
        if (scrollY > 50) {
            navbar.style.boxShadow = 'var(--card-shadow)';
            navbar.style.padding = '0.2rem 0';
        } else {
            navbar.style.boxShadow = 'none';
            navbar.style.padding = '0';
        }

        // Back-to-top button visibility
        if (scrollY > 500) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }

        // Scroll spy (Highlight active section link)
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', handleScroll);
    // Trigger once on load to establish starting point
    handleScroll();

    // Smooth Scroll to Top
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // ----------------------------------------
    // 4. Skills Filtering Logic
    // ----------------------------------------
    const filterButtons = document.querySelectorAll('.filter-btn');
    const skillCards = document.querySelectorAll('.skill-card');

    // Trigger skills bar animations
    const animateSkillBars = () => {
        const progressBars = document.querySelectorAll('.skill-bar-progress');
        progressBars.forEach(bar => {
            // Read target percent from styles and set width
            const targetWidth = bar.style.getPropertyValue('--percent');
            // Check if card is visible, if so animate it
            const parentCard = bar.closest('.skill-card');
            if (parentCard && !parentCard.classList.contains('hidden')) {
                bar.style.width = targetWidth;
            } else {
                bar.style.width = '0';
            }
        });
    };

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button styling
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterCategory = button.getAttribute('data-filter');

            skillCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                // Show/hide cards with a subtle scale transitions
                if (filterCategory === 'all' || cardCategory === filterCategory) {
                    card.classList.remove('hidden');
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.85)';
                    
                    // Force reflow
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.classList.add('hidden');
                }
            });

            // Re-run animations for visible cards
            animateSkillBars();
        });
    });

    // Animate skill bars when Skills section comes into view
    const skillsSection = document.getElementById('skills');
    const observerOptions = {
        root: null,
        threshold: 0.15
    };

    const skillsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateSkillBars();
                observer.unobserve(entry.target); // Animate once
            }
        });
    }, observerOptions);

    if (skillsSection) {
        skillsObserver.observe(skillsSection);
    }

    // ----------------------------------------
    // 5. Contact Form Interactive Validation
    // ----------------------------------------
    const contactForm = document.getElementById('contact-form');
    const contactSuccess = document.getElementById('contact-success');
    const resetFormBtn = document.getElementById('reset-form-btn');
    const inputs = contactForm.querySelectorAll('input, textarea');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate a single field
    const validateField = (field) => {
        const value = field.value.trim();
        const formGroup = field.closest('.form-group');
        let isValid = true;

        if (value === '') {
            isValid = false;
        } else if (field.type === 'email' && !emailRegex.test(value)) {
            isValid = false;
        }

        if (isValid) {
            formGroup.classList.remove('invalid');
        } else {
            formGroup.classList.add('invalid');
        }

        return isValid;
    };

    // Real-time validation on input/blur
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            if (input.closest('.form-group').classList.contains('invalid')) {
                validateField(input);
            }
        });
        
        input.addEventListener('blur', () => {
            validateField(input);
        });
    });

    // Handle form submission
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let isFormValid = true;
        inputs.forEach(input => {
            if (!validateField(input)) {
                isFormValid = false;
            }
        });

        if (isFormValid) {

    const submitBtn = document.getElementById('submit-btn');

    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };

    try {

        const response =     fetch("https://portfolio-backend-g0st.onrender.com'/contact", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
}

const result = await response.json();

        if (result.success) {

            contactForm.style.opacity = '0';

            setTimeout(() => {

                contactForm.classList.add('hidden');
                contactSuccess.classList.remove('hidden');
                contactSuccess.style.opacity = '1';

                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Send Message <i class="fa-solid fa-paper-plane"></i>';

            }, 300);

        } else {

            alert("Failed to send message.");

            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Send Message <i class="fa-solid fa-paper-plane"></i>';

        }

    } catch (error) {

        console.error(error);

        alert("Unable to connect to the server.");

        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send Message <i class="fa-solid fa-paper-plane"></i>';

    }
}
    });

    // Reset Form button action
    resetFormBtn.addEventListener('click', () => {
        contactSuccess.style.opacity = '0';
        
        setTimeout(() => {
            contactSuccess.classList.add('hidden');
            contactForm.reset();
            
            // Remove any leftover validation classes
            inputs.forEach(input => {
                input.closest('.form-group').classList.remove('invalid');
            });

            contactForm.classList.remove('hidden');
            // Force reflow
            setTimeout(() => {
                contactForm.style.opacity = '1';
            }, 50);
        }, 300);
    });
});
