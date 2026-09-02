document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;
        const title = document.createElement("h4");
        title.textContent = name;

        const description = document.createElement("p");
        description.textContent = details.description;

        const schedule = document.createElement("p");
        const scheduleLabel = document.createElement("strong");
        scheduleLabel.textContent = "Schedule:";
        schedule.appendChild(scheduleLabel);
        schedule.append(` ${details.schedule}`);

        const availability = document.createElement("p");
        const availabilityLabel = document.createElement("strong");
        availabilityLabel.textContent = "Availability:";
        availability.appendChild(availabilityLabel);
        availability.append(` ${spotsLeft} spots left`);

        const participantsContainer = document.createElement("div");
        participantsContainer.className = "participants";

        const participantsLabel = document.createElement("strong");
        participantsLabel.textContent = "Participants";

        const participantsList = document.createElement("ul");
        details.participants.forEach((participant) => {
          const participantItem = document.createElement("li");
          const participantName = document.createElement("span");
          participantName.textContent = participant;

          const removeButton = document.createElement("button");
          removeButton.className = "remove-participant";
          removeButton.type = "button";
          removeButton.dataset.activity = name;
          removeButton.dataset.email = participant;
          removeButton.setAttribute("aria-label", `Remove ${participant} from ${name}`);
          removeButton.title = "Remove participant";
          removeButton.textContent = "×";

          participantItem.append(participantName, removeButton);
          participantsList.appendChild(participantItem);
        });

        participantsContainer.append(participantsLabel, participantsList);
        activityCard.append(title, description, schedule, availability, participantsContainer);

        activitiesList.appendChild(activityCard);

        activityCard.querySelectorAll(".remove-participant").forEach((button) => {
          button.addEventListener("click", async () => {
            try {
              const response = await fetch(
                `/activities/${encodeURIComponent(button.dataset.activity)}/participants?email=${encodeURIComponent(button.dataset.email)}`,
                { method: "DELETE" }
              );

              const result = await response.json();
              messageDiv.textContent = result.message || result.detail || "An error occurred";
              messageDiv.className = response.ok ? "success" : "error";
              messageDiv.classList.remove("hidden");

              if (response.ok) {
                activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';
                await fetchActivities();
              }
            } catch (error) {
              messageDiv.textContent = "Failed to remove participant. Please try again.";
              messageDiv.className = "error";
              messageDiv.classList.remove("hidden");
              console.error("Error removing participant:", error);
            }
          });
        });

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
