// Multi-step form handling
let currentStep = 1;
const totalSteps = 8;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize progress bar to 0%
    updateProgress();
    
    const quoteForm = document.getElementById('quote-form');
    const zipcodeInput = document.getElementById('zipcode');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');

    // Format zipcode input to only allow numbers
    if (zipcodeInput) {
        zipcodeInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
            if (e.target.value.length > 5) {
                e.target.value = e.target.value.slice(0, 5);
            }
        });
    }

    // Format phone input
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 10) {
                value = value.slice(0, 10);
            }
            if (value.length >= 6) {
                e.target.value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
            } else if (value.length >= 3) {
                e.target.value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
            } else {
                e.target.value = value;
            }
        });
    }

    // Validate email
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            validateEmail(this);
        });
    }

    // Validate phone
    if (phoneInput) {
        phoneInput.addEventListener('blur', function() {
            validatePhone(this);
        });
    }

    // Handle form submission
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate final step
            if (validateStep(8)) {
                showSuccessMessage();
            }
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '#main-content') {
                return;
            }
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll effect to header
    let lastScroll = 0;
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    });
});

// Navigate to next step
function nextStep(step) {
    if (validateStep(step)) {
        if (step < totalSteps) {
            // Hide current step
            document.getElementById(`step${step}`).classList.remove('active');
            // Show next step
            document.getElementById(`step${step + 1}`).classList.add('active');
            currentStep = step + 1;
            updateProgress();
        }
    }
}

// Navigate to previous step
function prevStep(step) {
    if (step > 1) {
        // Hide current step
        document.getElementById(`step${step}`).classList.remove('active');
        // Show previous step
        document.getElementById(`step${step - 1}`).classList.add('active');
        currentStep = step - 1;
        updateProgress();
    }
}

// Validate step
function validateStep(step) {
    const stepElement = document.getElementById(`step${step}`);
    const requiredInputs = stepElement.querySelectorAll('input[required], select[required]');
    let isValid = true;

    requiredInputs.forEach(input => {
        if (input.type === 'radio') {
            const radioGroup = document.querySelectorAll(`input[name="${input.name}"]`);
            const isChecked = Array.from(radioGroup).some(radio => radio.checked);
            if (!isChecked) {
                isValid = false;
                showFieldError(input, 'Please select an option');
            } else {
                clearFieldError(input);
            }
        } else if (input.type === 'checkbox') {
            if (!input.checked) {
                isValid = false;
                showFieldError(input, 'You must agree to the terms');
            } else {
                clearFieldError(input);
            }
        } else {
            if (!input.value.trim()) {
                isValid = false;
                showFieldError(input, 'This field is required');
            } else {
                clearFieldError(input);
            }
        }
    });

    // Special validation for step 1 (zipcode)
    if (step === 1) {
        const zipcode = document.getElementById('zipcode').value;
        if (zipcode.length !== 5 || !/^\d{5}$/.test(zipcode)) {
            isValid = false;
            showFieldError(document.getElementById('zipcode'), 'Please enter a valid 5-digit zip code');
        }
    }

    // Special validation for step 8 (email and phone)
    if (step === 8) {
        const email = document.getElementById('email').value;
        const phone = document.getElementById('phone').value;
        if (!validateEmail(document.getElementById('email'))) {
            isValid = false;
        }
        if (!validatePhone(document.getElementById('phone'))) {
            isValid = false;
        }
    }

    return isValid;
}

// Select option for radio buttons
function selectOption(name, value) {
    const radio = document.getElementById(`${name}-${value}`);
    if (radio) {
        radio.checked = true;
        // Update visual selection
        const optionCards = document.querySelectorAll(`input[name="${name}"]`);
        optionCards.forEach(card => {
            const cardElement = card.closest('.option-card, .option-item');
            if (cardElement) {
                cardElement.classList.remove('selected');
            }
        });
        const selectedCard = radio.closest('.option-card, .option-item');
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
    }
}

// Update progress bar
function updateProgress() {
    // Progress starts at 0% on step 1 (nothing filled yet)
    // Progress increases as user completes steps
    // When on the last step, show 100%
    let progress;
    if (currentStep === 1) {
        progress = 0;
    } else if (currentStep === totalSteps) {
        progress = 100;
    } else {
        progress = ((currentStep - 1) / totalSteps) * 100;
    }
    
    const progressFill = document.getElementById('progressFill');
    const progressPercent = document.getElementById('progressPercent');
    
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }
    if (progressPercent) {
        progressPercent.textContent = `${Math.round(progress)}%`;
    }
}

// Validate email
function validateEmail(input) {
    const email = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errorElement = document.getElementById('emailError');
    
    if (!emailRegex.test(email)) {
        if (errorElement) {
            errorElement.textContent = 'Email is invalid';
            errorElement.style.display = 'block';
        }
        input.style.borderColor = '#dc3545';
        return false;
    } else {
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        input.style.borderColor = '';
        return true;
    }
}

// Validate phone
function validatePhone(input) {
    const phone = input.value.replace(/\D/g, '');
    const errorElement = document.getElementById('phoneError');
    
    if (phone.length !== 10) {
        if (errorElement) {
            errorElement.textContent = 'Phone is invalid';
            errorElement.style.display = 'block';
        }
        input.style.borderColor = '#dc3545';
        return false;
    } else {
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        input.style.borderColor = '';
        return true;
    }
}

