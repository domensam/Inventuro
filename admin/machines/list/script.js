document.addEventListener('DOMContentLoaded', function () {
    const editMachineBtn = document.getElementById('editMachineBtn');
    const editImageBtn = document.getElementById('editImageBtn');
    const removeImageBtn = document.getElementById('removeImageBtn');

    const modalMachineName = document.getElementById('modalMachineName');
    const modalDepartmentName = document.getElementById('modalDepartmentName');
    const modalDescription = document.getElementById('modalDescription');

    const machineIntervalModal = document.getElementById('machineIntervalModal');

    const editItemActionBtn = document.getElementById('editItemActionBtn');
    const deleteItemActionBtn = document.getElementById('deleteItemActionBtn');

    let isEditing = false; // Track if the modal is in edit mode

    const itemTable = $('#itemTable').DataTable({
        autoWidth: false,
        pageLength: 10,
        lengthMenu: [10, 25, 50, 100],
        processing: true,
        searching: true,
        order: [],
        columnDefs: [{ orderable: false, targets: [0] }]
    });

    var calendarEl = document.getElementById('calendar');
        
    // Disable image edit/remove buttons initially
    editImageBtn.disabled = true;
    removeImageBtn.disabled = true;

    // Disable input fields initially
    disableModalInputs();

    // Enable image buttons when the edit button is clicked
    editMachineBtn.addEventListener('click', function () {
        if (!isEditing) {
            // Switch to edit mode
            editMachineBtn.textContent = 'Save';
            editImageBtn.disabled = false;
            removeImageBtn.disabled = false;
            // Enable input fields for editing
            enableModalInputs();
            isEditing = true;
        } else {
            // Save changes and switch back to view mode
            const updatedItem = getModalInputValues();
            saveItemData(updatedItem); // Call save function
        }
    });

    function getBase64Image(img) {
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");

        // Ensure canvas matches image dimensions
        canvas.width = img.naturalWidth;  // Use naturalWidth to get the actual image dimensions
        canvas.height = img.naturalHeight; // Use naturalHeight

        // Draw the image onto the canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert canvas to base64 (data URL)
        var dataURL = canvas.toDataURL("image/jpeg"); // Use 'image/jpeg' for JPEG format, or adjust for other formats
        return dataURL.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""); // Strip the base64 header
    }

    function getModalInputValues() {
        var imageElement = document.getElementById('itemProfileImage'); // Get the image element
        var imageData = ''; // Initialize imageData as an empty string

        // Check if the image element has a valid source
        if (imageElement && imageElement.src) {
            imageData = getBase64Image(imageElement); // Convert image to base64
        }

        return {
            machine_id: $('#modalMachineCodeText').text(),
            machine_name: modalMachineName.value,
            department_id: modalDepartmentName.value,
            description: modalDescription.value,
            machine_maintenance_interval_days: $('#modalMaintenanceScheduleText').text(),
            // Add base64 encoded image
            image: imageData
        };
    }

    // Save updated data to the database
    function saveItemData(user) {
        $.ajax({
            url: 'update_machine.php', // Adjust this to your endpoint
            method: 'POST',
            data: user,
            dataType: 'json', // Expect JSON from the server
            success: function (response) {
                console.log('Response received:', response); // Log server response

                editImageBtn.disabled = true;
                removeImageBtn.disabled = true;

                // Disable input fields for editing
                disableModalInputs();
                isEditing = false;

                editMachineBtn.textContent = 'Edit'; // Change button back to "Edit"
                window.location.reload();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.error('AJAX error:', textStatus, errorThrown); // Detailed logging
                console.error('Response text:', jqXHR.responseText); // Log response text

                alert(`Failed to update machine. Please try again. Error: ${textStatus}`);
            }
        });
    }

    // Function to enable input fields
    function enableModalInputs() {
        modalMachineName.disabled = false;
        modalDepartmentName.disabled = false;
        modalDescription.disabled = false;
    }

    // Function to disable input fields
    function disableModalInputs() {
        modalMachineName.disabled = true;
        modalDepartmentName.disabled = true;
        modalDescription.disabled = true;
    }

    // Edit Image button functionality
    editImageBtn.addEventListener('click', function () {
        uploadImageInput.click();

        const allowedFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        const maxFileSize = 20 * 1024 * 1024; // 20 MB in bytes

        uploadImageInput.addEventListener('change', function () {
            const selectedFile = this.files[0];

            if (selectedFile) {
                const fileType = selectedFile.type;
                const fileSize = selectedFile.size;

                if (!allowedFileTypes.includes(fileType)) {
                    alert('Only JPEG, PNG, and JPG images are allowed');
                    return;
                }

                if (fileSize > maxFileSize) {
                    alert('Maximum file size is 20 MB');
                    return;
                }

                const reader = new FileReader();
                reader.onload = function (e) {
                    const image = new Image();
                    image.src = e.target.result;
                    image.onload = function () {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = image.naturalWidth; // Use naturalWidth for original dimensions
                        canvas.height = image.naturalHeight; // Use naturalHeight for original dimensions
                        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

                        // Set the image source with the canvas result (base64 encoded image)
                        document.getElementById('itemProfileImage').src = canvas.toDataURL('image/jpeg');

                    };
                };
                reader.readAsDataURL(selectedFile);
            }
        });
    });

    // Remove Image button functionality
    removeImageBtn.addEventListener('click', function () {
        $('#removeImageModal').modal('show');

        // Handle the confirm removal action
        $('#confirmRemoveImageBtn').on('click', function () {
            $('#itemProfileImage').attr('src', "../../../images/gallery.png"); // Put the default image
            $('#removeImageModal').modal('hide'); // Hide the modal
        });
    });

    // Select all checkboxes when the header checkbox is clicked
    $('#selectAll').on('click', function () {
        const isChecked = $(this).is(':checked');
        $('.row-checkbox').prop('checked', isChecked);
    });

    // Open modal and populate it with user data when a row is clicked
    $('#itemTable tbody').on('click', 'tr', function (event) {
        const checkbox = $(this).find('.row-checkbox');

        // Toggle checkbox state and row selection
        checkbox.prop('checked', !checkbox.prop('checked'));
        $(this).toggleClass('selected', checkbox.prop('checked'));

        // Check how many rows are selected
        const selectedCount = $('.row-checkbox:checked').length;

        // Enable edit button if only one row is selected
        if (selectedCount === 1) {
            // Reset edit button and state if in editing mode
            if (isEditing) {
                isEditing = false; // Reset edit mode
                editMachineBtn.textContent = 'Edit'; // Reset button text
            }
            
            editImageBtn.disabled = true;
            removeImageBtn.disabled = true;

            // Extract data from the selected row
            const code = $(this).data('machine-id');
            const name = $(this).data('machine-name');
            const departmentId = $(this).data('department-id');
            const description = $(this).data('machine-description');
            const createdBy = $(this).data('machine-created-by');
            const createdAt = $(this).data('machine-created-at');
            const warrantyStatus = $(this).data('warranty-status');
            const imgSrc = $(this).data('image');

            // Populate the modal with item data
            $('#modalMachineNameText').text(name);  // Display the item name
            $('#modalMachineCodeText').text(code); // Display the item code

            // Set the item  image or default icon
            $('#itemProfileImage').attr('src', imgSrc || '../../../images/gallery.png');

            modalMachineName.value = name;
            modalDepartmentName.value = departmentId;
            modalDescription.value = description;

            $('#modalCreatedByNameText').text(createdBy);
            $('#modalCreatedAtText').text(createdAt);

            // Disable inputs before showing the modal
            disableModalInputs();

            if (warrantyStatus !== 'No warranty') {
                // Populate the warranty details in the modal
                $('#companyName').text($(this).data('warranty-company-name'));
                $('#startDate').text($(this).data('warranty-start-date'));
                $('#endDate').text($(this).data('warranty-end-date'));
                $('#details').text($(this).data('warranty-coverage-details'));
                $('#contactNumber').text($(this).data('warranty-contact-info'));

                underWarrantySection.classList.toggle('d-none', false);
                
            } else {
                underWarrantySection.classList.toggle('d-none', true);
            }

            fetchMachineParts(code);

            // Open the offcanvas modal
            const modal = new bootstrap.Offcanvas('#machineInfoModal');
            modal.show();
        }
        else {
            // Reset edit button and state if in editing mode
            if (isEditing) {
                isEditing = false; // Reset edit mode
                editMachineBtn.textContent = 'Edit'; // Reset button text
            }

        }
    });

    // Function to fetch machine parts based on machine ID
    function fetchMachineParts(machineId) {
        $.ajax({
            url: 'fetch_parts.php', // Path to your PHP script
            method: 'GET',
            data: {
                machine_id: machineId // Pass the machine_id as a parameter
            },
            dataType: 'json',
            success: function(response) {
                if (response.message) {
                    // Handle any error messages from the server
                    alert(response.message);
                } else {
                    // If parts are found, update the HTML
                    let partDetails = '';
                    response.forEach(function(part) {
                        partDate = `<p>${part.replacement_date} : ${part.replacement_hours} of maintenance hours</p>`;
                        partDetails += `<p>${part.machine_parts_name} : Remaining ${part.current_operating_hours} hours</p>`;
                    });

                    // Inject the part details into the modal
                    $('#modalMaintenanceDateText').html(partDate);
                    $('#modalMaintenancePartText').html(partDetails);
                }
            },
            error: function(xhr, status, error) {
                // Handle any AJAX errors
                alert('Error: ' + error);
            }
        });
    }

    document.getElementById('underWarrantySection').addEventListener('click', function () {
        $('#warrantyModal').modal('show');
    })

    document.getElementById('addWarrantyBtn').addEventListener('click', function() {
        // $('#addWarrantyModal').modal('show');
        alert('Button Clicked');
    });

    // Prevent opening the modal if multiple rows are selected
    $('.row-checkbox').on('change', function () {
        const selectedCount = $('.row-checkbox:checked').length;

        if (selectedCount > 1) {
            const modal = bootstrap.Offcanvas.getInstance('#machineInfoModal');
            if (modal) modal.hide();
        }
    });

    // Open the Add User offcanvas modal
    document.getElementById('addItemBtn').addEventListener('click', function() {
        // const addMachineModal = new bootstrap.Offcanvas(document.getElementById('addMachineModal'));
        // addMachineModal.show();
        const defaultView = document.querySelector('.default-view');
        const addMachineView = document.querySelector('.add-machine-view');

        // Toggle visibility
        defaultView.style.display = 'none';
        addMachineView.style.display = 'block';

    });
    
    document.getElementById('saveItemBtn').addEventListener('click', function() {
        // Collect input values
        const machineName = document.getElementById('addMachineName').value;
        const type = document.getElementById('addType').value;
        const model = document.getElementById('addModel').value;
        const manufacturer = document.getElementById('addManufacturer').value;
        const manufacturedYear = document.getElementById('addManufactureYear').value;
        const maintenanceInterval = document.getElementById('addMaintenanceInterval').value;
        const description = document.getElementById('addMachineDescription').value || '';
        const departmentID = document.getElementById('addDepartmentID').value; // Get department ID
    
        const imgElement = document.getElementById('previewItemImage');
        let imageData = getBase64Image(imgElement);
    
        const createdBy = loggedInEmployeeId;
        
        // Get current timestamp in format YYYY-MM-DD HH:MM:SS
        const now = new Date();
        const createdAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ` +
                          `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
        // Pass data to AJAX function
        saveMachineToDatabase(machineName, type, model, manufacturer, manufacturedYear, maintenanceInterval, description, departmentID, imageData, createdBy, createdAt);
    });
    
    function saveMachineToDatabase(machineName, type, model, manufacturer, manufacturedYear, maintenanceInterval, description, departmentID, imageData, createdBy, createdAt) {
        $.ajax({
            url: 'add_machine.php',
            method: 'POST',
            dataType: 'json',
            data: {
                machine_name: machineName,
                machine_type: type,
                machine_model: model,
                machine_manufacturer: manufacturer,
                machine_year_of_manufacture: manufacturedYear,
                machine_maintenance_interval_days: maintenanceInterval,
                machine_description: description,
                department_id: departmentID, // Pass department ID
                machine_created_by: createdBy,
                machine_created_at: createdAt,
                image: imageData
            },
            success: function(response) {
                console.log(response);
    
                const addMachineModal = new bootstrap.Offcanvas(document.getElementById('addMachineModal'));
                addMachineModal.hide();
    
                window.location.reload();
            },
            error: function(xhr, status, error) {
                console.error('Raw response:', xhr.responseText);
    
                let response;
                try {
                    response = JSON.parse(xhr.responseText);
                    console.error('Error:', response.errors || response.message);
                    alert('Error adding machine. Check console for details.');
                } catch (e) {
                    console.error('Failed to parse JSON. Raw response:', xhr.responseText);
                    alert('Server returned an invalid response. Check console for details.');
                }
            }
        });
    }    
    
    document.getElementById('addItemImage').addEventListener('change', function (event) {
        const file = event.target.files[0];

        if (file) {
            const allowedFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            const maxFileSize = 5 * 1024 * 1024; // 5 MB limit

            if (!allowedFileTypes.includes(file.type)) {
                alert('Invalid file type. Only JPEG and PNG are allowed.');
                return;
            }

            if (file.size > maxFileSize) {
                alert('File size exceeds the limit of 5 MB.');
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('previewItemImage').src = e.target.result; // Set the preview image source
            };
            reader.readAsDataURL(file); // Read the selected file as a data URL
        } else {
            document.getElementById('previewItemImage').src = '../../images/person-circle.png'; // Reset to default image if no file
        }
    });

    // Open confirmation modal for deletion
    document.getElementById('deleteMachineBtn').addEventListener('click', function() {
        // Get machine information
        const machineName = $('#modalMachineNameText').text();
        const machineId = $('#modalMachineCodeText').text();

        // Display machine name in the confirmation modal
        document.getElementById('displayMachineName').textContent = machineName;

        // Show the confirmation modal
        $('#confirmDeleteModal').modal('show');
        
        // Set up confirmation button to handle deletion
        document.getElementById('confirmDeleteBtn').onclick = function() {
            const inputMachineName = document.getElementById('confirmMachineName').value.trim();

            // Check if machine names match
            if (inputMachineName === machineName) {
                $.ajax({
                    url: 'delete_machine.php', // The PHP file that handles deletion
                    method: 'POST',
                    data: { machine_id: machineId }, // Send machine ID for deletion
                    success: function(response) {
                        // Reload the page to reflect changes
                        window.location.reload();
                    },
                    error: function(xhr, status, error) {
                        alert('Error deleting machine. Please try again.');
                        console.error('Error:', xhr.responseText);
                    }
                });
                $('#confirmDeleteModal').modal('hide'); // Hide modal after confirming
            } else {
                alert('Machine name does not match. Please try again.');
            }
        };
    });


    $('#editMaintenanceScheduleBtn').on('click', function(event) {
        event.preventDefault();  // Prevent default anchor behavior

        $('#machineIntervalModal').modal('show');  // Show the modal

        $('#machineIntervalModal').on('shown.bs.modal', function() {
            $(this).find('input').focus();  // Focus on an input field inside the modal (optional)
        });
    });

    $('#editQuantityBtn').on('click', function(event) {
        event.preventDefault();  // Prevent default anchor behavior
        window.location.href = '../adjustments/index.php?openModal=true';
    });

    const hamBurger = document.querySelector(".toggle-btn");
        hamBurger.addEventListener("click", function () {
        document.querySelector("#sidebar").classList.toggle("expand");
    });

    function validateStep(step) {
        let isValid = true; // Assume valid until a validation fails
    
        // Define required fields for Step 1
        if (step === 1) {
            const fields = [
                { id: 'machineName', name: 'Machine Name' },
                { id: 'serialNumber', name: 'Serial Number' },
                { id: 'department', name: 'Department' },
                { id: 'manufacturer', name: 'Manufacturer' },
                { id: 'manufacturedDate', name: 'Manufactured Date' }
            ];
        
            let isValid = true; // Initialize validation flag
        
            // Loop through the fields and validate them
            fields.forEach(field => {
                const input = document.getElementById(field.id);
                if (!input.value.trim()) {
                    // Add 'is-invalid' class for invalid fields
                    input.classList.add('is-invalid');
                    isValid = false; // Mark as invalid
                } else {
                    // Remove 'is-invalid' class for valid fields
                    input.classList.remove('is-invalid');
        
                    // Additional validation for the serialNumber field
                    if (field.id === 'serialNumber') {
                        const serialNumber = input.value.trim();
                        if (serialNumber.length !== 12 && serialNumber.length !== 16) {
                            input.classList.add('is-invalid');
                            isValid = false; // Mark as invalid if length condition is not met
                            input.focus();
                        } else {
                            input.classList.remove('is-invalid');
                        }
                    }
        
                    // Additional validation for the manufacturer field
                    if (field.id === 'manufacturer') {
                        const manufacturer = input.value.trim();
                        const newManufacturerInput = document.getElementById('newManufacturer');
                        // Access the select element
                        const manufacturerSelect = document.getElementById('manufacturer');
                        // Get the selected option's text (name)
                        const selectedOptionName = manufacturerSelect.options[manufacturerSelect.selectedIndex].textContent;

                        if (manufacturer === 'other') {
                            if (!newManufacturerInput || newManufacturerInput.value.trim() === '') {
                                newManufacturerInput?.classList.add('is-invalid');
                                isValid = false; // Mark as invalid if input is empty
                                newManufacturerInput?.focus();
                            } else {
                                newManufacturerInput.classList.remove('is-invalid');
                                document.getElementById('providerName').value = newManufacturerInput.value;
                            }
                        } else {
                            if (newManufacturerInput) {
                                newManufacturerInput.classList.add('d-none');
                                newManufacturerInput.classList.remove('is-invalid');
                                newManufacturerInput.value = ''; // Clear the input
                            }
                            document.getElementById('providerName').value = selectedOptionName;
                        }
                    }
                }
            });
        
            return isValid; // Return overall validation result
        }

        // Validation for Step 2
        if (step === 2) {
            const selectedCards = document.querySelectorAll('.card input[type="checkbox"]:checked');

            selectedCards.forEach(cardCheckbox => {
                const card = cardCheckbox.closest('.card');
                const maintenanceField = card.querySelector('input[name="maintenanceInterval"]');
                const replacementField = card.querySelector('input[name="replacementLifespan"]');
                const quantityField = card.querySelector('input[name="quantity"]');
                const otherFields = card.querySelectorAll('.part-details input, .part-details select, .part-details textarea');

                // General validation for all fields
                otherFields.forEach(field => {
                    if (!field.value.trim()) {
                        field.classList.add('is-invalid');
                        isValid = false;
                    } else {
                        field.classList.remove('is-invalid');
                    }
                });

                // Additional validation for quantity
                if (quantityField && quantityField.value < 1) {
                    quantityField.classList.add('is-invalid');
                    isValid = false;
                } else if (quantityField) {
                    quantityField.classList.remove('is-invalid');
                }

                // Additional validation for maintenance interval
                if (maintenanceField && maintenanceField.value < 24) {
                    maintenanceField.classList.add('is-invalid');
                    isValid = false;
                } else if (maintenanceField) {
                    maintenanceField.classList.remove('is-invalid');
                }

                // Additional validation for replacement lifespan
                if (replacementField && replacementField.value < 24) {
                    replacementField.classList.add('is-invalid');
                    isValid = false;
                } else if (replacementField) {
                    replacementField.classList.remove('is-invalid');
                }
            });

            // Ensure at least one card is selected
            if (selectedCards.length === 0) {
                alert('Please select at least one part to proceed.');
                isValid = false;
            }
        }
    
        return isValid; // Return whether the step is valid
    }
    
    function nextStep(step) {
        // Validate the current step before proceeding
        const currentStep = step - 1; // Assuming you're coming from the previous step
        if (!validateStep(currentStep)) {
            return; // Stop if validation fails
        }
    
        // Hide all step contents
        document.querySelectorAll('.step').forEach(stepDiv => stepDiv.classList.add('d-none'));
        // Show the selected step content
        document.getElementById(`step${step}`).classList.remove('d-none');
    
        // Reset all buttons to secondary
        document.querySelectorAll('.steps button').forEach(btn => {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
        });
    
        // Highlight the current step's button
        document.getElementById(`step${step}-button`).classList.add('btn-primary');
        document.getElementById(`step${step}-button`).classList.remove('btn-secondary');
    }    
    
    function prevStep(step) {
        // Hide all step contents
        document.querySelectorAll('.step').forEach(stepDiv => stepDiv.classList.add('d-none'));
        // Show the selected step content
        document.getElementById(`step${step}`).classList.remove('d-none');
    
        // Reset all buttons to secondary
        document.querySelectorAll('.steps button').forEach(btn => {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
        });
    
        // Highlight the current step's button
        document.getElementById(`step${step}-button`).classList.add('btn-primary');
        document.getElementById(`step${step}-button`).classList.remove('btn-secondary');
    }
    
    window.nextStep = nextStep;
    window.prevStep = prevStep;

    const manufacturedDateInput = document.getElementById('manufacturedDate');
    const startDateInput = document.getElementById('startDate');
    const expirationDateInput = document.getElementById('expirationDate');

    // Set current date as initial value and maximum for manufacturedDate
    const today = new Date(); // Today's date as a Date object
    const formattedToday = today.toISOString().split('T')[0]; // Format YYYY-MM-DD
    const tomorrow = new Date(today); // Clone today's date
    tomorrow.setDate(today.getDate() + 1); // Add one day to calculate tomorrow

    // Set default and limits for manufacturedDate
    manufacturedDateInput.value = formattedToday;
    manufacturedDateInput.max = formattedToday;

    // Set default and limits for startDate
    startDateInput.min = formattedToday;
    startDateInput.value = formattedToday;
    startDateInput.max = formattedToday; // Start date cannot be in the future

    // Set minimum for expirationDate
    expirationDateInput.min = tomorrow.toISOString().split('T')[0]; // At least tomorrow

    // Update startDate limits when manufacturedDate changes
    manufacturedDateInput.addEventListener('change', () => {
        const selectedManufacturedDate = new Date(manufacturedDateInput.value);

        // Ensure manufacturedDate cannot set startDate earlier than itself
        startDateInput.min = manufacturedDateInput.value;
        if (new Date(startDateInput.value) < selectedManufacturedDate) {
            startDateInput.value = manufacturedDateInput.value;
        }
    });

    // Update expirationDate limits when startDate changes
    startDateInput.addEventListener('change', () => {
        const selectedStartDate = new Date(startDateInput.value);

        // Calculate the day after the selected start date
        const nextDay = new Date(selectedStartDate);
        nextDay.setDate(selectedStartDate.getDate() + 1);

        // Set expirationDate minimum to the next day
        expirationDateInput.min = nextDay.toISOString().split('T')[0];

        // Clear expiration date if it is invalid
        if (expirationDateInput.value && new Date(expirationDateInput.value) < nextDay) {
            expirationDateInput.value = ""; // Clear invalid expiration date
        }
    });

    // Validate expirationDate when it changes
    expirationDateInput.addEventListener('change', () => {
        const startDate = new Date(startDateInput.value);
        const expirationDate = new Date(expirationDateInput.value);

        // Ensure expirationDate is at least one day after startDate
        const validMinDate = new Date(startDate);
        validMinDate.setDate(validMinDate.getDate() + 1);

        if (expirationDate < validMinDate) {
            alert("Expiration date must be at least one day after the start date.");
            expirationDateInput.value = ""; // Clear invalid expiration date
        }
    });

    function toggleManufacturerInput() {
        const manufacturerSelect = document.getElementById('manufacturer');
        const newManufacturerInput = document.getElementById('newManufacturer');
    
        // Show input field if "Other" is selected
        if (manufacturerSelect.value === 'other') {
            newManufacturerInput.classList.remove('d-none');
            newManufacturerInput.required = true; // Make it required
        } else {
            newManufacturerInput.classList.add('d-none');
            newManufacturerInput.value = ''; // Clear the input
            newManufacturerInput.required = false; // Remove the required attribute
        }
    }
    
    const manufacturerSelect = document.getElementById('manufacturer');
    manufacturerSelect.addEventListener('change', toggleManufacturerInput);

    function fetchMachineParts() {
        const templateId = document.getElementById('template').value;

        if (!templateId) return;
    
        fetch(`fetch_machine_parts.php?template_id=${templateId}`)
            .then(response => response.json())
            .then(data => {
                const partsList = document.getElementById('machinePartsList');
                partsList.innerHTML = ''; // Clear existing parts
    
                if (data.length === 0) {
                    partsList.innerHTML = '<p>No parts found for this template.</p>';
                } else {
                    data.forEach(part => {
                        const card = document.createElement('div');
                        card.classList.add('card', 'mb-3', 'shadow-sm');
    
                        card.innerHTML = `
                            <div class="card-header d-flex align-items-center">
                                <input 
                                    type="checkbox" 
                                    class="form-check-input me-2" 
                                    id="togglePart_${part.machine_type_parts_id}" 
                                    checked
                                >
                                <h5 class="card-title mb-0">${part.machine_type_parts_name}</h5>
                            </div>
                            <div class="card-body part-details">
                                <p class="card-text">${part.machine_type_parts_description}</p>
                                <div class="mb-3">
                                    <label class="form-label">Quantity:</label>
                                    <input type="number" name="quantity" class="form-control" value="${part.machine_type_parts_quantity || 1}" min="1">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Maintenance Interval (operating hours):
                                    <span 
                                        class="text-muted" 
                                        data-bs-toggle="tooltip" 
                                        data-bs-placement="right" 
                                        title="How many hours before the part needs to be maintained/cleaned?">
                                        <i class="bi bi-question-circle"></i>
                                    </span>
                                    </label>
                                    <input type="number" name="maintenanceInterval" class="form-control" value="${part.machine_type_parts_maintenance_interval || 100}" min="24">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Replacement Lifespan (operating hours):
                                    <span 
                                        class="text-muted" 
                                        data-bs-toggle="tooltip" 
                                        data-bs-placement="right" 
                                        title="How many hours before the part needs to be replaced?">
                                        <i class="bi bi-question-circle"></i>
                                    </span>
                                    </label>
                                    <input type="number" name="replacementLifespan" class="form-control" value="${part.machine_type_parts_replacement_lifespan || 1000}" min="24">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Criticality Level:</label>
                                    <select class="form-select">
                                        <option value="Low" ${part.machine_type_parts_criticality_level === 'Low' ? 'selected' : ''}>Low</option>
                                        <option value="Medium" ${part.machine_type_parts_criticality_level === 'Medium' ? 'selected' : ''}>Medium</option>
                                        <option value="High" ${part.machine_type_parts_criticality_level === 'High' ? 'selected' : ''}>High</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Maintenance Instructions:</label>
                                    <textarea class="form-control">${part.machine_type_parts_instructions || 'No specified instructions'}</textarea>
                                </div>
                            </div>
                        `;
    
                        partsList.appendChild(card);
                        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
                        tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    
                        // Add event listener to handle toggling of part details
                        const toggleCheckbox = card.querySelector('.form-check-input');
                        const partDetails = card.querySelector('.part-details');
                        toggleCheckbox.addEventListener('change', () => {
                            partDetails.style.display = toggleCheckbox.checked ? 'block' : 'none';
                        });
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching machine parts:', error);
            });
        document.getElementById('nextStepButton2').disabled = false;
        document.getElementById('addPartButton').classList.remove('d-none');
    }               

    document.getElementById('template').addEventListener('change', fetchMachineParts);
    
    document.getElementById('addPartButton').addEventListener('click', () => {
        // Show the form for adding a new part
        document.getElementById('addPartForm').classList.remove('d-none');
    });
    
    document.getElementById('cancelPartButton').addEventListener('click', () => {
        // Hide the form and clear inputs
        document.getElementById('addPartForm').classList.add('d-none');
        clearNewPartForm();
    });
    
    function validateNewPartForm() {
        let isValid = true; // Assume valid until a validation fails
    
        // Get input fields
        const nameField = document.getElementById('newPartName');
        const descriptionField = document.getElementById('newPartDescription');
        const quantityField = document.getElementById('newPartQuantity');
        const maintenanceIntervalField = document.getElementById('newPartMaintenanceInterval');
        const replacementLifespanField = document.getElementById('newPartReplacementLifespan');
        const criticalityLevelField = document.getElementById('newPartCriticalityLevel');
        const instructionsField = document.getElementById('newPartInstructions');
    
        // Validate fields and apply 'is-invalid' class if needed
        if (!nameField.value.trim()) {
            nameField.classList.add('is-invalid');
            isValid = false;
        } else {
            nameField.classList.remove('is-invalid');
        }
    
        if (!descriptionField.value.trim()) {
            descriptionField.classList.add('is-invalid');
            isValid = false;
        } else {
            descriptionField.classList.remove('is-invalid');
        }
    
        if (!quantityField.value || quantityField.value < 1) {
            quantityField.classList.add('is-invalid');
            isValid = false;
        } else {
            quantityField.classList.remove('is-invalid');
        }
    
        if (!maintenanceIntervalField.value || maintenanceIntervalField.value < 24) {
            maintenanceIntervalField.classList.add('is-invalid');
            isValid = false;
        } else {
            maintenanceIntervalField.classList.remove('is-invalid');
        }
    
        if (!replacementLifespanField.value || replacementLifespanField.value < 24) {
            replacementLifespanField.classList.add('is-invalid');
            isValid = false;
        } else {
            replacementLifespanField.classList.remove('is-invalid');
        }
    
        if (!criticalityLevelField.value.trim()) {
            criticalityLevelField.classList.add('is-invalid');
            isValid = false;
        } else {
            criticalityLevelField.classList.remove('is-invalid');
        }
    
        if (!instructionsField.value.trim()) {
            instructionsField.classList.add('is-invalid');
            isValid = false;
        } else {
            instructionsField.classList.remove('is-invalid');
        }
    
        return isValid; // Return overall validity
    }

    document.getElementById('savePartButton').addEventListener('click', () => {

        if (validateNewPartForm()) {
        // Proceed to save the part
        console.log('Form is valid. Proceeding to save the new part.');
        } else {
            console.log('Form is invalid. Please correct the highlighted fields.');
            return;
        }

        // Get input fields
        const nameField = document.getElementById('newPartName');
        const descriptionField = document.getElementById('newPartDescription');
        const quantityField = document.getElementById('newPartQuantity');
        const maintenanceIntervalField = document.getElementById('newPartMaintenanceInterval');
        const replacementLifespanField = document.getElementById('newPartReplacementLifespan');
        const criticalityLevelField = document.getElementById('newPartCriticalityLevel');
        const instructionsField = document.getElementById('newPartInstructions');

        const name = nameField.value.trim();
        const description = descriptionField.value.trim();
        const quantity = quantityField.value;
        const maintenanceInterval = maintenanceIntervalField.value;
        const replacementLifespan = replacementLifespanField.value;
        const criticalityLevel = criticalityLevelField.value;
        const instructions = instructionsField.value.trim();
        
        // Create a new card for the part
        const card = document.createElement('div');
        card.classList.add('card', 'mb-3', 'shadow-sm');
    
        card.innerHTML = `
            <div class="card-header d-flex align-items-center">
                <input 
                    type="checkbox" 
                    class="form-check-input me-2" 
                    checked
                >
                <h5 class="card-title mb-0">${name}</h5>
            </div>
            <div class="card-body part-details">
                <p class="card-text">${description}</p>
                <div class="mb-3">
                    <label class="form-label">Quantity:</label>
                    <input type="number" name="quantity" class="form-control" value="${quantity}" min="1">
                </div>
                <div class="mb-3">
                    <label class="form-label">Maintenance Interval (operating hours):
                    <span 
                        class="text-muted" 
                        data-bs-toggle="tooltip" 
                        data-bs-placement="right" 
                        title="How many hours before the part needs to be maintained/cleaned?">
                        <i class="bi bi-question-circle"></i>
                    </span>
                    </label>
                    <input type="number" name="maintenanceInterval" class="form-control" value="${maintenanceInterval}" min="24">
                </div>
                <div class="mb-3">
                    <label class="form-label">Replacement Lifespan (operating hours):
                    <span 
                        class="text-muted" 
                        data-bs-toggle="tooltip" 
                        data-bs-placement="right" 
                        title="How many hours before the part needs to be replaced?">
                        <i class="bi bi-question-circle"></i>
                    </span>
                    </label>
                    <input type="number" name="replacementLifespan" class="form-control" value="${replacementLifespan}" min="24">
                </div>
                <div class="mb-3">
                    <label class="form-label">Criticality Level:</label>
                    <select class="form-select">
                        <option value="Low" ${criticalityLevel === 'Low' ? 'selected' : ''}>Low</option>
                        <option value="Medium" ${criticalityLevel === 'Medium' ? 'selected' : ''}>Medium</option>
                        <option value="High" ${criticalityLevel === 'High' ? 'selected' : ''}>High</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="form-label">Maintenance Instructions:</label>
                    <textarea class="form-control">${instructions}</textarea>
                </div>
            </div>
        `;
    
        // Add the new card to the parts list
        document.getElementById('machinePartsList').appendChild(card);

        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

        // Add functionality to the checkbox
        const toggleCheckbox = card.querySelector('.form-check-input');
        const partDetails = card.querySelector('.part-details');
        toggleCheckbox.addEventListener('change', () => {
            partDetails.style.display = toggleCheckbox.checked ? 'block' : 'none';
        });

        // Hide the form and clear inputs
        document.getElementById('addPartForm').classList.add('d-none');
        clearNewPartForm();
    });
    
    // Utility function to clear the form inputs
    function clearNewPartForm() {
        document.getElementById('newPartName').value = '';
        document.getElementById('newPartDescription').value = '';
        document.getElementById('newPartQuantity').value = '1';
        document.getElementById('newPartMaintenanceInterval').value = '100';
        document.getElementById('newPartReplacementLifespan').value = '1000';
        document.getElementById('newPartCriticalityLevel').value = 'Low';
        document.getElementById('newPartInstructions').value = '';
    }

    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    // Toggle Warranty Details Section
    function toggleWarrantyDetails() {
        const warrantyDetails = document.getElementById('warrantyDetails');
        const warrantyToggle = document.getElementById('warrantyToggle');
        warrantyDetails.style.display = warrantyToggle.checked ? 'block' : 'none';
    }

    // Handle Covered Parts Toggle
    function togglePartWarranty(checkbox) {
        const partCovered = checkbox.checked;
        if (partCovered) {
            console.log("This part is covered under warranty.");
            // Link part to warranty record in the system (implement backend logic)
        } else {
            console.log("This part is not covered under warranty.");
            // Handle exclusion logic
        }
    }

    const warrantySelect = document.getElementById('warrantyToggle');
    warrantySelect.addEventListener('change', toggleWarrantyDetails);
});