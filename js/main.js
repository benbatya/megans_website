// Megan Gathers Wellness — shared site JS
// Mobile nav, smooth scroll for in-page anchors, contact form submit.

// FormSubmit AJAX endpoint (https://formsubmit.co/el/xuroge — the email
// address behind it is configured on formsubmit.co, not in this code).
const FORM_ENDPOINT = "https://formsubmit.co/ajax/xuroge";

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

    // Let the browser surface its native required/format messages.
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    submit.disabled = true;
    const original = submit.textContent;
    submit.textContent = "Sending…";

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.success !== "false") {
        form.reset();
        status.textContent = "Thanks for submitting! I'll contact you within 48 hours.";
        status.classList.add("is-success");
      } else {
        status.textContent = body.message || "Sorry, something went wrong. Please try again.";
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
