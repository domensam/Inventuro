document.addEventListener('DOMContentLoaded', function () {
  const hamBurger = document.querySelector(".toggle-btn");

  hamBurger.addEventListener("click", function () {
    document.querySelector("#sidebar").classList.toggle("expand");
  });

  function showInfoModal(title, message) {
    document.querySelector('#infoModal .modal-title').textContent = title;
    document.querySelector('#infoModal .modal-body p').textContent = message;
    
    // Show the modal
    const infoModal = new bootstrap.Modal(document.getElementById('infoModal'));
    infoModal.show(); // Show the modal

    if (title === 'Request Details') {
      const requestDetails = document.getElementById('request-details');
      requestDetails.style.display = 'block';
    }
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
  $('#selectAll').on('click', function () {
    var rows = dataTable.rows({ 'search': 'applied' }).nodes();
    $('input[type="checkbox"]', rows).prop('checked', this.checked);
  });

  $('#itemTable').DataTable({
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
  $('#selectAllCart').on('click', function () {
    var rows = dataTable.rows({ 'search': 'applied' }).nodes();
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
    const warrantyStatus = $(this).data('warranty-status');

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

    if(warrantyStatus === 'Active') {
      const warrantyElement = document.getElementById('modalWarranty');

      warrantyElement.textContent = warrantyStatus; // Set the warranty status

      // Make the <p> element visible
      const warrantyStatusElement = warrantyElement.parentElement; // Get the parent <p> element
      warrantyStatusElement.style.display = 'block'; // Change display style to block
      $('#requestMaterialBtn').hide();
    } else {
      const warrantyElement = document.getElementById('modalWarranty');
      const warrantyStatusElement = warrantyElement.parentElement;
      warrantyStatusElement.style.display = 'none';
    }

    // Show the offcanvas modal
    const modal = new bootstrap.Offcanvas(document.getElementById('repairRequestModal'));
    modal.show();
  });

  $('#materialRequestTable').DataTable({
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

  // Main navigation links
  const mainContentLinks = {
    request: document.getElementById("request-link"),
    materials: document.getElementById("materials-link")
  };

  // Content sections
  const contentSections = {
    request: document.getElementById("request-content"),
    materials: document.getElementById("materials-content"),
    requestMaterials: document.getElementById("materials-request-content") // Ensure this exists in HTML
  };

  function setActiveLink(linkId) {
    Object.values(mainContentLinks).forEach(link => {
      if (link) link.classList.remove("active");
    });
    if (mainContentLinks[linkId]) {
      mainContentLinks[linkId].classList.add("active");
    }
  }

  function showContent(sectionId) {
    Object.values(contentSections).forEach(section => {
      if (section) section.classList.remove("active");
    });
    if (contentSections[sectionId]) {
      contentSections[sectionId].classList.add("active");
    }
  }

  // Event listeners for main content links
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

  // Offcanvas modal button event for "Request Material"
  $('#requestMaterialBtn').on('click', function () {
    const offcanvasModal = bootstrap.Offcanvas.getInstance(document.getElementById('repairRequestModal'));
    if (offcanvasModal) offcanvasModal.hide();

    const repairRequestId = $('#repairRequestIdLabel').text();
    showInfoModal('Request Material', `You have selected repair request id: ${repairRequestId}. Please proceed to request material.`);
    $('#modalRepairRequestId').text(repairRequestId);

    showContent("requestMaterials");
  });

  // Cart functionality
  let cart = []; // Initialize the cart array

  document.querySelectorAll('.add-to-cart-btn').forEach(button => {
      button.addEventListener('click', function() {
          const row = this.closest('tr'); // Get the closest table row
          const itemId = row.dataset.itemCode; // Retrieve item ID from data attribute
          const itemName = row.dataset.itemName; // Retrieve item name from data attribute
          const itemQuantity = parseInt(row.dataset.itemQuantity); // Retrieve item quantity from data attribute
  
          // Toggle the 'selected' class on the row
          const isSelected = row.classList.toggle('selected');
  
          // Get the checkbox within the current row
          const checkbox = row.querySelector('.row-checkbox');
  
          // Check or uncheck the checkbox based on the row's selection state
          checkbox.checked = isSelected;
  
          if (isSelected) {
              // If the row was not previously selected, add the item to the cart
              const existingItem = cart.find(item => item.id === itemId);
              if (existingItem) {
                  // If the item already exists in the cart, increment the quantity
                  existingItem.quantity += 1; // Change this if you want to control the quantity further
              } else {
                  // Add the item to the cart if it's not already there
                  cart.push({
                      id: itemId,
                      name: itemName,
                      quantity: 1, // Default quantity
                      available: itemQuantity
                  });
              }
          } else {
              // If the row is unselected, remove the item from the cart
              cart = cart.filter(item => item.id !== itemId); // Remove the item from the cart
          }
  
          console.log(cart); // Log the cart for debugging purposes
      });
  });  

  function openCartModal() {
    const cartModalBody = document.getElementById('cartModalBody');
    cartModalBody.innerHTML = ''; // Clear previous cart items

    cart.forEach(item => {
        const row = document.createElement('tr');

        // Create cells for item code, item name, available quantity, requested quantity, and note
        const itemCodeCell = document.createElement('td');
        itemCodeCell.textContent = item.id; // Item code
        row.appendChild(itemCodeCell);

        const itemNameCell = document.createElement('td');
        itemNameCell.textContent = item.name; // Item name
        row.appendChild(itemNameCell);

        const availableQtyCell = document.createElement('td');
        availableQtyCell.textContent = item.available; // Available quantity from cart
        row.appendChild(availableQtyCell);

        const requestedQtyCell = document.createElement('td');
        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.value = item.quantity || 1; // Default to 1 if quantity is not set
        qtyInput.min = 1; // Minimum quantity
        qtyInput.max = item.available; // Max quantity based on availability
        qtyInput.classList.add('form-control');
        qtyInput.setAttribute('data-item-id', item.id); // Set data-item-id attribute
        requestedQtyCell.appendChild(qtyInput);
        row.appendChild(requestedQtyCell);

        // Create a note cell for out of stock items
        const noteCell = document.createElement('td');
        if (item.available === 0) {
            noteCell.innerHTML = '<span class="text-danger">Not guaranteed, and ordering may take a while</span>';
        } else {
            noteCell.textContent = ''; // No note for items in stock
        }
        row.appendChild(noteCell);

        // Append the row to the cart modal body
        cartModalBody.appendChild(row);
    });

    // Show the modal
    const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
    cartModal.show();
  }

// Attach the function to the complete button
document.getElementById('completeRequestBtn').addEventListener('click', openCartModal);

document.getElementById('completeOrderBtn').addEventListener('click', function() {
  // Get the repair request ID from the modal
  const repairRequestId = document.getElementById('modalRepairRequestId').textContent;
  const requestedById = document.getElementById('employee-id-text').textContent;

  // Prepare the order data
  const orderItems = cart.map(item => {
      const qtyInput = document.querySelector(`input[data-item-id="${item.id}"]`); // Use data-item-id
      if (qtyInput) {
          return {
              id: item.id,
              name: item.name,
              quantity: parseInt(qtyInput.value), // Get the quantity input
              available: item.available
          };
      } else {
          console.error(`Quantity input not found for item: ${item.id}`);
          return null; // Return null if input is not found
      }
  }).filter(item => item !== null); // Filter out any null values

  // Check if orderItems is empty
  if (orderItems.length === 0) {
      showInfoModal('Error', 'Please select at least one item in the cart before completing the order.');
      return;
  }

  // Send the order data to your server
  $.ajax({
      url: 'process_order.php', // Adjust this to your server-side processing script
      method: 'POST',
      dataType: 'json',
      contentType: 'application/json', // Specify content type
      data: JSON.stringify({
          items: orderItems,
          repair_request_id: repairRequestId, // Include the repair request ID
          requested_by: requestedById
      }),
      success: function(response) {
        if (response.success) {
            showInfoModal('Success', response.message); // Show success message
            cart = []; // Clear the cart
            $('#cartModal').modal('hide'); // Hide the modal
        } else {
            // Handle errors returned from the server
            showInfoModal('Error', response.message); // Show the error message
            console.error('Error:', response.message);
        }
      },
      error: function(xhr, status, error) {
        console.error('AJAX Error:', xhr.responseText); // Log full response
        showInfoModal('Error', 'An error occurred while processing your order. Please try again.');
      }    
  });
});

});