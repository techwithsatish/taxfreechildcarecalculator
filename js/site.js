// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    initializeCalculator();
});

function initializeCalculator() {
    // Cache DOM selectors
    const totalAmountInput = document.getElementById('totalAmount');
    const alreadyContributedInput = document.getElementById('alreadyContributed');
    const payAmountInput = document.getElementById('payAmount');
    const contributionAmountInput = document.getElementById('contributionAmount');
    
    // Initialize variables
    const MAX_CONTRIBUTION = 500;
    
    // Initialize input fields with autoNumeric
    const iTotalAmount = new AutoNumeric(totalAmountInput, {
        decimalPlaces: 2,
        minimumValue: '0',
        emptyInputBehavior: 'zero',
        leadingZero: 'deny',
        decimalCharacter: '.',
        digitGroupSeparator: ''
    });

    const iAlreadyContributed = new AutoNumeric(alreadyContributedInput, {
        decimalPlaces: 2,
        maximumValue: MAX_CONTRIBUTION.toString(),
        minimumValue: '0',
        emptyInputBehavior: 'zero',
        leadingZero: 'deny',
        decimalCharacter: '.',
        digitGroupSeparator: ''
    });

    const iPayAmount = new AutoNumeric(payAmountInput, {
        decimalPlaces: 2,
        minimumValue: '0',
        emptyInputBehavior: 'zero',
        leadingZero: 'deny',
        decimalCharacter: '.',
        digitGroupSeparator: ''
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
    totalAmountInput.addEventListener('input', debounce(updatedTotalAmount, 150));
    payAmountInput.addEventListener('input', debounce(updatedPayAmount, 150));
    alreadyContributedInput.addEventListener('input', debounce(updatedTotalAmount, 150));

    // Calculator functions
    function updatedTotalAmount() {
        let amount = iTotalAmount.getNumber();

        if (amount > 0) {
            let payInAmount = ((amount / 10) * 8);
            let contributionAmount = ((amount / 10) * 2);
            calculateContribution('total', payInAmount, contributionAmount);
        } else {
            iPayAmount.set(0);
            contributionAmountInput.value = '0.00';
        }
    }

    function updatedPayAmount() {
        let amount = iPayAmount.getNumber();

        if (amount > 0) {
            let contributionAmount = ((amount / 8) * 2);
            calculateContribution('payIn', amount, contributionAmount);
        } else {
            iTotalAmount.set(0);
            contributionAmountInput.value = '0.00';
        }
    }

    function calculateContribution(updateType, payInAmount, contributionAmount) {
        payInAmount = parseFloat(payInAmount) || 0;
        contributionAmount = parseFloat(contributionAmount) || 0;
        let alreadyContributed = iAlreadyContributed.getNumber() || 0;
        let maxContribution = MAX_CONTRIBUTION - alreadyContributed;

        if (contributionAmount > maxContribution) {
            if (updateType === 'total') {
                payInAmount += (contributionAmount - maxContribution);
            }
            contributionAmount = maxContribution;
        }

        if (updateType === 'total') {
            iPayAmount.set(payInAmount);
        } else {
            iTotalAmount.set(payInAmount + contributionAmount);
        }

        contributionAmountInput.value = contributionAmount.toFixed(2);
    }

    // Track outbound link clicks
    const trackableButtons = document.querySelectorAll('[data-track]');
    trackableButtons.forEach(button => {
        button.addEventListener('click', () => {
            const description = button.dataset.track;
            if (typeof gtag === 'function') {
                gtag('event', 'click', {
                    'event_category': 'Outbound Link',
                    'event_label': description
                });
            }
        });
    });

    // Mobile menu functionality
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (event) => {
        if (mobileMenu && !mobileMenu.contains(event.target) && 
            !mobileMenuButton.contains(event.target)) {
            mobileMenu.classList.add('hidden');
        }
    }, { passive: true });

    // Close mobile menu when clicking a link
    if (mobileMenu) {
        mobileMenu.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                mobileMenu.classList.add('hidden');
            }
        });
    }

    // Remove loading state
    requestAnimationFrame(() => {
        document.documentElement.classList.remove('js-loading');
    });
}

// FAQ Accordion
document.addEventListener('click', (event) => {
    const button = event.target.closest('.faq-button');
    if (button) {
        const answer = button.nextElementSibling;
        const arrow = button.querySelector('svg');
        
        document.querySelectorAll('.faq-answer').forEach(el => {
            if (el !== answer) {
                el.classList.remove('active');
                el.style.maxHeight = '0';
            }
        });
        
        document.querySelectorAll('.faq-button svg').forEach(el => {
            if (el !== arrow) {
                el.classList.remove('rotate-180');
            }
        });
        
        const isActive = answer.classList.contains('active');
        answer.classList.toggle('active');
        answer.style.maxHeight = isActive ? '0' : `${answer.scrollHeight}px`;
        arrow.classList.toggle('rotate-180');
    }
}, { passive: true });