// Show field error
function showFieldError(input, message) {
    input.style.borderColor = '#dc3545';
    // You can add error message display here if needed
}

// Clear field error
function clearFieldError(input) {
    input.style.borderColor = '';
}

// Show success message after form submission
function showSuccessMessage() {
    const formSection = document.querySelector('.form-section');
    const form = document.getElementById('quote-form');
    
    // Get form data
    const formData = new FormData(form);
    const zipcode = formData.get('zipcode');
    
    // Create success message
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <div style="background-color: #d4edda; color: #155724; padding: 30px; border-radius: 8px; margin-top: 20px; border: 1px solid #c3e6cb; text-align: center;">
            <h3 style="margin-bottom: 15px; color: #155724; font-size: 24px;">🎉 Thank You!</h3>
            <p style="margin-bottom: 10px; font-size: 16px;">We've received your request for zip code: <strong>${zipcode}</strong></p>
            <p style="margin-bottom: 0; font-size: 14px;">Our team will connect you with local window replacement contractors in your area shortly.</p>
        </div>
    `;
    
    // Hide form and show success message
    form.style.display = 'none';
    formSection.appendChild(successDiv);
    
    // Scroll to success message
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.info-section, .article-card');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Initialize slider
    initSlider();
});

// Projects Slider
let currentSlideIndex = 0;
let slides, dots;

function initSlider() {
    slides = document.querySelectorAll('.project-slide');
    dots = document.querySelectorAll('.dot');
    
    if (slides.length === 0) return;
    
    // Show first slide
    showSlide(0);
    
    // Auto-play slider
    setInterval(() => {
        moveSlide(1);
    }, 5000); // Change slide every 5 seconds
}

function showSlide(index) {
    if (!slides || slides.length === 0) return;
    
    if (index >= slides.length) {
        currentSlideIndex = 0;
    } else if (index < 0) {
        currentSlideIndex = slides.length - 1;
    } else {
        currentSlideIndex = index;
    }

    // Hide all slides
    slides.forEach((slide, i) => {
        slide.classList.remove('active');
        if (i === currentSlideIndex) {
            slide.classList.add('active');
        }
    });

    // Update dots
    if (dots && dots.length > 0) {
        dots.forEach((dot, i) => {
            dot.classList.remove('active');
            if (i === currentSlideIndex) {
                dot.classList.add('active');
            }
        });
    }
}

// Global functions for slider navigation
window.moveSlide = function(direction) {
    showSlide(currentSlideIndex + direction);
};

window.currentSlide = function(index) {
    showSlide(index - 1);
};

// Accordion functionality
window.toggleAccordion = function(header) {
    const accordionItem = header.closest('.accordion-item');
    const isActive = accordionItem.classList.contains('active');
    
    // Close all accordion items
    document.querySelectorAll('.accordion-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // If this item wasn't active, open it
    if (!isActive) {
        accordionItem.classList.add('active');
    }
};

// Read More functionality for info sections
document.addEventListener('DOMContentLoaded', function() {
    const readMoreButtons = document.querySelectorAll('.info-read-more-btn');
    
    readMoreButtons.forEach(button => {
        // Check if content actually needs truncation
        const contentContainer = button.previousElementSibling;
        const contentHeight = contentContainer.scrollHeight;
        const lineHeight = parseInt(window.getComputedStyle(contentContainer).lineHeight);
        const maxHeight = lineHeight * 4; // 4 lines
        
        // Only show button if content is longer than 4 lines
        if (contentHeight > maxHeight) {
            button.style.display = 'inline-flex';
        } else {
            button.style.display = 'none';
        }
        
        button.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            
            if (isExpanded) {
                // Collapse
                this.setAttribute('aria-expanded', 'false');
                contentContainer.classList.remove('expanded');
            } else {
                // Expand
                this.setAttribute('aria-expanded', 'true');
                contentContainer.classList.add('expanded');
            }
        });
    });
});

// Mobile Menu Toggle
function toggleMobileMenu() {
    const headerRight = document.querySelector('.header-right');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const overlay = document.querySelector('.mobile-menu-overlay');
    
    if (headerRight && menuToggle) {
        headerRight.classList.toggle('active');
        menuToggle.classList.toggle('active');
        if (overlay) {
            overlay.classList.toggle('active');
        }
    }
}

// Close mobile menu when clicking on a link
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav a');
    const headerRight = document.querySelector('.header-right');
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                if (headerRight) headerRight.classList.remove('active');
                if (menuToggle) menuToggle.classList.remove('active');
                const overlay = document.querySelector('.mobile-menu-overlay');
                if (overlay) overlay.classList.remove('active');
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 768) {
            const overlay = document.querySelector('.mobile-menu-overlay');
            const isClickInside = headerRight && (headerRight.contains(event.target) || menuToggle && menuToggle.contains(event.target));
            if (!isClickInside && headerRight && headerRight.classList.contains('active')) {
                headerRight.classList.remove('active');
                if (menuToggle) menuToggle.classList.remove('active');
                if (overlay) overlay.classList.remove('active');
            }
        }
    });
});
