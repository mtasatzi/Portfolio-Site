const LANGUAGE_STORAGE_KEY = "matina-portfolio-language";

function getPreferredLanguage() {
  try {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return savedLanguage === "en" || savedLanguage === "el" ? savedLanguage : "el";
  } catch (error) {
    console.warn("Could not read the saved language preference:", error);
    return "el";
  }
}

/* Defaults to Greek; a valid saved language preference takes precedence. */
let currentLang = getPreferredLanguage();
let SITE_CONTENT;
let previewImages = [];
let previewIndex = -1;
let previewZoom = 1;
let previewBaseSize = null;

/* Map data-i18n keys ("section.key") to string lookups */
function t(key) {
  const value = key.split(".").reduce((entry, part) => entry?.[part], SITE_CONTENT);
  const translation = typeof value === "string" ? value : value?.[currentLang];
  return typeof translation === "string" ? translation : key;
}

function localized(value) {
  return typeof value === "string" ? value : value?.[currentLang] || "";
}

function artworkDescription(work) {
  return [localized(work.title), localized(work.details)].filter(Boolean).join(". ");
}

function artworkImages(work) {
  return Array.isArray(work.images) ? work.images : [];
}

function renderGallery() {
  const timeline = document.getElementById("timeline");
  if (!timeline) return;

  previewImages = SITE_CONTENT.gallery.periods.flatMap((period) => period.works.flatMap((work) =>
    artworkImages(work).map((src, imageIndex) => ({ work, src, imageIndex }))
  ));
  timeline.replaceChildren();
  SITE_CONTENT.gallery.periods.forEach((period, periodIndex) => {
    const article = document.createElement("article");
    article.className = "period";
    article.dataset.periodIndex = periodIndex;

    const date = document.createElement("time");
    date.className = "period-date";
    date.textContent = localized(period.date);

    const title = document.createElement("h3");
    title.className = "period-title";
    title.textContent = localized(period.title);

    const summary = document.createElement("p");
    summary.className = "period-summary";
    summary.textContent = localized(period.summary);

    const works = document.createElement("div");
    works.className = "period-works";
    period.works.forEach((work, workIndex) => {
      const photos = artworkImages(work);
      let photoIndex = 0;
      const figure = document.createElement("figure");
      figure.className = "work";
      figure.dataset.workIndex = workIndex;

      const media = document.createElement("div");
      media.className = "work-media";

      const image = document.createElement("img");
      image.className = "work-img";
      image.src = photos[photoIndex];
      image.alt = artworkDescription(work);
      image.loading = "lazy";
      image.decoding = "async";

      let photoCounter;
      const updatePhoto = () => {
        image.src = photos[photoIndex];
        if (photoCounter) {
          photoCounter.textContent = `${photoIndex + 1} / ${photos.length}`;
        }
      };

      const imageButton = document.createElement("button");
      imageButton.className = "work-image-button";
      imageButton.type = "button";
      imageButton.setAttribute(
        "aria-label",
        t("gallery.zoomLabel").replace("{title}", localized(work.title))
      );
      let swipeStart = null;
      let suppressSwipeClick = false;
      imageButton.addEventListener("click", () => {
        if (suppressSwipeClick) {
          suppressSwipeClick = false;
          return;
        }
        openImagePreview(work, photoIndex);
      });
      imageButton.addEventListener("pointerdown", (event) => {
        if (photos.length < 2 || event.pointerType !== "touch") return;
        swipeStart = { x: event.clientX, y: event.clientY };
      });
      imageButton.addEventListener("pointerup", (event) => {
        if (!swipeStart) return;
        const deltaX = event.clientX - swipeStart.x;
        const deltaY = event.clientY - swipeStart.y;
        swipeStart = null;
        if (Math.abs(deltaX) < 40 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
        photoIndex = (photoIndex + (deltaX < 0 ? 1 : -1) + photos.length) % photos.length;
        updatePhoto();
        suppressSwipeClick = true;
        window.setTimeout(() => {
          suppressSwipeClick = false;
        }, 0);
      });
      imageButton.addEventListener("pointercancel", () => {
        swipeStart = null;
      });

      if (photos.length > 1) {
        photoCounter = document.createElement("span");
        photoCounter.className = "work-photo-counter";
        photoCounter.setAttribute("aria-live", "polite");

        [-1, 1].forEach((offset) => {
          const button = document.createElement("button");
          button.className = `work-carousel-nav work-carousel-nav--${offset < 0 ? "previous" : "next"}`;
          button.type = "button";
          button.setAttribute(
            "aria-label",
            t(offset < 0 ? "gallery.previousPhoto" : "gallery.nextPhoto")
              .replace("{title}", localized(work.title))
          );
          button.textContent = offset < 0 ? "←" : "→";
          button.addEventListener("click", () => {
            photoIndex = (photoIndex + offset + photos.length) % photos.length;
            updatePhoto();
          });
          media.append(button);
        });

        updatePhoto();
        media.append(photoCounter);
      }

      const caption = document.createElement("figcaption");
      const workTitle = document.createElement("span");
      workTitle.className = "work-title";
      workTitle.textContent = localized(work.title);
      caption.append(workTitle);
      if (localized(work.details)) {
        const details = document.createElement("span");
        details.className = "work-details";
        details.textContent = localized(work.details);
        caption.append(details);
      }
      if (localized(work.year)) {
        const year = document.createElement("span");
        year.className = "work-year";
        year.textContent = localized(work.year);
        caption.append(year);
      }
      imageButton.append(image);
      media.prepend(imageButton);
      figure.append(media, caption);
      works.append(figure);
    });

    article.append(date, title, summary, works);
    timeline.append(article);
  });

  const dialog = document.getElementById("image-lightbox");
  if (dialog?.open && previewIndex >= 0) updateImagePreview();
}

function openImagePreview(work, imageIndex) {
  const dialog = document.getElementById("image-lightbox");
  previewIndex = previewImages.findIndex((item) => item.work === work && item.imageIndex === imageIndex);
  if (!dialog || previewIndex < 0) return;

  updateImagePreview();
  dialog.showModal();
}

function updateImagePreview() {
  const imageToggle = document.getElementById("image-lightbox-image-toggle");
  const image = document.getElementById("image-lightbox-img");
  const caption = document.getElementById("image-lightbox-caption");
  const previousButton = document.getElementById("image-lightbox-previous");
  const nextButton = document.getElementById("image-lightbox-next");
  const preview = previewImages[previewIndex];
  if (!imageToggle || !image || !caption || !preview) return;

  setPreviewZoom(1);
  const { work, src, imageIndex } = preview;
  const photos = artworkImages(work);
  image.src = src;
  image.alt = artworkDescription(work);
  imageToggle.setAttribute(
    "aria-label",
    t("gallery.zoomInImage").replace("{title}", localized(work.title))
  );
  const captionParts = [work.title, work.details, work.year].map(localized).filter(Boolean);
  if (photos.length > 1) captionParts.push(`${imageIndex + 1} / ${photos.length}`);
  caption.textContent = captionParts.join(" · ");
  if (previousButton) previousButton.disabled = previewImages.length < 2;
  if (nextButton) nextButton.disabled = previewImages.length < 2;
}

function setPreviewZoom(zoom, event) {
  const imageToggle = document.getElementById("image-lightbox-image-toggle");
  const image = document.getElementById("image-lightbox-img");
  const view = document.querySelector(".image-lightbox-view");
  if (!imageToggle || !image || !view) return;

  const imageBounds = image.getBoundingClientRect();
  const viewBounds = view.getBoundingClientRect();
  const targetX = Number.isFinite(event?.clientX) ? event.clientX : viewBounds.left + view.clientWidth / 2;
  const targetY = Number.isFinite(event?.clientY) ? event.clientY : viewBounds.top + view.clientHeight / 2;
  const focusX = Math.min(1, Math.max(0, (targetX - imageBounds.left) / imageBounds.width));
  const focusY = Math.min(1, Math.max(0, (targetY - imageBounds.top) / imageBounds.height));

  previewZoom = zoom;
  if (previewZoom === 1) {
    image.style.removeProperty("width");
    image.style.removeProperty("height");
    image.style.removeProperty("max-width");
    image.style.removeProperty("max-height");
    imageToggle.style.removeProperty("margin-left");
    imageToggle.style.removeProperty("margin-top");
    imageToggle.style.removeProperty("width");
    imageToggle.style.removeProperty("height");
    view.style.removeProperty("width");
    view.style.removeProperty("height");
    view.style.removeProperty("overflow");
    view.style.removeProperty("overflow-x");
    view.style.removeProperty("overflow-y");
    view.classList.remove("is-zoomed");
    previewBaseSize = null;
  } else {
    if (!previewBaseSize) {
      const bounds = image.getBoundingClientRect();
      previewBaseSize = { width: bounds.width, height: bounds.height };
    }

    image.style.maxWidth = "none";
    image.style.maxHeight = "none";
    image.style.width = `${previewBaseSize.width * previewZoom}px`;
    image.style.height = `${previewBaseSize.height * previewZoom}px`;
    view.classList.add("is-zoomed");
    const scrollbarSize = 10;
    let needsHorizontalScroll = image.offsetWidth > viewBounds.width;
    let needsVerticalScroll = image.offsetHeight > viewBounds.height;
    for (let iteration = 0; iteration < 2; iteration += 1) {
      needsHorizontalScroll = image.offsetWidth
        > viewBounds.width - (needsVerticalScroll ? scrollbarSize : 0);
      needsVerticalScroll = image.offsetHeight
        > viewBounds.height - (needsHorizontalScroll ? scrollbarSize : 0);
    }

    imageToggle.style.width = `${image.offsetWidth}px`;
    imageToggle.style.height = `${image.offsetHeight}px`;
    view.style.width = `${Math.min(
      viewBounds.width,
      image.offsetWidth + (needsVerticalScroll ? scrollbarSize : 0)
    )}px`;
    view.style.height = `${Math.min(
      viewBounds.height,
      image.offsetHeight + (needsHorizontalScroll ? scrollbarSize : 0)
    )}px`;
    view.style.overflowX = needsHorizontalScroll ? "auto" : "hidden";
    view.style.overflowY = needsVerticalScroll ? "auto" : "hidden";
    const verticalMargin = Math.min(
      Math.max(0, view.clientHeight - image.offsetHeight),
      Math.max(0, targetY - viewBounds.top - focusY * image.offsetHeight)
    );
    imageToggle.style.marginTop = `${verticalMargin}px`;
  }
  if (previewZoom === 1) {
    view.scrollTo(0, 0);
  } else {
    const updatedImageBounds = image.getBoundingClientRect();
    view.scrollLeft += updatedImageBounds.left + focusX * updatedImageBounds.width - targetX;
    view.scrollTop += updatedImageBounds.top + focusY * updatedImageBounds.height - targetY;
  }

  const work = previewImages[previewIndex]?.work;
  imageToggle.setAttribute(
    "aria-label",
    t(previewZoom === 1 ? "gallery.zoomInImage" : "gallery.zoomOutImage")
      .replace("{title}", localized(work?.title))
  );
}

function showAdjacentImage(offset) {
  if (previewImages.length < 2) return;

  previewIndex = (previewIndex + offset + previewImages.length) % previewImages.length;
  updateImagePreview();
}

function renderExhibitions() {
  const paragraph = document.getElementById("about-exhibitions");
  if (!paragraph) return;

  const items = SITE_CONTENT.exhibitions.items
    .map((item) => `${localized(item.date)} — ${localized(item.title)}, ${localized(item.venue)}`);
  paragraph.textContent = `${localized(SITE_CONTENT.exhibitions.title)}${items.join(", ")}.`;
}

function render() {
  document.documentElement.lang = currentLang;
  document.documentElement.dir = "ltr";

  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const translation = t(node.getAttribute("data-i18n"));
    if (translation) {
      if (/<[a-z][\s\S]*>/i.test(translation)) {
        node.innerHTML = translation;
      } else {
        node.textContent = translation;
      }
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    const translation = t(node.getAttribute("data-i18n-placeholder"));
    if (translation) node.placeholder = translation;
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    const translation = t(node.getAttribute("data-i18n-aria-label"));
    if (translation) node.setAttribute("aria-label", translation);
  });

  document.querySelectorAll(".lang-toggle").forEach((toggle) => {
    toggle.setAttribute("aria-label", t(
      currentLang === "en" ? "language.switchToGreek" : "language.switchToEnglish"
    ));
  });
  document.querySelectorAll(".lang-label.lang-el").forEach((el) => {
    el.classList.toggle("active", currentLang === "el");
  });
  document.querySelectorAll(".lang-label.lang-en").forEach((el) => {
    el.classList.toggle("active", currentLang === "en");
  });

  const title = document.querySelector("title");
  if (title) title.textContent = `${t("hero.title")} | Portfolio`;

  const aboutImage = document.getElementById("about-image");
  if (aboutImage) {
    aboutImage.src = SITE_CONTENT.images.about;
    aboutImage.alt = localized(SITE_CONTENT.about.imageAlt);
  }
  const cvLink = document.getElementById("cv-download");
  if (cvLink) cvLink.href = SITE_CONTENT.images.cv;

  renderGallery();
  renderExhibitions();
}

