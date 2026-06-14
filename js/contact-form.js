(function () {
  var form = document.getElementById("contact-form");
  if (!form) return;

  var statusEl = document.getElementById("contact-form-status");
  var submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var name = form.name.value.trim();
    var email = form.email.value.trim();
    var subject = form.subject.value.trim();
    var description = form.description.value.trim();

    if (!name) {
      showStatus("Name is required.", "error");
      return;
    }

    if (!email) {
      showStatus("Email is required.", "error");
      return;
    }

    if (!subject) {
      showStatus("Subject is required.", "error");
      return;
    }

    if (!description) {
      showStatus("Message is required.", "error");
      return;
    }

    if (window.location.protocol === "file:") {
      showStatus(
        "Do not open the HTML file directly. Run npm run dev, then visit http://localhost:3000 in your browser.",
        "error"
      );
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    showStatus("", "");

    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name, email: email, subject: subject, description: description }),
    })
      .then(function (response) {
        return response.json().then(function (data) {
          return { ok: response.ok, data: data };
        });
      })
      .then(function (result) {
        if (result.ok) {
          form.reset();
          showStatus("Thank you! Your message has been sent.", "success");
        } else {
          showStatus(result.data.error || "Something went wrong. Please try again.", "error");
        }
      })
      .catch(function () {
        showStatus(
          "Could not reach the server. Use npm run dev locally, or deploy to Vercel.",
          "error"
        );
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
      });
  });

  function showStatus(message, type) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = "contact-form-status" + (type ? " contact-form-status--" + type : "");
  }
})();
