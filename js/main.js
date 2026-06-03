// Megan Gathers Wellness — shared site JS
// Mobile nav, smooth scroll for in-page anchors, contact form submit.

// The contact form POSTs natively to FormSubmit (action attribute in
// contact.html) and redirects back here with ?sent=1 on success.

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

  // Returning from FormSubmit's _next redirect: show the thank-you message.
  if (new URLSearchParams(window.location.search).get("sent") === "1") {
    status.textContent = "Thanks for submitting! I'll contact you within 48 hours.";
    status.classList.add("is-success");
    form.scrollIntoView({ block: "center" });
    // Clean the query string so a refresh doesn't re-show the message.
    history.replaceState(null, "", window.location.pathname);
  }

  // Native POST handles delivery; just guard against double submits.
  form.addEventListener("submit", () => {
    submit.disabled = true;
    submit.textContent = "Sending…";
  });
}
