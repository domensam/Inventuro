<?php
session_start();

// Ensure the user is logged in and is non-engineering
if (isset($_SESSION['user_id']) && isset($_SESSION['employee_id']) && $_SESSION['user_type'] === "non-engineering") {

    // Include the database connection
    include '../../../connect.php';

    // Check if all required POST data is set
    if (isset($_POST['machine_id'], $_POST['urgency'], $_POST['details'], $_POST['requested_by'])) {
        $machine_id = $_POST['machine_id'];
        $urgency = $_POST['urgency'];
        $details = $_POST['details'];
        $requested_by = $_POST['requested_by'];
        $status = 'Not Started'; // Default status for new requests

        try {
            // Prepare SQL statement for inserting the repair request
            $stmt = $conn->prepare("
                INSERT INTO repair_request (machine_id, date_requested, status, requested_by, urgency, details)
                VALUES (:machine_id, NOW(), :status, :requested_by, :urgency, :details)
            ");

            // Bind parameters
            $stmt->bindParam(':machine_id', $machine_id, PDO::PARAM_INT);
            $stmt->bindParam(':status', $status, PDO::PARAM_STR);
            $stmt->bindParam(':requested_by', $requested_by, PDO::PARAM_STR);
            $stmt->bindParam(':urgency', $urgency, PDO::PARAM_STR);
            $stmt->bindParam(':details', $details, PDO::PARAM_STR);

            // Execute the query and check for success
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Repair request submitted successfully.']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to insert data into the database.']);
            }

        } catch (Exception $e) {
            // Handle any errors and send an error response
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
        }

    } else {
        // Send an error response if required data is missing
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required form data.']);
    }

} else {
    // If the user is not logged in or does not have the proper permissions
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Unauthorized access.']);
}
?>