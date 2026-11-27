const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");

if (menuToggle && primaryNav) {
  const closeMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    primaryNav.classList.remove("is-open");
  };

  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    primaryNav.classList.toggle("is-open", !isExpanded);
  });

  primaryNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

const year = document.querySelector("[data-year]");
if (year) year.textContent = String(new Date().getFullYear());

const siteHeader = document.querySelector(".site-header");
if (siteHeader) {
  let idleTimer;
  const resetHeaderIdleTimer = () => {
    siteHeader.classList.remove("is-idle");
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => {
      siteHeader.classList.add("is-idle");
    }, 5000);
  };

  resetHeaderIdleTimer();
  window.addEventListener("scroll", resetHeaderIdleTimer, { passive: true });
}

document.querySelectorAll("[data-product-carousel]").forEach((carousel) => {
  const slides = Array.from(carousel.querySelectorAll(":scope > img"));
  const counter = carousel.querySelector(".product-carousel__count");
  let activeIndex = 0;
  let touchStartX = 0;

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.hidden = slideIndex !== activeIndex;
    });
    if (counter) counter.textContent = `${activeIndex + 1} / ${slides.length}`;
  };

  showSlide(0);

  carousel.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest("[data-carousel-prev], [data-carousel-next]");
    if (!(button instanceof HTMLButtonElement)) return;

    showSlide(activeIndex + (button.hasAttribute("data-carousel-next") ? 1 : -1));
  });

  carousel.addEventListener("touchstart", (event) => {
    if (event.touches.length === 1) touchStartX = event.touches[0].clientX;
  }, { passive: true });

  carousel.addEventListener("touchend", (event) => {
    if (!touchStartX || !event.changedTouches.length) return;
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 45) showSlide(activeIndex + (distance < 0 ? 1 : -1));
    touchStartX = 0;
  }, { passive: true });
});

const productLightbox = document.querySelector("[data-product-lightbox]");

if (productLightbox instanceof HTMLDialogElement) {
  const lightboxImage = productLightbox.querySelector("[data-lightbox-image]");
  const lightboxCaption = productLightbox.querySelector("[data-lightbox-caption]");
  const lightboxCount = productLightbox.querySelector("[data-lightbox-count]");
  const prevButton = productLightbox.querySelector("[data-lightbox-prev]");
  const nextButton = productLightbox.querySelector("[data-lightbox-next]");
  const zoomButton = productLightbox.querySelector("[data-lightbox-zoom]");
  const closeButton = productLightbox.querySelector("[data-lightbox-close]");
  let lightboxSlides = [];
  let lightboxIndex = 0;
  let swipeStartX = 0;

  const setZoom = (zoomed) => {
    if (!(lightboxImage instanceof HTMLImageElement) || !(zoomButton instanceof HTMLButtonElement)) return;
    lightboxImage.classList.toggle("is-zoomed", zoomed);
    zoomButton.setAttribute("aria-pressed", String(zoomed));
    zoomButton.textContent = zoomed ? "Reset" : "Zoom";
  };

  const showLightboxSlide = (index) => {
    if (!lightboxSlides.length) return;
    lightboxIndex = (index + lightboxSlides.length) % lightboxSlides.length;
    const slide = lightboxSlides[lightboxIndex];
    if (lightboxImage instanceof HTMLImageElement) {
      lightboxImage.src = slide.src;
      lightboxImage.alt = slide.alt;
    }
    if (lightboxCaption) lightboxCaption.textContent = slide.alt;
    if (lightboxCount) lightboxCount.textContent = lightboxSlides.length > 1
      ? `${lightboxIndex + 1} / ${lightboxSlides.length}`
      : "";
    setZoom(false);
    if (prevButton) prevButton.hidden = lightboxSlides.length < 2;
    if (nextButton) nextButton.hidden = lightboxSlides.length < 2;
  };

  document.querySelectorAll(".product-image").forEach((imageContainer) => {
    const slides = Array.from(imageContainer.querySelectorAll(":scope > img"));

    slides.forEach((slide, index) => {
      slide.setAttribute("tabindex", "0");
      slide.setAttribute("role", "button");
      slide.setAttribute("aria-label", `Enlarge image: ${slide.alt}`);

      const openLightbox = () => {
        lightboxSlides = slides;
        showLightboxSlide(index);
        productLightbox.showModal();
        closeButton?.focus();
      };

      slide.addEventListener("click", openLightbox);
      slide.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox();
        }
      });
    });
  });

  prevButton?.addEventListener("click", () => showLightboxSlide(lightboxIndex - 1));
  nextButton?.addEventListener("click", () => showLightboxSlide(lightboxIndex + 1));
  closeButton?.addEventListener("click", () => productLightbox.close());
  zoomButton?.addEventListener("click", () => {
    setZoom(!lightboxImage?.classList.contains("is-zoomed"));
  });

  lightboxImage?.addEventListener("dblclick", () => {
    setZoom(!lightboxImage.classList.contains("is-zoomed"));
  });

  productLightbox.addEventListener("click", (event) => {
    if (event.target === productLightbox) productLightbox.close();
  });

  productLightbox.addEventListener("touchstart", (event) => {
    if (event.touches.length === 1) swipeStartX = event.touches[0].clientX;
  }, { passive: true });

  productLightbox.addEventListener("touchend", (event) => {
    if (!swipeStartX || !event.changedTouches.length || lightboxSlides.length < 2) return;
    const distance = event.changedTouches[0].clientX - swipeStartX;
    if (Math.abs(distance) > 50) showLightboxSlide(lightboxIndex + (distance < 0 ? 1 : -1));
    swipeStartX = 0;
  }, { passive: true });

  productLightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") showLightboxSlide(lightboxIndex - 1);
    if (event.key === "ArrowRight") showLightboxSlide(lightboxIndex + 1);
  });
}

const revealTargets = document.querySelectorAll(
  ".section-heading, .story-card, .drop-heading, .product-card, .made-order__art, .made-order__copy, .custom-art, .custom-copy, .diy-heading, .diy-card, .community-heading, .community-grid a",
);

if ("IntersectionObserver" in window) {
  document.documentElement.classList.add("js-ready");

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );

  revealTargets.forEach((target) => {
    target.setAttribute("data-reveal", "");
    revealObserver.observe(target);
  });
}