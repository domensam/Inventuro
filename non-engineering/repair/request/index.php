<?php
session_start();
if (isset($_SESSION['user_id']) && isset($_SESSION['employee_id']) && $_SESSION['user_type'] === "non-engineering") {

// Include the database connection file
include '../../../connect.php';

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
    <link rel="stylesheet" href="style.css">
    <title>Home</title>
</head>
<body>
    <div class="wrapper">
        <aside id="sidebar" class="expand">
            <div class="d-flex">
                <button class="toggle-btn" type="button">
                    <i class="bi bi-box-seam-fill"></i>
                </button>
                <div class="sidebar-logo">
                    <a href="index.php">Inventuro</a>
                </div>
            </div>
            <ul class="sidebar-nav">
                <li class="sidebar-item">
                    <a href="../../index.php" class="sidebar-link">
                    <i class="bi bi-house-door"></i>
                        <span>Home</span>
                    </a>
                </li>
                <li class="sidebar-item">
                    <a href="index.php" class="sidebar-link collapsed has-dropdown" data-bs-toggle="collapse"
                        data-bs-target="#requests" aria-expanded="false" aria-controls="requests">
                        <i class="bi bi-tools"></i>
                        <span>Repair</span>
                    </a>
                    <ul id="requests" class="sidebar-dropdown list-unstyled collapse" data-bs-parent="#sidebar">
                        <li class="sidebar-item">
                            <a href="index.php" class="sidebar-link">Request</a>
                        </li>
                        <li class="sidebar-item">
                            <a href="../history/index.php" class="sidebar-link">History</a>
                        </li>
                    </ul>
                </li>
                <li class="sidebar-item">
                    <a href="people/index.php" class="sidebar-link">
                    <i class="bi bi-person"></i>
                        <span>Profile</span>
                    </a>
                </li>
            </ul>
            <div class="sidebar-footer">
                <a href="../logout.php" class="sidebar-link">
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
                                <img src="../../../images/person-circle.png"
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
                        <img src="../../../images/ksk-logo.png" alt="KSK Logo" style="max-width: 100%; height: auto;">
                    </div>
                    <div class="box right-box">
                        <div class="row">
                            <div class="col-9">
                                <h1 class="name-display">Hello, <?=$first_name?> <?=$last_name?></h1>
                                <h5>KSK Food Products</h5>
                            </div>
                            <div class="col-3">
                                <p><strong>Employee ID: </strong><?=$employee_id?></p>
                                <p><strong>Department: </strong><?=$department?></p>
                            </div>
                        </div>
                        
                    </div>
                </div>
                <div id="main-content-links">
                    <a id="request-link" class="link-hover-effect text-primary" href="index.php">Request</a>
                    <a id="history-link" class="link-hover-effect text-primary" href="../history/index.php">History</a>
                </div>
            </div>
            <div id="main-content" class="p-5">
                <!-- Repair Request Section -->
                <div id="request-content" class="content-section active">
                    <h1><strong>Request for Machine Repair</strong></h1>
                    <p>Please fill out the form below to request for any machine repair in your department.</p>
                    <div class="container mt-4 p-4 border rounded bg-light">
                        <form class="w-100">
                            <div class="row">
                                <!-- Left Side Top Section -->
                                <div class="col-md-8">
                                    <!-- Department (Disabled) -->
                                    <div class="mb-3">
                                        <label for="department" class="form-label">Department</label>
                                        <input type="text" class="form-control" id="department" value="<?=$department?>" disabled>
                                    </div>

                                    <!-- Machine Dropdown -->
                                    <div class="mb-3">
                                        <label for="machine" class="form-label">Machine</label>
                                        <select class="form-select" id="machine" required>
                                            <option value="" selected disabled>Select a machine</option>
                                            <option value="1">Machine 1 - ID: 001 - Description: Cutter</option>
                                            <option value="2">Machine 2 - ID: 002 - Description: Press</option>
                                            <option value="3">Machine 3 - ID: 003</option>
                                            <!-- Additional machine options can be added here -->
                                        </select>
                                    </div>

                                    <!-- Urgency Dropdown -->
                                    <div class="mb-3">
                                        <label for="urgency" class="form-label">Urgency</label>
                                        <select class="form-select" id="urgency" required>
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
                                        <input type="text" class="form-control" id="timestamp" value="<?= date('Y-m-d H:i:s'); ?>" disabled>
                                    </div>
                                </div>
                            </div>

                            <!-- Center Bottom Section -->
                            <div class="row">
                                <div class="col-12">
                                    <!-- Remarks Text Area -->
                                    <div class="mb-3">
                                        <label for="remarks" class="form-label">Remarks</label>
                                        <textarea class="form-control" id="remarks" rows="4" placeholder="Enter any additional remarks here..."></textarea>
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
                    <!-- Timeline Container for dynamically loaded announcements -->
                    <div class="timeline"></div>
                </div>
            </div>
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-ENjdO4Dr2bkBIFxQpeoTz1HIcje39Wm4jDKdf19U8gI4ddQ3GYNS7NTKfAdVQSZe"
        crossorigin="anonymous"></script>
    <script src="script.js"></script>
</body>
</html>
<?php
} else {
    header(header: "Location: ../login.php");}
?>