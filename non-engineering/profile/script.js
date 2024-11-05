document.addEventListener('DOMContentLoaded', function () {
  const hamBurger = document.querySelector(".toggle-btn");

  hamBurger.addEventListener("click", function () {
      document.querySelector("#sidebar").classList.toggle("expand");
  });

  // Search functionality
  const searchBar = document.getElementById('search-bar');
  searchBar.addEventListener('input', function () {
      const searchTerm = searchBar.value.toLowerCase();
      const announcements = document.querySelectorAll('.timeline-item');

      announcements.forEach(announcement => {
          const date = announcement.querySelector('.timeline-date span').textContent.toLowerCase();
          const title = announcement.querySelector('h3').textContent.toLowerCase();
          const content = announcement.querySelector('p').textContent.toLowerCase();
          
          // Check if either the title or content includes the search term
          announcement.style.display = (title.includes(searchTerm) || content.includes(searchTerm) || date.includes(searchTerm)) ? '' : 'none';
      });
  });

  const mainContentLinks = {
      settings: document.getElementById("settings-link"),
      activityLog: document.getElementById("activity-log-link")
  };

  const contentSections = {
      settings: document.getElementById("settings-content"),
      activityLog: document.getElementById("activity-log-content")
  };

  function setActiveLink(linkId) {
      Object.values(mainContentLinks).forEach(link => link.classList.remove("active"));
      mainContentLinks[linkId].classList.add("active");
  }

  function showContent(sectionId) {
      Object.values(contentSections).forEach(section => section.classList.remove("active"));
      contentSections[sectionId].classList.add("active");
  }

  mainContentLinks.settings.addEventListener("click", function (e) {
      e.preventDefault();
      setActiveLink("settings");
      showContent("settings");
  });

  mainContentLinks.activityLog.addEventListener("click", function (e) {
      e.preventDefault();
      setActiveLink("activityLog");
      showContent("activityLog");
  });

  // Load settings by default
  setActiveLink("settings");
  showContent("settings");
  
  const department = document.getElementById('department').value;
  const machineDropdown = document.getElementById('machine');

  // Fetch machines based on department
  function fetchMachines(department) {
      fetch(`fetch_machines.php?department=${encodeURIComponent(department)}`)
          .then(response => {
              if (!response.ok) {
                  throw new Error('Network response was not ok');
              }
              return response.json();
          })
          .then(machines => {
              // Clear existing options
              machineDropdown.innerHTML = '<option value="" selected disabled>Select a machine</option>';
              
              // Populate dropdown with new options
              machines.forEach(machine => {
                  const option = document.createElement('option');
                  option.value = machine.machine_id;
                  option.textContent = `${machine.machine_name} - ID #${machine.machine_id}`;
                  machineDropdown.appendChild(option);
              });
          })
          .catch(error => {
              console.error('Error fetching machines:', error);
          });
  }

  // Fetch machines for the initial department value
  if (department) {
      fetchMachines(department);
  }

  // Form submission handling
  const repairForm = document.getElementById('repairRequestForm');
  repairForm.addEventListener('submit', function (event) {
      event.preventDefault(); // Prevent the form from submitting traditionally

      // Capture form data
      const formData = new FormData(repairForm);
      const machineId = document.getElementById('machine').value;
      const urgency = document.getElementById('urgency').value;
      const remarks = document.getElementById('remarks').value;
      const requestedBy = document.getElementById('employee-id-text').textContent; // Get the employee ID from PHP session

      // Send the data to a PHP script for processing
      formData.append('machine_id', machineId);
      formData.append('urgency', urgency);
      formData.append('details', remarks);
      formData.append('requested_by', requestedBy);

      // Log form data to the console
      console.log("Form data to be sent:", {
          "Machine ID": machineId,
          "Urgency": urgency,
          "Remarks": remarks,
          "Requested By": requestedBy
      });

      // Send the data to a PHP script for processing
      fetch('submit_repair_request.php', {
          method: 'POST',
          body: formData,
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              alert("Repair request submitted successfully.");
              repairForm.reset(); // Optionally reset the form after submission
          } else {
              alert("Error: " + data.message);
          }
      })
      .catch(error => {
          console.error('Error:', error);
          alert("There was an error submitting the repair request.");
      });
  });
});
