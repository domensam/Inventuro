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

  // Fetch activity log from fetch_activity_log.php
  $(document).ready(function() {
    $('#activityLogTable').DataTable({
        dom: '<"d-flex align-items-center custom-toolbar"fB>tip',
        buttons: [
            {
                extend: 'copy',
                text: 'Copy'
            },
            {
                extend: 'collection',
                text: 'Download',
                buttons: [
                    { extend: 'csv', text: 'CSV' },
                    { extend: 'excel', text: 'Excel' },
                    { extend: 'pdf', text: 'PDF' }
                ]
            },
            {
                extend: 'print',
                text: 'Print'
            }
        ],
        paging: true,
        searching: true,
        ordering: true,
        info: true
    });
});
document.getElementById('updateProfileForm').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent default form submission

  const firstName = document.querySelector('[name="first_name"]').value.trim();
  const lastName = document.querySelector('[name="last_name"]').value.trim();
  const middleName = document.querySelector('[name="middle_name"]').value.trim();
  const currentPassword = document.getElementById('current-password').value.trim();
  const newPassword = document.getElementById('new-password').value.trim();
  const confirmPassword = document.getElementById('confirm-password').value.trim();

  // Basic validation
  if (!firstName || !lastName) {
      alert("First Name and Last Name are required.");
      return;
  }
  
  if(currentPassword) {
    if(newPassword !== confirmPassword) {
      alert("New Password and Confirm Password do not match.");
      return;
    }
    else {
      if(newPassword.length < 8) {
        alert("New Password must be at least 8 characters long.");
        return;
      }
      if(!newPassword.match(/[a-z]/g)) {
        alert("New Password must contain at least one lowercase letter.");
        return;
      }
      if(!newPassword.match(/[A-Z]/g)) {
        alert("New Password must contain at least one uppercase letter.");
        return;
      }
      if(!newPassword.match(/[0-9]/g)) {
        alert("New Password must contain at least one number.");
        return;
      }
    }
  }

  if(!currentPassword && (newPassword || confirmPassword)) {
    alert("Current Password is required.");
    return;
  }

  // Prepare form data
  const formData = new FormData();
  formData.append('first_name', firstName);
  formData.append('last_name', lastName);
  formData.append('middle_name', middleName);
  formData.append('current_password', currentPassword);
  formData.append('new_password', newPassword);
  formData.append('confirm_password', confirmPassword);

  // Handle profile image
  const profileImageInput = document.getElementById('profile-picture-input');
  if (profileImageInput.files.length > 0) {
      const file = profileImageInput.files[0];
      const reader = new FileReader();
      reader.onloadend = function() {
          const base64String = reader.result.split(',')[1]; // Get base64 string without header
          formData.append('image', base64String); // Append the base64 image
          submitForm(formData); // Now submit the form
      };
      reader.readAsDataURL(file);
  } else {
      submitForm(formData); // Submit without image if no file selected
  }
});

function submitForm(formData) {
  fetch('update_profile.php', {
      method: 'POST',
      body: formData
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
          alert("Profile updated successfully.");
          window.location.reload();
      } else {
          alert(data.message);
      }
  })
  .catch(error => {
      console.error("Error updating profile:", error);
  });
}

document.getElementById('toggle-password-visibility').addEventListener('change', function () {
  const passwordFields = [
      document.getElementById('current-password'),
      document.getElementById('new-password'),
      document.getElementById('confirm-password')
  ];
  
  passwordFields.forEach(field => {
      field.type = this.checked ? 'text' : 'password';
  });
});

});