function captureViewportAnchor() {
  const y = Math.min(window.innerHeight - 1, Math.max(0, window.innerHeight * 0.4));
  const element = document.elementFromPoint(window.innerWidth / 2, y);
  const work = element?.closest(".work");
  if (work) {
    const period = work.closest(".period");
    return {
      kind: "work",
      periodIndex: Number(period?.dataset.periodIndex),
      workIndex: Number(work.dataset.workIndex),
      top: work.getBoundingClientRect().top,
      scrollY: window.scrollY,
    };
  }

  const anchor = element?.closest("[data-i18n], section[id]");
  return anchor
    ? { element: anchor, top: anchor.getBoundingClientRect().top, scrollY: window.scrollY }
    : { scrollY: window.scrollY };
}

function restoreViewportAnchor(anchor) {
  requestAnimationFrame(() => {
    updateHeaderHeight();
    let element = anchor.element;
    if (anchor.kind === "work") {
      element = document.querySelector(
        `.period[data-period-index="${anchor.periodIndex}"] .work[data-work-index="${anchor.workIndex}"]`
      );
    }

    if (!element?.isConnected) {
      window.scrollTo({ top: anchor.scrollY, behavior: "instant" });
      return;
    }

    window.scrollTo({
      top: window.scrollY + element.getBoundingClientRect().top - anchor.top,
      behavior: "instant",
    });
  });
}

