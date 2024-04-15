var teamCount = 0; // Initialize team count
var teamMembers = {}; // Object to store team members count
   
function storePlayerName(teamName) 
{  
    // Check if loggedInUserName is not an empty string
    if (loggedInUserName.trim() !== "") 
    {
        // Send an AJAX request to the server to store the player's name
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/store_player_name", true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.onreadystatechange = function () 
        {
            if (xhr.readyState == XMLHttpRequest.DONE) 
            {
                if (xhr.status == 200) 
                {
                    alert("You have been added to " + teamName);
                    // Enable the Start button after successfully joining a team
                    enableStartButton();
                
                   // Increment team count for each team
                    teamCount++;

                    // Log the team name for each team (optional)
                    switch(teamName) 
                {
                    case 'Team 1':
                    console.log("Team 1")
                    break;
                    case 'Team 2':
                    console.log("Team 2");
                    break;
                    case 'Team 3':
                    console.log("Team 3");
                    break;
                    case 'Team 4':
                    console.log("Team 4");
                    break;
                    case 'Team 5':
                    console.log("Team 5");
                    break;
                    case 'Team 6':
                    console.log("Team 6");
                    break;
                    // Add more cases for additional teams if needed
                    default:
                    // Handle default case if necessary
                    break;
                }

                // Update teamMembers object with team count
                teamMembers[teamName] = teamMembers[teamName] ? teamMembers[teamName] + 1 : 1;
                getTeamCount(teamCount);

                } 
                else 
                {
                    var response = JSON.parse(xhr.responseText);
                    if (response.error.includes("Player already belongs to another team")) 
                    {
                        alert("You are already associated with another team. Cannot join multiple teams.");
                        enableStartButton();
                    } 
                    else 
                    {
                        alert("Team is full. Cannot add more than 10 players to " + teamName);
                    }

                }
            }
        };
        xhr.send(JSON.stringify({ team: teamName, player: loggedInUserName }));
    } 
    else 
    {
        alert("Please log in before selecting a team.");
        // Disable the Start button if the player is not logged in
        disableStartButton();
    }
}





// Function to get team count
function getTeamCount(teamCount) 
{   
    return teamCount;
}

// Function to get team members count
function getTeamMembersCount() 
{
    return teamMembers;
}



//Student Dashboard-----------------------------------------


document.getElementById("backbutton").addEventListener('click', () => 
{
    
    document.querySelector("#back").style.display = "none";
    document.querySelector(".container_2").style.display = "none";
    
    document.querySelector("#dash").style.display = "block";
    document.querySelector(".team-buttons").style.display = "block";
    document.querySelector(".container").style.display = "block";
    document.querySelector(".Selecttheteam").style.display = "block";

    
});

function get_total_points()
 {
     fetch('/get_total_points', 
     {
         method: 'POST', 
         headers: 
         {
             'Content-Type': 'application/json'
         }
     })
     .then(response => response.json())
     .then(data => 
     {
         
         document.querySelector(".container_2").style.display = "block";
         document.querySelector('.container_2').innerHTML = `
             <div class="info-box">
                     <div class="stats">
                         <div class="stat-box-green">
                             <p>Total Score</p>
                         </div>  
                         <span>${data.total_points}</span> 
                     </div>
             </div>
           `; 
     
     })
     .catch(error => {
         console.error('Error fetching team name:', error);
     });
 }
 
document.getElementById("dashboardbutton").addEventListener('click', () => 
{
    document.querySelector("#back").style.display = "block";
    document.querySelector("#dash").style.display = "none";
    document.querySelector(".container").style.display = "none";
    document.querySelector(".Selecttheteam").style.display = "none";
    document.querySelector(".team-buttons").style.display = "none";
    get_total_points();
            
});     


 
 













// Function to check if the player has already joined a team
function checkPlayerTeam() 
{
    // Send an AJAX request to the server to check the player's team
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/check_player_team", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () 
    {
        if (xhr.readyState == XMLHttpRequest.DONE) 
        {
            if (xhr.status == 200) 
            {
                var response = JSON.parse(xhr.responseText);
                if (response.message === "Player has joined a team") 
                {
                    enableStartButton();
                } 
                else
                {   
                    disableStartButton();
                }
            } 
            else 
            {
                // Handle any errors or server response here
                disableStartButton();
            }
        }
    };
    
    xhr.send(JSON.stringify({ player: loggedInUserName }));
}







// Function to disable the Start button
function disableStartButton() 
{
    var startButton = document.querySelector('.start');
    startButton.disabled = true;   
}
function specialdisableStartButton() 
{
    alert("Please Join A Team To Start The Game!")
}  
                



// Function to enable the Start button
function enableStartButton() 
{
    var startButton = document.querySelector('.start');
    startButton.disabled = false;
}





// Initial call to check the player's team status when the page loads
checkPlayerTeam();

