document.addEventListener('DOMContentLoaded', function() {
    // Constants
    const MAX_CONTRIBUTION = 500;
    const $totalAmount = $('#totalAmount');
    const $alreadyContributed = $('#alreadyContributed');
    const $payAmount = $('#payAmount');
    const $contributionAmount = $('#contributionAmount');
    const $mobileMenu = $('#mobile-menu');
    const $mobileMenuButton = $('#mobile-menu-button');

    // Debounce function for better performance
    const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    // Initialize autoNumeric with a single options object
    const autoNumericOptions = {
        aSep: '',
        vMin: '0',
        mDec: '2',
        wEmpty: 'zero',
        lZero: 'deny'
    };

    // Initialize inputs
    const iTotalAmount = $totalAmount.autoNumeric('init', autoNumericOptions);
    const iAlreadyContributed = $alreadyContributed.autoNumeric('init', { ...autoNumericOptions, vMax: MAX_CONTRIBUTION.toString() });
    const iPayAmount = $payAmount.autoNumeric('init', autoNumericOptions);

    // Debounced event handlers
    const debouncedTotalAmount = debounce(updatedTotalAmount, 150);
    const debouncedPayAmount = debounce(updatedPayAmount, 150);

    // Event listeners with debouncing
    iTotalAmount.on('keyup', debouncedTotalAmount);
    iPayAmount.on('keyup', debouncedPayAmount);
    iAlreadyContributed.on('keyup', debouncedTotalAmount);

    // Track outbound link clicks
    $('#signInBtn').on('click', () => handleOutboundLinkClicks('Sign into your Account'));
    $('.checkEligibleBtn').on('click', () => handleOutboundLinkClicks('Check if your Eligible'));
    $('#officialWebsiteBtn').on('click', () => handleOutboundLinkClicks('Tax Free Childcare Website'));
    $('#searchProvidersBtn').on('click', () => handleOutboundLinkClicks('Register Childcare Providers'));
    $('#applyBtn').on('click', () => handleOutboundLinkClicks('Apply online for Tax-Free Childcare'));

    // Mobile menu toggle
    $mobileMenuButton.on('click', function(e) {
        e.stopPropagation();
        $mobileMenu.toggleClass('hidden');
    });

    // Use passive event listener for better scroll performance
    document.addEventListener('click', function(event) {
        if (!$mobileMenu.is(event.target) && 
            !$mobileMenuButton.is(event.target) && 
            $mobileMenuButton.has(event.target).length === 0 && 
            $mobileMenu.has(event.target).length === 0) {
            $mobileMenu.addClass('hidden');
        }
    }, { passive: true });

    // Optimize mobile menu link clicks
    $('#mobile-menu a').on('click', () => $mobileMenu.addClass('hidden'));

    // Remove loading state efficiently
    requestAnimationFrame(() => {
        document.documentElement.classList.remove('js-loading');
    });

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

    // Optimized calculation functions
    function updatedTotalAmount() {
        const amount = parseFloat(iTotalAmount.val()) || 0;
        
        if (amount > 0) {
            const payInAmount = (amount * 0.8);  // Optimized multiplication
            const contributionAmount = (amount * 0.2);  // Optimized multiplication
            calculateContribution('total', payInAmount, contributionAmount);
        } else {
            iPayAmount.val('0.00');
            $contributionAmount.val('0.00');
        }
    }

    function updatedPayAmount() {
        const amount = parseFloat(iPayAmount.val()) || 0;
        
        if (amount > 0) {
            const contributionAmount = (amount * 0.25).toFixed(2);  // Optimized multiplication
            calculateContribution('payIn', amount, contributionAmount);
        } else {
            iTotalAmount.val('0.00');
            $contributionAmount.val('0.00');
        }
    }

    function calculateContribution(updateType, payInAmount, contributionAmount) {
        payInAmount = Math.max(0, parseFloat(payInAmount) || 0);
        contributionAmount = Math.max(0, parseFloat(contributionAmount) || 0);
        const alreadyContributed = Math.max(0, parseFloat(iAlreadyContributed.val()) || 0);
        const maxContribution = Math.max(0, MAX_CONTRIBUTION - alreadyContributed);

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

    // Optimized event tracking
    const handleOutboundLinkClicks = (description) => {
        if (typeof gtag === 'function') {
            gtag('event', 'click', {
                'event_category': 'Outbound Link',
                'event_label': description
            });
        }
    };

    // Event delegation for outbound links
    $(document).on('click', '[data-track]', function() {
        handleOutboundLinkClicks($(this).data('track'));
    });
});