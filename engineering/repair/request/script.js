document.addEventListener('DOMContentLoaded', function () {
  const hamBurger = document.querySelector(".toggle-btn");

  hamBurger.addEventListener("click", function () {
    document.querySelector("#sidebar").classList.toggle("expand");
  });

  function showInfoModal(title, message) {
    document.querySelector('#infoModal .modal-title').textContent = title;
    document.querySelector('#infoModal .modal-body p').textContent = message;
    $('#infoModal').modal('show');
  }

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

  // Event listener for row clicks
  $('#historyTable tbody').on('click', 'tr', function () {
      // Get data from the clicked row
      const repairRequestId = $(this).data('repair-request-id');
      const dateRequested = $(this).data('date-requested');
      const machineName = $(this).data('machine-name');
      const department = $(this).data('department');
      const urgency = $(this).data('urgency');
      const status = $(this).data('status');
      const requestedBy = $(this).data('requested-by');
      const details = $(this).data('details');

      // Populate modal fields
      $('#repairRequestIdLabel').text(repairRequestId);
      $('#modalDateRequested').text(dateRequested);
      $('#modalMachineName').text(machineName);
      $('#modalDepartment').text(department);
      $('#modalUrgency').text(urgency);
      $('#modalStatus').text(status);
      $('#modalRequestedBy').text(requestedBy);
      $('#modalDetails').text(details);

      // Conditionally display the Request Material button based on status
      if (status === 'Not Started') {
          $('#requestMaterialBtn').show();
      } else {
          $('#requestMaterialBtn').hide();
      }

      // Show the offcanvas modal
      const modal = new bootstrap.Offcanvas(document.getElementById('repairRequestModal'));
      modal.show();
  });

  $('#requestMaterialBtn').on('click', function() {
    // Close modal
    const offcanvasModal = bootstrap.Offcanvas.getInstance(document.getElementById('repairRequestModal'));
    offcanvasModal.hide();
    
    const repairRequestId = $('#repairRequestIdLabel').text();
    showInfoModal('Request Material', `You have selected repair request id: ${repairRequestId}. Please proceed to request material.`);
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