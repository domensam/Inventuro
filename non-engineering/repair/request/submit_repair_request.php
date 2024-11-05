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
            // Start transaction
            $conn->beginTransaction();

            // Insert into repair_request
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

            // Execute the repair_request insertion
            if ($stmt->execute()) {
                // Get the last inserted repair_request_id
                $repair_request_id = $conn->lastInsertId();

                // Insert into repair using the repair_request_id
                $stmtRepair = $conn->prepare("
                    INSERT INTO repair (repair_request_id, machine_id)
                    VALUES (:repair_request_id, :machine_id)
                ");
                $stmtRepair->bindParam(':repair_request_id', $repair_request_id, PDO::PARAM_INT);
                $stmtRepair->bindParam(':machine_id', $machine_id, PDO::PARAM_INT);

                // Execute the repair insertion
                if ($stmtRepair->execute()) {
                    // Commit transaction
                    $conn->commit();
                    echo json_encode(['success' => true, 'message' => 'Repair request and repair details submitted successfully.']);
                } else {
                    // Roll back if the repair insertion fails
                    $conn->rollBack();
                    echo json_encode(['success' => false, 'message' => 'Failed to insert repair details.']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'Failed to insert repair request.']);
            }

        } catch (Exception $e) {
            // Roll back the transaction on error
            $conn->rollBack();
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