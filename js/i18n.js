/* Current language; defaults to English */
let currentLang = "en";
const SITE_CONTENT = window.PORTFOLIO_CONTENT;
const STRINGS = SITE_CONTENT.translations;

/* Map data-i18n keys ("section.key") to string lookups */
function t(key) {
  const value = key.split(".").reduce((entry, part) => entry?.[part], STRINGS[currentLang]);
  return typeof value === "string" ? value : key;
}

function renderGallery() {
  const timeline = document.getElementById("timeline");
  if (!timeline) return;

  timeline.replaceChildren();
  STRINGS[currentLang].gallery.periods.forEach((period) => {
    const article = document.createElement("article");
    article.className = "period";

    const date = document.createElement("time");
    date.className = "period-date";
    date.textContent = period.date;

    const title = document.createElement("h3");
    title.className = "period-title";
    title.textContent = period.title;

    const works = document.createElement("div");
    works.className = "period-works";
    period.works.forEach((work) => {
      const figure = document.createElement("figure");
      figure.className = "work";

      const image = document.createElement("img");
      image.className = "work-img";
      image.src = work.image;
      image.alt = work.alt;

      const caption = document.createElement("figcaption");
      const workTitle = document.createElement("span");
      workTitle.className = "work-title";
      workTitle.textContent = work.title;
      const year = document.createElement("span");
      year.className = "work-year";
      year.textContent = work.year;

      caption.append(workTitle, year);
      figure.append(image, caption);
      works.append(figure);
    });

    const summary = document.createElement("p");
    summary.className = "period-summary";
    summary.textContent = period.summary;

    article.append(date, title, works, summary);
    timeline.append(article);
  });
}

function renderExhibitions() {
  const paragraph = document.getElementById("about-exhibitions");
  if (!paragraph) return;

  const items = STRINGS[currentLang].exhibitions.items
    .map((item) => `${item.date} — ${item.title}, ${item.venue}`);
  paragraph.textContent = `${STRINGS[currentLang].exhibitions.title}${items.join("; ")}.`;
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

  document.querySelectorAll(".lang-toggle").forEach((toggle) => {
    toggle.setAttribute(
      "aria-label",
      currentLang === "en" ? "Switch language to Greek" : "Αλλαγή γλώσσας σε Αγγλικά"
    );
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
    aboutImage.alt = STRINGS[currentLang].about.imageAlt;
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

  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.action = `https://formsubmit.co/${SITE_CONTENT.contactEmail}`;
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

  render();
  updateHeaderHeight();
  window.addEventListener("resize", updateHeaderHeight, { passive: true });
  initHeaderVisibility();
  initScrollSpy();
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
      submitBtn.textContent = currentLang === "en" ? "Sending..." : "Αποστολή...";
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
