// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
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
    const $mobileMenu = $('#mobile-menu');
    const $mobileMenuButton = $('#mobile-menu-button');
    
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

    // Event listeners
    iTotalAmount.on('keyup', updatedTotalAmount);
    iPayAmount.on('keyup', updatedPayAmount);
    iAlreadyContributed.on('keyup', updatedTotalAmount);

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

    // Track outbound link clicks
    $signInBtn.on('click', () => handleOutboundLinkClicks('Sign into your Account'));
    $checkEligibleBtn.on('click', () => handleOutboundLinkClicks('Check if your Eligible'));
    $officialWebsiteBtn.on('click', () => handleOutboundLinkClicks('Tax Free Childcare Website'));
    $searchProvidersBtn.on('click', () => handleOutboundLinkClicks('Register Childcare Providers'));
    $applyBtn.on('click', () => handleOutboundLinkClicks('Apply online for Tax-Free Childcare'));

    function handleOutboundLinkClicks(description) {
        if (typeof gtag === 'function') {
            gtag('event', 'click', {
                'event_category': 'Outbound Link',
                'event_label': description
            });
        }
    }

    // Initialize event listeners
    initializeEventListeners();
    
    // Remove loading state when everything is initialized
    document.documentElement.classList.remove('js-loading');
});

// Separate initialization functions for better code organization
function initializeEventListeners() {
    // Mobile menu toggle with optimized event handling
    const $mobileMenu = $('#mobile-menu');
    const $mobileMenuButton = $('#mobile-menu-button');
    
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