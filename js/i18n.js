/* Current language; defaults to English */
let currentLang = "en";
let SITE_CONTENT;

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

function renderGallery() {
  const timeline = document.getElementById("timeline");
  if (!timeline) return;

  timeline.replaceChildren();
  SITE_CONTENT.gallery.periods.forEach((period) => {
    const article = document.createElement("article");
    article.className = "period";

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
    period.works.forEach((work) => {
      const figure = document.createElement("figure");
      figure.className = "work";

      const image = document.createElement("img");
      image.className = "work-img";
      image.src = work.image;
      image.alt = artworkDescription(work);
      image.loading = "lazy";
      image.decoding = "async";

      const imageButton = document.createElement("button");
      imageButton.className = "work-image-button";
      imageButton.type = "button";
      imageButton.setAttribute(
        "aria-label",
        t("gallery.zoomLabel").replace("{title}", localized(work.title))
      );
      imageButton.addEventListener("click", () => openImagePreview(work));

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
      figure.append(imageButton, caption);
      works.append(figure);
    });

    article.append(date, title, summary, works);
    timeline.append(article);
  });
}

function openImagePreview(work) {
  const dialog = document.getElementById("image-lightbox");
  const image = document.getElementById("image-lightbox-img");
  const caption = document.getElementById("image-lightbox-caption");
  if (!dialog || !image || !caption) return;

  image.src = work.image;
  image.alt = artworkDescription(work);
  caption.textContent = [work.title, work.details, work.year].map(localized).filter(Boolean).join(" · ");
  dialog.showModal();
}

function renderExhibitions() {
  const paragraph = document.getElementById("about-exhibitions");
  if (!paragraph) return;

  const items = SITE_CONTENT.exhibitions.items
    .map((item) => `${localized(item.date)} — ${localized(item.title)}, ${localized(item.venue)}`);
  paragraph.textContent = `${localized(SITE_CONTENT.exhibitions.title)}${items.join("; ")}.`;
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

/* Set language directly */
function setLang(lang) {
  if (lang !== currentLang) {
    currentLang = lang;
    render();
  }
}

/* Toggle language */
function toggleLang() {
  currentLang = currentLang === "en" ? "el" : "en";
  render();
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
  const closeImageLightbox = document.getElementById("image-lightbox-close");
  if (imageLightbox && closeImageLightbox) {
    closeImageLightbox.addEventListener("click", () => imageLightbox.close());
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
    })
    .catch((error) => {
      console.error("Could not load portfolio content from content.json:", error);
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
