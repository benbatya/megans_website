// Megan Gathers Wellness — shared site JS
// Mobile nav, smooth scroll for in-page anchors, contact form submit.

// TODO: Paste your Formspree project endpoint here once configured.
// Sign up at https://formspree.io/ and create a form to get the URL.
const FORMSPREE_ENDPOINT = "";

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initContactForm();
});

function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const panel = document.querySelector(".mobile-nav");
  if (!toggle || !panel) return;

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    panel.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    setOpen(!isOpen);
  });

  panel.addEventListener("click", (e) => {
    if (e.target.tagName === "A") setOpen(false);
  });

  // Close menu if viewport grows past mobile breakpoint
  const mq = window.matchMedia("(min-width: 820px)");
  mq.addEventListener("change", (e) => { if (e.matches) setOpen(false); });
}

function initContactForm() {
  const form = document.querySelector("form.form");
  if (!form) return;
  const status = form.querySelector(".form__status");
  const submit = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "";
    status.className = "form__status";

    if (!FORMSPREE_ENDPOINT) {
      status.textContent = "Form is not configured yet. Set FORMSPREE_ENDPOINT in js/main.js.";
      status.classList.add("is-error");
      return;
    }

    const data = new FormData(form);
    submit.disabled = true;
    const original = submit.textContent;
    submit.textContent = "Sending…";

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        form.reset();
        status.textContent = "Thanks for submitting! I'll contact you within 48 hours.";
        status.classList.add("is-success");
      } else {
        const body = await res.json().catch(() => ({}));
        status.textContent = body.error || "Sorry, something went wrong. Please try again.";
        status.classList.add("is-error");
      }
    } catch (err) {
      status.textContent = "Network error. Please check your connection and try again.";
      status.classList.add("is-error");
    } finally {
      submit.disabled = false;
      submit.textContent = original;
    }
  });
}
