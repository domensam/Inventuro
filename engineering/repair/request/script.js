document.addEventListener('DOMContentLoaded', function () {
  const hamBurger = document.querySelector(".toggle-btn");

  hamBurger.addEventListener("click", function () {
    document.querySelector("#sidebar").classList.toggle("expand");
  });

  const dataTable = $('#historyTable').DataTable({
    dom: '<"row"<"col-md-6"f><"col-md-6 text-end"B>>tip',
    buttons: [
        {
            extend: 'copy',
            text: 'Copy'
        },
        {
            extend: 'collection',
            text: 'Download',
            className: 'btn',
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
    info: true,
    columnDefs: [
        { orderable: false, targets: 0 } // Disable ordering on the first column (checkbox)
    ],
    language: {
        search: "Search: " // Customizing the search label
    }
  });

  // Handle "Select All" checkbox
  $('#selectAll').on('click', function() {
    var rows = $('#historyTable').DataTable().rows({ 'search': 'applied' }).nodes();
    $('input[type="checkbox"]', rows).prop('checked', this.checked);
  });

  // Custom Search Functionality for Table and Timeline
  const searchBar = document.getElementById('search-bar');
  searchBar.addEventListener('input', function () {
      const searchTerm = searchBar.value.toLowerCase();

      // Filter DataTable
      dataTable.search(searchTerm).draw();

      // Filter Timeline Items
      const announcements = document.querySelectorAll('.timeline-item');
      announcements.forEach(announcement => {
          const date = announcement.querySelector('.timeline-date span').textContent.toLowerCase();
          const title = announcement.querySelector('h3').textContent.toLowerCase();
          const content = announcement.querySelector('p').textContent.toLowerCase();

          // Check if any part matches the search term
          if (title.includes(searchTerm) || content.includes(searchTerm) || date.includes(searchTerm)) {
              announcement.style.display = ''; // Show matching items
          } else {
              announcement.style.display = 'none'; // Hide non-matching items
          }
      });
  });

  const mainContentLinks = {
    request: document.getElementById("request-link"),
    materials: document.getElementById("materials-link")
  };

  const contentSections = {
    request: document.getElementById("request-content"),
    materials: document.getElementById("materials-content")
  };

  function setActiveLink(linkId) {
    Object.values(mainContentLinks).forEach(link => link.classList.remove("active"));
    mainContentLinks[linkId].classList.add("active");
  }

  function showContent(sectionId) {
    Object.values(contentSections).forEach(section => section.classList.remove("active"));
    contentSections[sectionId].classList.add("active");
  }

  mainContentLinks.request.addEventListener("click", function (e) {
    e.preventDefault();
    setActiveLink("request");
    showContent("request");
  });

  mainContentLinks.materials.addEventListener("click", function (e) {
    e.preventDefault();
    setActiveLink("materials");
    showContent("materials");
  });

  // Load request by default
  setActiveLink("request");
  showContent("request");

});