/* Set language directly */
function setLang(lang) {
  if (lang !== "en" && lang !== "el") return;

  if (lang !== currentLang) {
    const anchor = captureViewportAnchor();
    currentLang = lang;
    render();
    restoreViewportAnchor(anchor);
  }

  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch (error) {
    console.warn("Could not save the language preference:", error);
  }
}

/* Toggle language */
function toggleLang() {
  setLang(currentLang === "en" ? "el" : "en");
}

/* Keep header height in sync with CSS scroll-padding */
function updateHeaderHeight() {
  const header = document.querySelector(".site-header");
  if (header) {
    const height = header.offsetHeight;
    if (height > 0) {
      document.documentElement.style.setProperty("--header-height", `${height}px`);
    }
  }
}

/* Manage navbar visibility: hidden on the hero landing page, visible on scroll */
function initHeaderVisibility() {
  const header = document.querySelector(".site-header");
  const hero = document.getElementById("home");
  if (!header || !hero) return;

  function updateHeader() {
    const threshold = Math.max(hero.offsetHeight * 0.3, 120);
    if (window.scrollY > threshold) {
      header.classList.remove("header--hidden");
    } else {
      header.classList.add("header--hidden");
    }
  }

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  const enterBtn = document.querySelector(".btn-enter");
  if (enterBtn) {
    enterBtn.addEventListener("click", () => {
      header.classList.remove("header--hidden");
    });
  }
}

