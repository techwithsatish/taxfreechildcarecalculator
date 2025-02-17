// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    // Defer non-critical initialization
    requestIdleCallback(() => {
        initializeCalculator();
        initializeEventListeners();
    });
});

// Separate calculator initialization for better code splitting
function initializeCalculator() {
    // Cache DOM selectors
    const $signInBtn = $('#signInBtn');
    const $officialWebsiteBtn = $('#officialWebsiteBtn');
    const $searchProvidersBtn = $('#searchProvidersBtn');
    const $applyBtn = $('#applyBtn');
    const $checkEligibleBtn = $('.checkEligibleBtn');
    const $totalAmount = $('#totalAmount');
    const $alreadyContributed = $('#alreadyContributed');
    const $payAmount = $('#payAmount');
    const $contributionAmount = $('#contributionAmount');
    
    // Initialize variables
    const MAX_CONTRIBUTION = 500;
    
    // Initialize input fields with autoNumeric
    const iTotalAmount = $totalAmount.autoNumeric('init', {
        aSep: '', 
        vMin: '0', 
        mDec: '2', 
        wEmpty: 'zero', 
        lZero: 'deny'
    });

    const iAlreadyContributed = $alreadyContributed.autoNumeric('init', {
        aSep: '', 
        vMax: MAX_CONTRIBUTION.toString(), 
        vMin: '0', 
        mDec: '2', 
        wEmpty: 'zero', 
        lZero: 'deny'
    });

    const iPayAmount = $payAmount.autoNumeric('init', {
        aSep: '', 
        vMin: '0', 
        mDec: '2', 
        wEmpty: 'zero', 
        lZero: 'deny'
    });

    // Debounce function for input handlers
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    // Event listeners with debouncing
    iTotalAmount.on('keyup', debounce(updatedTotalAmount, 150));
    iPayAmount.on('keyup', debounce(updatedPayAmount, 150));
    iAlreadyContributed.on('keyup', debounce(updatedTotalAmount, 150));

    // Calculator functions
    function updatedTotalAmount() {
        let amount = parseFloat(iTotalAmount.val());

        if (amount > 0) {
            let payInAmount = ((amount / 10) * 8);
            let contributionAmount = ((amount / 10) * 2);
            calculateContribution('total', payInAmount, contributionAmount);
        } else {
            iPayAmount.val('0.00');
            $contributionAmount.val('0.00');
        }
    }

    function updatedPayAmount() {
        let amount = parseFloat(iPayAmount.val());

        if (amount > 0) {
            let contributionAmount = ((amount / 8) * 2).toFixed(2);
            calculateContribution('payIn', amount, contributionAmount);
        } else {
            iTotalAmount.val('0.00');
            $contributionAmount.val('0.00');
        }
    }

    function calculateContribution(updateType, payInAmount, contributionAmount) {
        payInAmount = parseFloat(payInAmount) || 0;
        contributionAmount = parseFloat(contributionAmount) || 0;
        let alreadyContributed = parseFloat(iAlreadyContributed.val()) || 0;
        let maxContribution = MAX_CONTRIBUTION - alreadyContributed;

        if (contributionAmount > maxContribution) {
            if (updateType === 'total') {
                payInAmount += (contributionAmount - maxContribution);
            }
            contributionAmount = maxContribution;
        }

        if (updateType === 'total') {
            iPayAmount.val(payInAmount.toFixed(2));
        } else {
            iTotalAmount.val((payInAmount + contributionAmount).toFixed(2));
        }

        $contributionAmount.val(contributionAmount.toFixed(2));
    }

    // Track outbound link clicks with event delegation
    const handleOutboundLinkClicks = (description) => {
        if (typeof gtag === 'function') {
            gtag('event', 'click', {
                'event_category': 'Outbound Link',
                'event_label': description
            });
        }
    };

    // Optimize event listeners using event delegation
    $(document).on('click', '[data-track]', function() {
        handleOutboundLinkClicks($(this).data('track'));
    });

    // Remove loading state
    requestAnimationFrame(() => {
        document.documentElement.classList.remove('js-loading');
    });
}

// Separate initialization functions for better code organization
function initializeEventListeners() {
    const $mobileMenu = $('#mobile-menu');
    const $mobileMenuButton = $('#mobile-menu-button');
    
    // Mobile menu toggle with optimized event handling
    $mobileMenuButton.on('click', function(e) {
        e.stopPropagation();
        $mobileMenu.toggleClass('hidden');
    });

    // Optimize document click handler with passive event listener
    document.addEventListener('click', function(event) {
        if (!$mobileMenu.is(event.target) && 
            !$mobileMenuButton.is(event.target) && 
            $mobileMenuButton.has(event.target).length === 0 && 
            $mobileMenu.has(event.target).length === 0) {
            $mobileMenu.addClass('hidden');
        }
    }, { passive: true });

    // Close mobile menu when clicking a link
    $mobileMenu.on('click', 'a', function() {
        $mobileMenu.addClass('hidden');
    });
}

// Optimized FAQ Accordion with event delegation and passive events
document.addEventListener('click', function(event) {
    if (event.target.closest('.faq-button')) {
        const $button = $(event.target.closest('.faq-button'));
        const $answer = $button.next('.faq-answer');
        const $arrow = $button.find('svg');
        
        $('.faq-answer').not($answer).removeClass('active').css('max-height', '0');
        $('.faq-button').not($button).find('svg').removeClass('rotate-180');
        
        if ($answer.hasClass('active')) {
            $answer.removeClass('active').css('max-height', '0');
            $arrow.removeClass('rotate-180');
        } else {
            $answer.addClass('active').css('max-height', $answer[0].scrollHeight + 'px');
            $arrow.addClass('rotate-180');
        }
    }
}, { passive: true });