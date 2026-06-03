// Megan Gathers Wellness — shared site JS
// Mobile nav, smooth scroll for in-page anchors, contact form submit.

// Where contact-form submissions are addressed.
const CONTACT_EMAIL = "contact-form-recipient";

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

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.textContent = "";
    status.className = "form__status";

    // Let the browser surface its native required/format messages.
    if (!form.reportValidity()) return;

    const value = (name) => (form.elements[name]?.value || "").trim();
    const first = value("first-name");
    const last = value("last-name");
    const name = [first, last].filter(Boolean).join(" ");

    const subject = name
      ? `Wellness inquiry from ${name}`
      : "Wellness inquiry";

    // Build a readable email body from the filled-in fields only.
    const lines = [
      ["Name", name],
      ["Email", value("email")],
      ["Phone", value("phone")],
      ["Address", value("address")],
    ]
      .filter(([, v]) => v)
      .map(([label, v]) => `${label}: ${v}`);

    const message = value("message");
    if (message) {
      lines.push("", "I am interested in:", message);
    }

    const mailto =
      `mailto:${CONTACT_EMAIL}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(lines.join("\n"))}`;

    // Opens the visitor's default mail app with everything pre-filled.
    window.location.href = mailto;

    status.textContent =
      "Opening your email app with the message ready to send…";
    status.classList.add("is-success");
  });
}
