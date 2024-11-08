document.addEventListener('DOMContentLoaded', function () {
    const hamBurger = document.querySelector(".toggle-btn");

    hamBurger.addEventListener("click", function () {
        document.querySelector("#sidebar").classList.toggle("expand");
    });
    
    const mainContentLinks = {
        dashboard: document.getElementById("dashboard-link"),
        announcement: document.getElementById("announcements-link")
    };

    const contentSections = {
        dashboard: document.getElementById("dashboard-content"),
        announcement: document.getElementById("announcement-content")
    };

    function setActiveLink(linkId) {
        Object.values(mainContentLinks).forEach(link => link.classList.remove("active"));
        mainContentLinks[linkId].classList.add("active");
    }

    function showContent(sectionId) {
        Object.values(contentSections).forEach(section => section.classList.remove("active"));
        contentSections[sectionId].classList.add("active");
    }

    mainContentLinks.dashboard.addEventListener("click", function (e) {
        e.preventDefault();
        setActiveLink("dashboard");
        showContent("dashboard");
    });

    mainContentLinks.announcement.addEventListener("click", function (e) {
        e.preventDefault();
        setActiveLink("announcement");
        showContent("announcement");
    });

    function fetchData() {
        fetch('fetch_data.php')
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    console.error(data.message);
                } else {
                    // Populate data from fetch_data.php response
                    document.getElementById('items-on-hand-text').textContent = data.totalQuantity;
                    document.getElementById('this-month-count-text').textContent = data.thisMonthCount;
                    document.getElementById('low-stock-text').textContent = data.lowStockCount;
                    
                    // Calculate and display percentage change
                    const percentageChangeElement = document.getElementById('percentage-change');
                    const percentageChange = data.percentageChange;
                    const hasLastMonthCount = data.hasOwnProperty('lastMonthCount') && data.lastMonthCount > 0;
    
                    // Determine output based on availability of last month's data
                    if (hasLastMonthCount) {
                        // Display percentage change with up/down arrow as before
                        if (percentageChange > 0) {
                            percentageChangeElement.innerHTML = `<span class="up-arrow"> ${percentageChange.toFixed(1)}% this month</span>`;
                        } else if (percentageChange < 0) {
                            percentageChangeElement.innerHTML = `<span class="down-arrow"> ${Math.abs(percentageChange).toFixed(1)}% this month</span>`;
                        } else {
                            percentageChangeElement.textContent = 'No change this month';
                        }
                    } else {
                        // Display "New" if no previous data is available
                        percentageChangeElement.textContent = 'New this month';
                    }
                }
            })
            .catch(error => console.error('Error fetching data:', error));
    }
      
    fetch('fetch_progress_bar.php')
        .then(response => response.json())
        .then(data => {
            if (data.donePercentage !== undefined) {
                const progressCircle = document.querySelector('.radial-progress .progress');
                const progressText = document.querySelector('.radial-progress .progress-text');
                
                // Calculate the stroke-dashoffset based on the percentage
                const radius = 54;
                const circumference = 2 * Math.PI * radius;
                const offset = circumference - (data.donePercentage / 100) * circumference;

                // Set the stroke-dasharray and stroke-dashoffset for animation
                progressCircle.style.strokeDasharray = `${circumference}`;
                progressCircle.style.strokeDashoffset = offset;

                // Update the text inside the circle with the percentage
                progressText.textContent = `${data.donePercentage}%`;
            } else {
                console.error('donePercentage not found in response data.');
            }
        })
        .catch(error => console.error('Error fetching data:', error));

    // Load data on page load
    fetchData();

    // Load dashboard by default
    setActiveLink("dashboard");
    showContent("dashboard");
})