<?php
// Enable error reporting for debugging (only use in development)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set timezone
date_default_timezone_set('Asia/Manila');

// Include your database connection file
include_once '../../../connect.php';

// Ensure the database connection is initialized
if (!$conn) {
    http_response_code(500);
    echo json_encode(['message' => 'Database connection failed.']);
    exit();
}

// Set content type to application/json
header('Content-Type: application/json');

// Check if the request is a GET request and that the department parameter is provided
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['department'])) {
    $department = $_GET['department'];

    try {
        // Set MySQL timezone (optional)
        $stmt = $conn->prepare("SET time_zone = '+08:00'");
        $stmt->execute();

        // Fetch machines associated with the given department
        $stmt = $conn->prepare('
            SELECT machine.machine_id, machine_name, machine_serial_number
            FROM machine
            JOIN department
            ON machine.machine_department_id = department.department_id
            WHERE department.department_name = :department
            ORDER BY machine_name ASC
        ');
        $stmt->bindParam(':department', $department, PDO::PARAM_STR);
        $stmt->execute();
        
        // Fetch all machines in the specified department
        $machines = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Return machines in JSON format
        http_response_code(200);
        echo json_encode($machines ?: []); // Always return an array
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['message' => 'Error retrieving data: ' . $e->getMessage()]);
    }
} else {
    // If not a GET request or missing department parameter
    http_response_code(400);
    echo json_encode(['message' => 'Bad request. Department parameter is required.']);
}
?>