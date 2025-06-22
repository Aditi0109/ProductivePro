// ProductivePro Landing Page JavaScript
// Handles navigation, animations, and interactive elements

document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize all components
    initializeNavigation();
    initializeScrollAnimations();
    initializeMobileMenu();
    initializeCtaButtons();
    initializeSmoothScrolling();
    
    // Navigation functionality
    function initializeNavigation() {
        const navbar = document.getElementById('navbar');
        const navLinks = document.querySelectorAll('.nav-link');
        
        // Handle navbar scroll effect
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
            
            // Update active navigation link
            updateActiveNavLink();
        });
        
        // Set initial active link
        updateActiveNavLink();
    }
    
    // Update active navigation link based on scroll position
    function updateActiveNavLink() {
        const sections = ['hero', 'features', 'pricing', 'contact'];
        const navLinks = document.querySelectorAll('.nav-link');
        
        let currentSection = '';
        
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 100 && rect.bottom >= 100) {
                    currentSection = sectionId;
                }
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Initialize scroll-triggered animations
    function initializeScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };
        
        // Create intersection observer for feature cards
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    // Add staggered animation delay
                    const index = Array.from(entry.target.parentNode.children).indexOf(entry.target);
                    entry.target.style.transitionDelay = `${index * 0.1}s`;
                }
            });
        }, observerOptions);
        
        // Observe all feature cards
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.classList.add('animate-on-scroll');
            observer.observe(card);
        });
        
        // Observe pricing cards
        const pricingCards = document.querySelectorAll('.pricing-card');
        pricingCards.forEach(card => {
            card.classList.add('animate-on-scroll');
            observer.observe(card);
        });
        
        // Hero section animation
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            setTimeout(() => {
                heroContent.style.opacity = '1';
                heroContent.style.transform = 'translateY(0)';
            }, 300);
        }
    }
    
    // Mobile menu functionality
    function initializeMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', function() {
                mobileMenu.classList.toggle('hidden');
                
                // Toggle menu icon
                const icon = mobileMenuBtn.querySelector('i');
                if (mobileMenu.classList.contains('hidden')) {
                    icon.setAttribute('data-feather', 'menu');
                } else {
                    icon.setAttribute('data-feather', 'x');
                }
                feather.replace();
            });
            
            // Close mobile menu when clicking on links
            const mobileNavLinks = mobileMenu.querySelectorAll('a');
            mobileNavLinks.forEach(link => {
                link.addEventListener('click', function() {
                    mobileMenu.classList.add('hidden');
                    const icon = mobileMenuBtn.querySelector('i');
                    icon.setAttribute('data-feather', 'menu');
                    feather.replace();
                });
            });
        }
    }
    
    // CTA button interactions
    function initializeCtaButtons() {
        const ctaButtons = document.querySelectorAll('.cta-button');
        
        ctaButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Add click animation
                button.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                }, 150);
                
                // Here you would typically redirect to signup/trial page
                console.log('CTA button clicked - redirect to signup');
                
                // For demo purposes, show an alert
                showNotification('Free trial started! Check your email for setup instructions.', 'success');
            });
        });
        
        // Watch demo button (removed as requested)
    }
    
    // Smooth scrolling for navigation links
    function initializeSmoothScrolling() {
        const navLinks = document.querySelectorAll('a[href^="#"]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    // Notification system
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification fixed top-20 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
        
        // Set colors based on type
        switch (type) {
            case 'success':
                notification.classList.add('bg-green-600', 'text-white');
                break;
            case 'error':
                notification.classList.add('bg-red-600', 'text-white');
                break;
            case 'warning':
                notification.classList.add('bg-yellow-600', 'text-white');
                break;
            default:
                notification.classList.add('bg-blue-600', 'text-white');
        }
        
        notification.innerHTML = `
            <div class="flex items-center space-x-3">
                <i data-feather="${getNotificationIcon(type)}" class="w-5 h-5"></i>
                <span>${message}</span>
                <button class="ml-4 hover:opacity-70" onclick="this.parentElement.parentElement.remove()">
                    <i data-feather="x" class="w-4 h-4"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        feather.replace();
        
        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('translate-x-full');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);
    }
    
    function getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'x-circle';
            case 'warning': return 'alert-triangle';
            default: return 'info';
        }
    }
    
    // Parallax effect for hero section
    function initializeParallax() {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const heroContent = document.querySelector('.hero-content');
            
            if (heroContent && scrolled < window.innerHeight) {
                const rate = scrolled * -0.5;
                heroContent.style.transform = `translateY(${rate}px)`;
            }
        });
    }
    
    // Initialize parallax (optional - comment out if too much motion)
    // initializeParallax();
    
    // Keyboard navigation support
    document.addEventListener('keydown', function(e) {
        // ESC key closes mobile menu
        if (e.key === 'Escape') {
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                const mobileMenuBtn = document.getElementById('mobile-menu-btn');
                const icon = mobileMenuBtn.querySelector('i');
                icon.setAttribute('data-feather', 'menu');
                feather.replace();
            }
        }
    });
    
    // Performance optimization: debounce scroll events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Apply debouncing to scroll events
    const debouncedScrollHandler = debounce(function() {
        updateActiveNavLink();
    }, 10);
    
    window.addEventListener('scroll', debouncedScrollHandler);
    
    // Analytics tracking (placeholder)
    function trackEvent(eventName, properties = {}) {
        console.log('Analytics Event:', eventName, properties);
        // Here you would send to your analytics service
        // gtag('event', eventName, properties);
    }
    
    // Track CTA clicks
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('cta-button')) {
            trackEvent('cta_click', {
                button_text: e.target.textContent,
                section: getCurrentSection()
            });
        }
    });
    
    function getCurrentSection() {
        const sections = ['hero', 'features', 'pricing', 'contact'];
        for (let section of sections) {
            const element = document.getElementById(section);
            if (element) {
                const rect = element.getBoundingClientRect();
                if (rect.top <= 100 && rect.bottom >= 100) {
                    return section;
                }
            }
        }
        return 'unknown';
    }
    
    // Loading state management
    window.addEventListener('load', function() {
        document.body.classList.add('loaded');
        
        // Initialize any third-party widgets here
        console.log('Page fully loaded');
    });
    
    console.log('ProductivePro landing page initialized successfully');
});

// Utility functions
const utils = {
    // Smooth scroll to element
    scrollToElement: function(elementId, offset = 80) {
        const element = document.getElementById(elementId);
        if (element) {
            const top = element.offsetTop - offset;
            window.scrollTo({
                top: top,
                behavior: 'smooth'
            });
        }
    },
    
    // Check if element is in viewport
    isInViewport: function(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    
    // Throttle function calls
    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
};

// Export utilities for use in other scripts
window.ProductiveProUtils = utils;
