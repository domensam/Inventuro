<?php
session_start();
if (isset($_SESSION['user_id']) && isset($_SESSION['employee_id']) && $_SESSION['user_type'] === "non-engineering") {

// Include the database connection file
include '../../connect.php';

// SQL query to get the most recent BLOB from the image column
$stmt = $conn->prepare("
    SELECT *
    FROM users 
    JOIN employee
    ON users.employee_id = employee.employee_id
    WHERE users.user_id = ?
    LIMIT 1
");

$stmt->execute([$_SESSION['user_id']]);

// Fetch the result
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// Check if a result was found and store the image data
if ($user) {
    $profileImage = $user['image'];

    // Detect MIME type of the image
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->buffer($profileImage);

    // Convert BLOB to base64
    $base64Image = base64_encode($profileImage);

    $first_name = $user['first_name'];
    $last_name = $user['last_name'];
    $employee_id = $user['employee_id'];
    $department = $user['department'];
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link href="https://cdn.lineicons.com/4.0/lineicons.css" rel="stylesheet" />
    <link href="https://cdn.datatables.net/1.11.5/css/jquery.dataTables.min.css" rel="stylesheet">
    <link href="https://cdn.datatables.net/buttons/2.2.2/css/buttons.dataTables.min.css" rel="stylesheet">
    <link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">

    <link rel="stylesheet" href="style.css">
    <title>Repair Request</title>
</head>
<body>
    <div class="wrapper">
        <aside id="sidebar" class="expand">
            <div class="d-flex">
                <button class="toggle-btn" type="button">
                    <i class="bi bi-box-seam-fill"></i>
                </button>
                <div class="sidebar-logo">
                    <a href="../index.php">Inventuro</a>
                </div>
            </div>
            <ul class="sidebar-nav">
                <li class="sidebar-item">
                    <a href="../index.php" class="sidebar-link">
                    <i class="bi bi-house-door"></i>
                        <span>Home</span>
                    </a>
                </li>
                <li class="sidebar-item">
                    <a href="../repair/request/index.php" class="sidebar-link">
                        <i class="bi bi-tools"></i>
                        <span>Repair</span>
                    </a>
                </li>
                <li class="sidebar-item">
                    <a href="index.php" class="sidebar-link">
                    <i class="bi bi-person"></i>
                        <span>Profile</span>
                    </a>
                </li>
            </ul>
            <div class="sidebar-footer">
                <a href="../../logout.php" class="sidebar-link">
                    <i class="lni lni-exit"></i>
                    <span>Logout</span>
                </a>
            </div>
        </aside>
        <div class="main">
            <nav class="navbar navbar-expand-lg navbar-custom px-4">
                <div class="d-flex flex-grow-1 align-items-center p-2">
                    <form class="d-flex flex-grow-1" role="search">
                    <input id="search-bar" class="form-control me-2" type="search" placeholder="Search..." aria-label="Search" style="width: 600px; height: 30px; font-size: 16px;">
                    <button type="button" class="icon-btn" title="Search">
                        <i class="bi bi-search"></i>
                    </button>
                    </form>
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <button class="icon-btn" title="Notifications">
                                <i class="bi bi-bell"></i>
                            </button>
                        </li>
                        <li class="nav-item mx-3">
                            <button class="icon-btn" title="Settings">
                                <i class="bi bi-gear"></i>
                            </button>
                        </li>
                        <button class="icon-btn" title="Profile" style="border: none; background: none; padding: 0;">
                            <?php if (isset($base64Image)): ?>
                                <img src="data:<?=$mimeType?>;base64,<?=$base64Image?>"
                                    alt="Profile Picture" 
                                    class="profile-icon" style="height: 1.7rem; width: 1.7rem">
                            <?php else: ?>
                                <img src="../../images/person-circle.png"
                                    alt="Profile Picture" 
                                    class="profile-icon">
                            <?php endif; ?>
                        </button>
                    </ul>
                </div>
            </nav>
            <div class="second-nav">
                <div class="container p-2">
                    <div class="box left-box">
                        <img src="../../images/ksk-logo.png" alt="KSK Logo" style="max-width: 100%; height: auto;">
                    </div>
                    <div class="box right-box">
                        <div class="row">
                            <div class="col-8">
                                <h1 class="name-display">Hello, <?=$first_name?> <?=$last_name?></h1>
                                <h5>KSK Food Products</h5>
                            </div>
                            <div class="col-4">
                                <p><strong>Employee ID:</strong> <span id="employee-id-text"><?= $employee_id ?></span></p>
                                <p><strong>Department: </strong><?=$department?></p>
                            </div>
                        </div>
                        
                    </div>
                </div>
                <div id="main-content-links">
                    <a id="request-link" class="link-hover-effect text-primary" href="index.php">Request</a>
                    <a id="history-link" class="link-hover-effect text-primary" href="#">History</a>
                </div>
            </div>
            <div id="main-content">
                <!-- Repair Request Section -->
                <div id="request-content" class="content-section active p-5">
                    <h1><strong>Request for Machine Repair</strong></h1>
                    <p>Please fill out the form below to request for any machine repair in your department.</p>
                    <div class="container mt-4 p-4 border rounded bg-light">
                        <form id="repairRequestForm" class="w-100" method="POST">
                            <div class="row">
                                <!-- Left Side Top Section -->
                                <div class="col-md-8">
                                    <!-- Department (Disabled) -->
                                    <div class="mb-3">
                                        <label for="department" class="form-label">Department</label>
                                        <input type="text" class="form-control" id="department" name="department" value="<?=$department?>" disabled>
                                    </div>

                                    <!-- Machine Dropdown -->
                                    <div class="mb-3">
                                        <label for="machine" class="form-label text-danger">Machine*</label>
                                        <select class="form-select" id="machine" name="machine" required>
                                        </select>
                                    </div>

                                    <!-- Urgency Dropdown -->
                                    <div class="mb-3">
                                        <label for="urgency" class="form-label text-danger">Urgency*</label>
                                        <select class="form-select" id="urgency" name="urgency" required>
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </div>

                                <!-- Right Side Top Section -->
                                <div class="col-md-4">
                                    <!-- Current Timestamp -->
                                    <div class="mb-3">
                                        <label for="timestamp" class="form-label">Current Timestamp</label>
                                        <input type="text" class="form-control" id="timestamp" name="remarks" value="<?= date('Y-m-d H:i:s'); ?>" disabled>
                                    </div>
                                </div>
                            </div>

                            <!-- Center Bottom Section -->
                            <div class="row">
                                <div class="col-12">
                                    <!-- Remarks Text Area -->
                                    <div class="mb-3">
                                        <label for="remarks" class="form-label text-danger">Problem Description*</label>
                                        <textarea class="form-control" id="remarks" rows="4" placeholder="Describe the problem to be fixed."></textarea>
                                    </div>

                                    <!-- Submit Button -->
                                    <div class="text-center">
                                        <button type="submit" class="btn btn-primary">Submit</button>
                                    </div>
                                </div>
                            </div>
                        </form>

                    </div>
                </div>
                <!-- Repair Request History Section -->
                <div id="history-content" class="content-section">
                    <div class="p-5 pb-0">
                        <h1><strong>History of Your Repair Request</strong></h1>
                        <p>Click on a repair request to view details</p>
                    </div>
                    <!-- Table -->
                    <table id="historyTable" class="table table-striped table-hover w-100">
                        <thead>
                            <tr>
                                <th class="text-center" style="width: 5%;"><input type="checkbox" id="selectAll"></th>
                                <th class="text-start" style="padding-left: 13px;">Date</th>
                                <th class="text-start" style="padding-left: 13px;">Repair Request No.</th>
                                <th class="text-start" style="padding-left: 13px;">Status</th>
                                <th class="text-start" style="padding-left: 13px;">Urgency</th>
                            </tr>
                        </thead>
                        <tbody>
                        <?php
                            try {
                                $requested_by = $_SESSION['employee_id'];

                                $sql = "SELECT * FROM repair_request 
                                    LEFT JOIN repair ON repair_request.repair_request_id = repair.repair_request_id
                                    LEFT JOIN employee ON repair.handled_by = employee.employee_id
                                    LEFT JOIN machine ON repair_request.machine_id = machine.machine_id
                                    WHERE repair_request.requested_by = ?
                                    ORDER BY repair_request.date_requested ASC";

                                // Prepare the statement
                                $stmt = $conn->prepare($sql);

                                // Bind the parameter
                                $stmt->bindParam(1, $requested_by, PDO::PARAM_STR);

                                // Execute the query
                                $stmt->execute();
                                
                                // Fetch data and display
                                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                                    $imageData = isset($row['image']) && !empty($row['image'])
                                        ? "data:" . (new finfo(FILEINFO_MIME_TYPE))->buffer($row['image']) . ";base64," . base64_encode($row['image'])
                                        : "../../../images/gallery.png";

                                // Determine status color class
                                $statusClass = '';
                                $statusText = htmlspecialchars($row['status']);
                                switch ($row['status']) {
                                    case 'Not Started':
                                        $statusClass = 'bg-light text-secondary'; // Gray
                                        break;
                                    case 'Started':
                                        $statusClass = 'bg-warning text-dark'; // Yellow
                                        break;
                                    case 'Done':
                                        $statusClass = 'bg-success text-white'; // Green
                                        break;
                                }

                                // Determine urgency text color class
                                $urgencyClass = '';
                                $urgencyText = htmlspecialchars($row['urgency']);
                                switch ($row['urgency']) {
                                    case 'Low':
                                        $urgencyClass = 'text-success'; // Green
                                        break;
                                    case 'Medium':
                                        $urgencyClass = 'text-warning'; // Yellow
                                        break;
                                    case 'High':
                                        $urgencyClass = 'text-danger'; // Red
                                        break;
                                }
                                    // Construct the table row
                                    echo "<tr
                                        data-date-requested='" . htmlspecialchars(date("d M Y g:i A", strtotime($row['date_requested']))) . "'
                                        data-repair-request-id='" . htmlspecialchars($row['repair_request_id']) . "'
                                        data-machine-name='" . htmlspecialchars($row['machine_name']) . "'
                                        data-status ='" . htmlspecialchars($row['status']) . "'
                                        data-urgency='" . htmlspecialchars($row['urgency']) . "'
                                        data-department='" . htmlspecialchars($department) . "'
                                        data-requested-by='" . htmlspecialchars($first_name . " " . $last_name . " (" . $employee_id . ")") . "'
                                        data-handled-by='" . (
                                            !empty($row['first_name']) && !empty($row['last_name']) 
                                                ? htmlspecialchars($row['first_name'] . ' ' . $row['last_name'])
                                                : 'Not assigned yet'
                                            ) . "'
                                        data-details ='" . htmlspecialchars($row['details']) . "'
                                        data-image='" . htmlspecialchars($imageData) . "'>
                                        <td class='text-center align-middle'><input type='checkbox' class='row-checkbox'></td>
                                        <td class='text-start align-middle'>" . htmlspecialchars(date("d M Y g:i A", strtotime($row['date_requested']))) . "</td>
                                        <td class='text-start align-middle'>" . htmlspecialchars($row['repair_request_id']) . "</td>
                                        <td class='text-start align-middle'>
                                            <span class='badge $statusClass p-2 rounded fs-6'>$statusText</span>
                                        </td>
                                        <td class='text-start align-middle $urgencyClass'>$urgencyText</td>
                                    </tr>";
                                }
                            } catch (PDOException $e) {
                                echo "<tr><td colspan='5'>Error fetching data: " . htmlspecialchars($e->getMessage()) . "</td></tr>";
                            }
                        ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-ENjdO4Dr2bkBIFxQpeoTz1HIcje39Wm4jDKdf19U8gI4ddQ3GYNS7NTKfAdVQSZe"
        crossorigin="anonymous"></script>
    <!-- Include jQuery and DataTables JS -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.datatables.net/1.11.5/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.2.2/js/dataTables.buttons.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.2.2/js/buttons.html5.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.2.2/js/buttons.print.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/pdfmake.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.53/vfs_fonts.js"></script>

    <script src="script.js"></script>
</body>
</html>
<?php
} else {
    header(header: "Location: ../../login.php");}
?>