/* Highlight active nav link on scroll */
function initScrollSpy() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  if (!sections.length || !navLinks.length) return;

  function updateActiveLink() {
    const scrollPosition = window.scrollY + 160;
    let currentId = "";

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        currentId = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`);
    });
  }

  window.addEventListener("scroll", updateActiveLink, { passive: true });
  updateActiveLink();
}

/* Boot */
document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const imageLightbox = document.getElementById("image-lightbox");
  const imageLightboxView = document.querySelector(".image-lightbox-view");
  const closeImageLightbox = document.getElementById("image-lightbox-close");
  const previousImage = document.getElementById("image-lightbox-previous");
  const nextImage = document.getElementById("image-lightbox-next");
  const previewImageToggle = document.getElementById("image-lightbox-image-toggle");
  const previewImage = document.getElementById("image-lightbox-img");
  if (imageLightbox && imageLightboxView && closeImageLightbox && previousImage && nextImage
    && previewImageToggle && previewImage) {
    const activeTouches = new Map();
    let gestureStart = null;
    let pinchStart = null;
    let suppressPreviewClick = false;
    const touchDistance = (first, second) => Math.hypot(
      first.x - second.x,
      first.y - second.y
    );
    const touchCenter = (first, second) => ({
      x: (first.x + second.x) / 2,
      y: (first.y + second.y) / 2,
    });
    closeImageLightbox.addEventListener("click", () => imageLightbox.close());
    previousImage.addEventListener("click", () => showAdjacentImage(-1));
    nextImage.addEventListener("click", () => showAdjacentImage(1));
    previewImageToggle.addEventListener("click", (event) => {
      if (suppressPreviewClick) {
        suppressPreviewClick = false;
        event.preventDefault();
        return;
      }
      if (event.detail > 0 && window.matchMedia("(pointer: coarse)").matches) return;
      setPreviewZoom(previewZoom === 1 ? 2 : 1, event);
    });
    imageLightboxView.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "touch" || !previewImageToggle.contains(event.target)) return;
      event.preventDefault();
      imageLightboxView.setPointerCapture(event.pointerId);
      activeTouches.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (activeTouches.size === 1) {
        gestureStart = { x: event.clientX, y: event.clientY, zoom: previewZoom };
      } else if (activeTouches.size === 2) {
        const [first, second] = activeTouches.values();
        pinchStart = {
          distance: Math.max(1, touchDistance(first, second)),
          zoom: previewZoom,
        };
        gestureStart = null;
        suppressPreviewClick = true;
      }
    });
    imageLightboxView.addEventListener("pointermove", (event) => {
      if (!activeTouches.has(event.pointerId)) return;
      event.preventDefault();
      const previous = activeTouches.get(event.pointerId);
      activeTouches.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (activeTouches.size >= 2 && pinchStart) {
        const [first, second] = activeTouches.values();
        const center = touchCenter(first, second);
        const zoom = Math.min(4, Math.max(
          1,
          pinchStart.zoom * touchDistance(first, second) / pinchStart.distance
        ));
        setPreviewZoom(zoom, { clientX: center.x, clientY: center.y });
        suppressPreviewClick = true;
      } else if (activeTouches.size === 1 && gestureStart?.zoom > 1) {
        imageLightboxView.scrollLeft -= event.clientX - previous.x;
        imageLightboxView.scrollTop -= event.clientY - previous.y;
        if (Math.abs(event.clientX - gestureStart.x) > 5
          || Math.abs(event.clientY - gestureStart.y) > 5) {
          suppressPreviewClick = true;
        }
      }
    });
    imageLightboxView.addEventListener("pointerup", (event) => {
      if (!activeTouches.has(event.pointerId)) return;
      const start = gestureStart;
      const deltaX = event.clientX - (start?.x ?? event.clientX);
      const deltaY = event.clientY - (start?.y ?? event.clientY);
      activeTouches.delete(event.pointerId);
      if (imageLightboxView.hasPointerCapture(event.pointerId)) {
        imageLightboxView.releasePointerCapture(event.pointerId);
      }

      if (start?.zoom === 1 && activeTouches.size === 0
        && Math.abs(deltaX) >= 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
        showAdjacentImage(deltaX < 0 ? 1 : -1);
        suppressPreviewClick = true;
      }
      if (activeTouches.size < 2) pinchStart = null;
      if (activeTouches.size === 0) gestureStart = null;
      suppressPreviewClick = true;
      window.setTimeout(() => {
        suppressPreviewClick = false;
      }, 0);
    });
    imageLightboxView.addEventListener("pointercancel", (event) => {
      activeTouches.delete(event.pointerId);
      gestureStart = null;
      pinchStart = null;
    });
    imageLightbox.addEventListener("keydown", (event) => {
      if (event.target === previewImageToggle && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        setPreviewZoom(previewZoom === 1 ? 2 : 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        showAdjacentImage(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        showAdjacentImage(1);
      }
    });
    imageLightbox.addEventListener("click", (event) => {
      if (event.target === imageLightbox) imageLightbox.close();
    });
  }

  document.querySelectorAll(".lang-toggle").forEach((toggle) => {
    toggle.addEventListener("click", (event) => {
      const targetLabel = event.target.closest(".lang-label");
      if (targetLabel?.classList.contains("lang-el")) {
        setLang("el");
      } else if (targetLabel?.classList.contains("lang-en")) {
        setLang("en");
      } else {
        toggleLang();
      }
    });
  });

  fetch("content.json")
    .then((response) => {
      if (!response.ok) throw new Error(`content.json returned ${response.status}`);
      return response.json();
    })
    .then((content) => {
      SITE_CONTENT = content;
      const contactForm = document.getElementById("contact-form");
      if (contactForm) contactForm.action = `https://formsubmit.co/${SITE_CONTENT.contactEmail}`;
      render();
      updateHeaderHeight();
      window.addEventListener("resize", updateHeaderHeight, { passive: true });
      initHeaderVisibility();
      initScrollSpy();
      document.documentElement.classList.remove("is-loading");
    })
    .catch((error) => {
      console.error("Could not load portfolio content from content.json:", error);
      document.documentElement.classList.remove("is-loading");
      const errorMessage = document.getElementById("content-load-error");
      if (errorMessage) errorMessage.hidden = false;
    });
});

/* Contact form submission */
const contactForm = document.getElementById("contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const feedback = document.getElementById("form-feedback");
    const submitBtn = document.getElementById("contact-submit-btn");
    const name = document.getElementById("contact-name")?.value.trim();
    const email = document.getElementById("contact-email")?.value.trim();
    const message = document.getElementById("contact-message")?.value.trim();

    if (!name || !email || !message) {
      if (feedback) {
        feedback.className = "form-feedback error";
        feedback.textContent = t("contact.errorMsg");
      }
      return;
    }

    if (feedback) {
      feedback.className = "form-feedback";
      feedback.style.display = "none";
    }

    const originalBtnText = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = t("contact.sending");
    }

    try {
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());
      const response = await fetch(`https://formsubmit.co/ajax/${SITE_CONTENT.contactEmail}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        if (feedback) {
          feedback.className = "form-feedback success";
          feedback.style.display = "block";
          feedback.textContent = t("contact.successMsg");
        }
        contactForm.reset();
      } else {
        throw new Error("Submission failed");
      }
    } catch (err) {
      console.warn("AJAX submit failed, falling back to standard submit:", err);
      contactForm.submit();
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText || t("contact.send");
      }
    }
  });
}
