<<<<<<< HEAD
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
    
=======
$(document).ready(function () {
>>>>>>> parent of ed51814 (optimesed - fixed)
    // Initialize variables
    const MAX_CONTRIBUTION = 500;
    
    // Initialize input fields with autoNumeric
<<<<<<< HEAD
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
=======
    let iTotalAmount = $('#totalAmount').autoNumeric('init', {
        aSep: '', 
        vMin: '0', 
        mDec: '2', 
        wEmpty: 'zero', 
        lZero: 'deny'
    });
    
    let iAlreadyContributed = $('#alreadyContributed').autoNumeric('init', {
        aSep: '', 
        vMax: MAX_CONTRIBUTION.toString(), 
        vMin: '0', 
        mDec: '2', 
        wEmpty: 'zero', 
        lZero: 'deny'
    });
    
    let iPayAmount = $('#payAmount').autoNumeric('init', {
        aSep: '', 
        vMin: '0', 
        mDec: '2', 
        wEmpty: 'zero', 
        lZero: 'deny'
    });
    
    let iContributionAmount = $('#contributionAmount');
>>>>>>> parent of ed51814 (optimesed - fixed)

    // Event listeners
    iTotalAmount.on('keyup', updatedTotalAmount);
    iPayAmount.on('keyup', updatedPayAmount);
    iAlreadyContributed.on('keyup', updatedTotalAmount);

    // Track outbound link clicks
    $('#signInBtn').on('click', () => handleOutboundLinkClicks('Sign into your Account'));
    $('.checkEligibleBtn').on('click', () => handleOutboundLinkClicks('Check if your Eligible'));
    $('#officialWebsiteBtn').on('click', () => handleOutboundLinkClicks('Tax Free Childcare Website'));
    $('#searchProvidersBtn').on('click', () => handleOutboundLinkClicks('Register Childcare Providers'));
    $('#applyBtn').on('click', () => handleOutboundLinkClicks('Apply online for Tax-Free Childcare'));

    // Mobile menu toggle
    $('#mobile-menu-button').on('click', function(e) {
        e.stopPropagation(); // Prevent event from bubbling up
        $('#mobile-menu').toggleClass('hidden');
    });

    // Close mobile menu when clicking outside
    $(document).on('click', function(event) {
        const $menu = $('#mobile-menu');
        const $button = $('#mobile-menu-button');
        
        if (!$menu.is(event.target) && 
            !$button.is(event.target) && 
            $button.has(event.target).length === 0 && 
            $menu.has(event.target).length === 0) {
            $menu.addClass('hidden');
        }
    });

    // Close mobile menu when clicking a link
    $('#mobile-menu a').on('click', function() {
        $('#mobile-menu').addClass('hidden');
    });

    function updatedTotalAmount() {
        let amount = parseFloat($totalAmount.val());

<<<<<<< HEAD
        if (isNaN(amount) || amount <= 0) {
            $payAmount.val('0.00');
            $contributionAmount.val('0.00');
=======
        // Add validation
        if (isNaN(amount)) {
            iPayAmount.val('0.00');
            iContributionAmount.val('0.00');
>>>>>>> parent of ed51814 (optimesed - fixed)
            return;
        }

        if (amount > 0) {
            let payInAmount = ((amount / 10) * 8);
            let contributionAmount = ((amount / 10) * 2);
            calculateContribution('total', payInAmount, contributionAmount);
        } else {
            iPayAmount.val('0.00');
            iContributionAmount.val('0.00');
        }
    }

    function updatedPayAmount() {
        let amount = parseFloat($payAmount.val());

<<<<<<< HEAD
        if (isNaN(amount) || amount <= 0) {
            $totalAmount.val('0.00');
            $contributionAmount.val('0.00');
=======
        // Add validation
        if (isNaN(amount)) {
            iTotalAmount.val('0.00');
            iContributionAmount.val('0.00');
>>>>>>> parent of ed51814 (optimesed - fixed)
            return;
        }

        if (amount > 0) {
            let contributionAmount = ((amount / 8) * 2).toFixed(2);
            calculateContribution('payIn', amount, contributionAmount);
        } else {
            iTotalAmount.val('0.00');
            iContributionAmount.val('0.00');
        }
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

        iContributionAmount.val(contributionAmount.toFixed(2));
    }

    // Add error handling for analytics
    function handleOutboundLinkClicks(description) {
        try {
            gtag('event', 'click', {
                'event_category': 'Outbound Link',
                'event_label': description
            });
        } catch (error) {
            console.warn('Analytics tracking failed:', error);
        }
    }

    // FAQ Accordion
    $('.faq-button').on('click', function() {
        const answer = $(this).next('.faq-answer');
        const arrow = $(this).find('svg');
        
        // Close all other answers
        $('.faq-answer').not(answer).removeClass('active').css('max-height', '0');
        $('.faq-button').not(this).find('svg').removeClass('rotate-180');
        
        // Toggle current answer
        if (answer.hasClass('active')) {
            answer.removeClass('active').css('max-height', '0');
            arrow.removeClass('rotate-180');
        } else {
            answer.addClass('active').css('max-height', answer[0].scrollHeight + 'px');
            arrow.addClass('rotate-180');
        }
    });

    // Remove loading state when everything is initialized
    document.documentElement.classList.remove('js-loading');
});