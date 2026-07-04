(function () {
  'use strict';

  /* ===== Helpers ===== */
  function formatDate(iso) {
    const [y, m, d] = iso.split('-');
    return `${d}.${m}.${y}`;
  }

  function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add('is-visible'));
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => { toast.hidden = true; }, 300);
    }, 3200);
  }

  function closeAllDropdowns(except) {
    document.querySelectorAll('.booking-dropdown').forEach((el) => {
      if (el !== except) el.hidden = true;
    });
    document.querySelectorAll('[data-booking-trigger]').forEach((btn) => {
      if (!except || btn.getAttribute('aria-controls') !== except.id) {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
    document.getElementById('promo-toggle')?.classList.remove('is-active');
  }

  /* ===== Site menu ===== */
  function initMenu() {
    const menuBtn = document.querySelector('.menu-btn');
    const menu = document.getElementById('site-menu');
    const overlay = document.getElementById('menu-overlay');
    const closeBtn = menu.querySelector('.site-menu__close');
    const links = menu.querySelectorAll('.site-menu__nav a');

    function openMenu() {
      menu.hidden = false;
      overlay.hidden = false;
      requestAnimationFrame(() => {
        menu.classList.add('is-open');
        overlay.classList.add('is-visible');
      });
      menuBtn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
    }

    function closeMenu() {
      menu.classList.remove('is-open');
      overlay.classList.remove('is-visible');
      menuBtn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
      setTimeout(() => {
        menu.hidden = true;
        overlay.hidden = true;
      }, 350);
    }

    menuBtn.addEventListener('click', () => {
      menuBtn.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
    });
    closeBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);
    links.forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ===== Booking ===== */
  function initBooking() {
    const checkinInput = document.getElementById('checkin-input');
    const checkoutInput = document.getElementById('checkout-input');
    const checkinDisplay = document.getElementById('checkin-display');
    const checkoutDisplay = document.getElementById('checkout-display');
    const guestsDisplay = document.getElementById('guests-display');
    const guestsDropdown = document.getElementById('guests-dropdown');
    const promoDropdown = document.getElementById('promo-dropdown');
    const promoToggle = document.getElementById('promo-toggle');
    const promoInput = document.getElementById('promo-input');
    const promoApply = document.getElementById('promo-apply');
    const searchBtn = document.getElementById('booking-search');
    const guestsDone = document.getElementById('guests-done');

    let adults = 2;
    let children = 0;
    let promoCode = '';

    function updateGuestsDisplay() {
      const adultWord = adults === 1 ? 'взрослый' : 'взрослых';
      const childWord = children === 1 ? 'ребёнок' : children < 5 ? 'ребёнка' : 'детей';
      guestsDisplay.textContent =
        children > 0
          ? `${adults} ${adultWord}, ${children} ${childWord}`
          : `${adults} ${adultWord}, 0 детей`;
    }

    function syncDates() {
      const checkin = checkinInput.value;
      let checkout = checkoutInput.value;
      if (checkout <= checkin) {
        const d = new Date(checkin);
        d.setDate(d.getDate() + 1);
        checkout = d.toISOString().slice(0, 10);
        checkoutInput.value = checkout;
        checkoutInput.min = checkout;
      }
      checkinDisplay.textContent = formatDate(checkin);
      checkoutDisplay.textContent = formatDate(checkout);
      checkoutInput.min = checkin;
    }

    document.querySelector('[data-booking-trigger="checkin"]').addEventListener('click', () => {
      closeAllDropdowns();
      checkinInput.showPicker?.() || checkinInput.click();
    });

    document.querySelector('[data-booking-trigger="checkout"]').addEventListener('click', () => {
      closeAllDropdowns();
      checkoutInput.showPicker?.() || checkoutInput.click();
    });

    checkinInput.addEventListener('change', syncDates);
    checkoutInput.addEventListener('change', syncDates);

    const guestsBtn = document.querySelector('[data-booking-trigger="guests"]');
    guestsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !guestsDropdown.hidden;
      closeAllDropdowns();
      if (!isOpen) {
        guestsDropdown.hidden = false;
        guestsBtn.classList.add('is-active');
        guestsBtn.setAttribute('aria-expanded', 'true');
      }
    });

    guestsDone.addEventListener('click', () => {
      guestsDropdown.hidden = true;
      guestsBtn.classList.remove('is-active');
      guestsBtn.setAttribute('aria-expanded', 'false');
    });

    document.querySelectorAll('.counter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.counter;
        const plus = btn.dataset.action === 'plus';
        if (type === 'adults') {
          adults = plus ? Math.min(adults + 1, 6) : Math.max(adults - 1, 1);
          document.getElementById('adults-count').textContent = adults;
        } else {
          children = plus ? Math.min(children + 1, 4) : Math.max(children - 1, 0);
          document.getElementById('children-count').textContent = children;
        }
        updateGuestsDisplay();
      });
    });

    promoToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !promoDropdown.hidden;
      closeAllDropdowns();
      if (!isOpen) {
        promoDropdown.hidden = false;
        promoToggle.classList.add('is-active');
        promoInput.focus();
      }
    });

    promoApply.addEventListener('click', () => {
      promoCode = promoInput.value.trim();
      if (promoCode) {
        showToast(`Промокод «${promoCode}» применён (демо)`);
        promoDropdown.hidden = true;
        promoToggle.classList.remove('is-active');
      }
    });

    searchBtn.addEventListener('click', () => {
      const msg = `Поиск: ${checkinDisplay.textContent} — ${checkoutDisplay.textContent}, ${guestsDisplay.textContent}${promoCode ? `, промокод: ${promoCode}` : ''}`;
      showToast(msg);
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.booking')) closeAllDropdowns();
    });

    syncDates();
    updateGuestsDisplay();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initMenu();
    initBooking();
  });
})();
