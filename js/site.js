// Use passive event listeners for better scroll performance
document.addEventListener('DOMContentLoaded', function() {
    // Defer all non-critical initialization
    requestIdleCallback(() => {
        initializeApp();
    });
}, { passive: true });

// Separate initialization into smaller chunks
function initializeApp() {
    // Initialize core functionality first
    initializeInputs();
    initializeEventListeners();
    
    // Defer non-critical features
    requestIdleCallback(() => {
        initializeVideoContainers();
        initializeMobileMenu();
    });
}

// Optimize input initialization
function initializeInputs() {
    const inputs = {
        totalAmount: $('#totalAmount'),
        alreadyContributed: $('#alreadyContributed'),
        payAmount: $('#payAmount'),
        contributionAmount: $('#contributionAmount')
    };
    
    // Initialize autoNumeric with optimized settings
    Object.entries(inputs).forEach(([key, input]) => {
        input.autoNumeric('init', {
            aSep: '',
            vMin: '0',
            mDec: '2',
            wEmpty: 'zero',
            lZero: 'deny'
        });
    });
    
    // Add debounced event listeners
    inputs.totalAmount.on('keyup', debounce(updatedTotalAmount, 250));
    inputs.payAmount.on('keyup', debounce(updatedPayAmount, 250));
    inputs.alreadyContributed.on('keyup', debounce(updatedTotalAmount, 250));
}

// Optimize mobile menu
function initializeMobileMenu() {
    const $mobileMenu = $('#mobile-menu');
    const $mobileMenuButton = $('#mobile-menu-button');
    
    $mobileMenuButton.on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $mobileMenu.toggleClass('hidden');
    }, { passive: true });
    
    // Use passive event listeners for touch events
    $(document).on('touchstart', closeMenu, { passive: true });
    
    $mobileMenu.on('click', 'a', function() {
        $mobileMenu.addClass('hidden');
    }, { passive: true });
}

// Optimize video container initialization
function initializeVideoContainers() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const container = entry.target;
                if (!container.dataset.initialized) {
                    container.dataset.initialized = true;
                    loadYouTubeAPI();
                }
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.1
    });

    document.querySelectorAll('.video-container').forEach(container => {
        observer.observe(container);
    });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM selectors
    const $totalAmount = $('#totalAmount');
    const $alreadyContributed = $('#alreadyContributed');
    const $payAmount = $('#payAmount');
    const $contributionAmount = $('#contributionAmount');
    const $mobileMenu = $('#mobile-menu');
    const $mobileMenuButton = $('#mobile-menu-button');
    
    // Initialize variables
    const MAX_CONTRIBUTION = 500;
    
    // Debounce function
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
    
    // Initialize input fields with autoNumeric
    const initializeInputs = () => {
        let iTotalAmount = $totalAmount.autoNumeric('init', {
            aSep: '', 
            vMin: '0', 
            mDec: '2', 
            wEmpty: 'zero', 
            lZero: 'deny'
        });
        
        let iAlreadyContributed = $alreadyContributed.autoNumeric('init', {
            aSep: '', 
            vMax: MAX_CONTRIBUTION.toString(), 
            vMin: '0', 
            mDec: '2', 
            wEmpty: 'zero', 
            lZero: 'deny'
        });
        
        let iPayAmount = $payAmount.autoNumeric('init', {
            aSep: '', 
            vMin: '0', 
            mDec: '2', 
            wEmpty: 'zero', 
            lZero: 'deny'
        });

        // Event listeners with debouncing
        iTotalAmount.on('keyup', debounce(updatedTotalAmount, 250));
        iPayAmount.on('keyup', debounce(updatedPayAmount, 250));
        iAlreadyContributed.on('keyup', debounce(updatedTotalAmount, 250));
    };

    // Initialize immediately
    initializeInputs();

    // Track outbound link clicks with event delegation
    $(document).on('click', '[data-track]', function() {
        handleOutboundLinkClicks($(this).data('track'));
    });

    // Mobile menu toggle with optimized event handling
    $mobileMenuButton.on('click', function(e) {
        e.stopPropagation();
        $mobileMenu.toggleClass('hidden');
    });

    // Optimize document click handler
    const closeMenu = debounce(function(event) {
        if (!$mobileMenu.is(event.target) && 
            !$mobileMenuButton.is(event.target) && 
            $mobileMenuButton.has(event.target).length === 0 && 
            $mobileMenu.has(event.target).length === 0) {
            $mobileMenu.addClass('hidden');
        }
    }, 100);

    $(document).on('click', closeMenu);

    // Close mobile menu when clicking a link
    $mobileMenu.on('click', 'a', function() {
        $mobileMenu.addClass('hidden');
    });

    function updatedTotalAmount() {
        let amount = parseFloat($totalAmount.val());

        if (isNaN(amount) || amount <= 0) {
            $payAmount.val('0.00');
            $contributionAmount.val('0.00');
            return;
        }

        let payInAmount = ((amount / 10) * 8);
        let contributionAmount = ((amount / 10) * 2);
        calculateContribution('total', payInAmount, contributionAmount);
    }

    function updatedPayAmount() {
        let amount = parseFloat($payAmount.val());

        if (isNaN(amount) || amount <= 0) {
            $totalAmount.val('0.00');
            $contributionAmount.val('0.00');
            return;
        }

        let contributionAmount = ((amount / 8) * 2).toFixed(2);
        calculateContribution('payIn', amount, contributionAmount);
    }

    function calculateContribution(updateType, payInAmount, contributionAmount) {
        // Add validation for inputs
        payInAmount = Math.max(0, parseFloat(payInAmount) || 0);
        contributionAmount = Math.max(0, parseFloat(contributionAmount) || 0);
        let alreadyContributed = Math.max(0, parseFloat($alreadyContributed.val()) || 0);
        let maxContribution = Math.max(0, MAX_CONTRIBUTION - alreadyContributed);

        if (contributionAmount > maxContribution) {
            if (updateType === 'total') {
                payInAmount += (contributionAmount - maxContribution);
            }
            contributionAmount = maxContribution;
        }

        if (updateType === 'total') {
            $payAmount.val(payInAmount.toFixed(2));
        } else {
            $totalAmount.val((payInAmount + contributionAmount).toFixed(2));
        }

        $contributionAmount.val(contributionAmount.toFixed(2));
    }

    // Optimized error handling for analytics
    function handleOutboundLinkClicks(description) {
        if (typeof gtag === 'function') {
            try {
                gtag('event', 'click', {
                    'event_category': 'Outbound Link',
                    'event_label': description
                });
            } catch (error) {
                console.warn('Analytics tracking failed:', error);
            }
        }
    }

    // Optimized FAQ Accordion with event delegation
    $(document).on('click', '.faq-button', function() {
        const $this = $(this);
        const $answer = $this.next('.faq-answer');
        const $arrow = $this.find('svg');
        
        $('.faq-answer').not($answer).removeClass('active').css('max-height', '0');
        $('.faq-button').not($this).find('svg').removeClass('rotate-180');
        
        if ($answer.hasClass('active')) {
            $answer.removeClass('active').css('max-height', '0');
            $arrow.removeClass('rotate-180');
        } else {
            $answer.addClass('active').css('max-height', $answer[0].scrollHeight + 'px');
            $arrow.addClass('rotate-180');
        }
    });

    // Remove loading state when everything is initialized
    document.documentElement.classList.remove('js-loading');
});