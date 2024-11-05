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
      if (title.includes(searchTerm) || content.includes(searchTerm) || date.includes(searchTerm)) {
        announcement.style.display = ''; // Show matching items
      } else {
        announcement.style.display = 'none'; // Hide non-matching items
      }
    });
  });

  const mainContentLinks = {
    dashboard: document.getElementById("request-link"),
    announcement: document.getElementById("history-link")
  };

  const contentSections = {
    dashboard: document.getElementById("request-content"),
    announcement: document.getElementById("history-content")
  };

  function setActiveLink(linkId) {
    Object.values(mainContentLinks).forEach(link => link.classList.remove("active"));
    mainContentLinks[linkId].classList.add("active");
  }

  function showContent(sectionId) {
    Object.values(contentSections).forEach(section => section.classList.remove("active"));
    contentSections[sectionId].classList.add("active");
  }

  mainContentLinks.dashboard.addEventListener("click", function (e) {
    e.preventDefault();
    setActiveLink("dashboard");
    showContent("dashboard");
  });

  mainContentLinks.announcement.addEventListener("click", function (e) {
    e.preventDefault();
    setActiveLink("announcement");
    showContent("announcement");
  });

  // Load dashboard by default
  setActiveLink("dashboard");
  showContent("dashboard");
  
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

    const repairForm = document.getElementById('repairRequestForm');

    repairForm.addEventListener('submit', function (event) {

      event.preventDefault(); // Prevent the form from submitting traditionally

      // Capture form data
      const formData = new FormData(repairForm);

      // Capture form data
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
      console.log("Form data to be sent:");
      console.log("Machine ID:", document.getElementById('machine').value);
      console.log("Urgency:", document.getElementById('urgency').value);
      console.log("Remarks:", document.getElementById('remarks').value);
      console.log("Requested By:", document.getElementById('employee-id-text').textContent); // logged from PHP session

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

  $(document).ready(function() {
    $('#historyTable').DataTable({
        dom: '<"row"<"col-md-6"f><"col-md-6"B>>tip',
        buttons: [
            'copy', 'csv', 'excel', 'pdf', 'print'
        ],
        paging: true,
        searching: true,
        ordering: true,
        info: true,
        columnDefs: [
            { orderable: false, targets: 0 }
        ]
    });

    // Handle "Select All" checkbox
    $('#selectAll').click(function() {
        var rows = $('#historyTable').DataTable().rows({ 'search': 'applied' }).nodes();
        $('input[type="checkbox"]', rows).prop('checked', this.checked);
    });
});

});