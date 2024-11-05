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
