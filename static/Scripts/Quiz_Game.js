document.addEventListener('DOMContentLoaded', function () 
{    
    let timer;
    let timeLeft =60; // Initial time in seconds
    let timeconst = timeLeft;
    let selectedOption = null; 
    let fetchfunctioncount = 0;
    let questionCount = 0; //To keep track of number of questions
    let Previous_total_individual_points=0; //To keep track of previous total individual points
    let bonus=0; //To keep track of bonus points
    let Teamaverage=0; // To keep track of bonus points
    let teamname=null;
    let Playername=null;
    let TotalcorrectAnswerCount = 0; // To keep track of correct answers
    let WrongcorrectAnswerCount=0;  // To keep track of wrong answers
    let container=document.querySelector('#container');
    let container_2=document.querySelector('.container_2')
    let warn = document.getElementById("warn"); 
    let Scoredisplay_1=document.getElementById("Scoredisplay_1");
    let Scoredisplay_2=document.getElementById("Scoredisplay_2");
    let question_object_array=[];// Array for storing question and options as objects in a array.
    
    
    
    // Array containing quiz rules
    let quiz_rules = 
    [
        "You have only 120 seconds to answer all the questions.",
        "Once you select any answer, it can't be changed",
        "You'll get one point each for each correct answer.",
        "Dice will roll only when you click the correct answer.",
        "Dice will rolled only once per question"
    ];

    // Selecting the ordered list element in the HTML
    ol = document.querySelector("ol");

    // Adding each quiz rule as list item to the ordered list
    quiz_rules.forEach(rule => 
    {
        ol.innerHTML += `<li>${rule}</li>`
    });

    // Hiding elements with class "content" and "footer"
    document.querySelector('.content').style.display = "none";
    document.querySelector('.footer').style.display = "none";

    // Moving container to the left to hide it
    document.getElementById("container").style.marginLeft = "-700px";

    // Adding HTML content to container_3 element
    document.getElementById("container_3").innerHTML = 
    `
        <div class="Sign-Header">Sign Board</div>
        <div class="Sign-Content">
            <div class="ul1">
                <h4>Sign Cue</h4>
                <ul class="content-list">
                    <li id="sign1"><img class="signimage" src="static/images/snake.png"><span>Snake</span></li>
                    <li id="sign2"><img class="signimage" src="static/images/ladder.png"><span>Ladder</span></li>
                    <li id="sign3"><img class="signimage" src="static/images/timerplus.png"><span>Timer</span></li>
                    <li id="sign4"><img class="signimage" src="static/images/dicerolling.png"><span>Dice Rolling</span></li>
                    <li id="sign5"><img class="signimage" src="static/images/bonus.png"><span>Bonus</span></li>
                </ul>
            </div>
            <div class="ul2" style="display: none;">
                <h4>Warning</h4>
                <ul class="content-list">
                    <li id="sign1"><img class="signimage" src="static/images/snake.png"><span>Encountered a Snake!</span></li>
                    <li id="sign2"><img class="signimage" src="static/images/ladder.png"><span>Encountered a Ladder!</span></li>
                    <li id="sign3"><img class="signimage" src="static/images/timerplus.png"><span>Caught in a time crunch! Time extended by 10 seconds</span></li>
                    <li id="sign4"><img class="signimage" src="static/images/dicerolling.png"><span>Wow, you got a chance to roll the dice!</span></li>
                    <li id="sign5"><img class="signimage" src="static/images/bonus.png"><span>Great job! You've earned a bonus-10 extra points!</span></li>
                </ul>
            </div> 
            <input type="radio" id="button1" name="toggle" checked>
            <label for="button1"></label>
            <input type="radio" id="button2" name="toggle">
            <label for="button2"></label>
        </div>
    `;

    // Event listener for button1
    const button1 = document.getElementById("button1");
    const button2 = document.getElementById("button2");
    const ul1 = document.querySelector(".ul1");
    const ul2 = document.querySelector(".ul2");

    // Toggling display of ul1 and ul2 based on button click
    button1.addEventListener("click", ()=> 
    {
        ul1.style.display = "block";
        ul2.style.display = "none";
    });

    button2.addEventListener("click", ()=> 
    {
        ul1.style.display = "none";
        ul2.style.display = "block";
    });

    




    // Quiz_Game_App Section-------------------------------
     
    // To fetch the question count from Flask
    fetch('/get_question_count') // Endpoint to retrieve question count
    .then(response => response.json()) // Parse response as JSON
    .then(data => 
    {
        // Access the question count from the response
        questionCount = data.question_count;
    })
    .catch(error => 
    {
        console.error('Error fetching question count:', error);
    });


    // Function to fetch questions from the server
    function fetchQuestions() 
    {
    fetch('/StudentInterface') // Endpoint to fetch questions (update as per server setup)
        .then(response => response.json()) // Parse response as JSON
        .then(data => {
            if (data.message) 
            {
                // Alert if no more questions available
                alert(data.message);
            } 
            else 
            {
                fetchfunctioncount++;
                // Update the UI with the new question and options
                updateUI(data.question, data.options);
            }
        })
        .catch(error => console.error('Error fetching questions:', error));
    }

    // Setting Questions and Options on the Quiz App
    function updateUI(question, options) 
    {   
        
        document.querySelector('.Rules').style.display = "none";
        document.getElementById('start-quiz').style.display = 'None';
        document.querySelector('.content').style.display = "block";
        document.querySelector('.footer').style.display = "flex";

        // Set question text
        document.getElementById('question').textContent = question;

        // Clear previous options and populate with new options
        const optionsList = document.getElementById('options');
        optionsList.innerHTML = '';
        let optionsarray = [];
        options.forEach((option, Index) => 
        {
            // Create list item for each option
            const li = document.createElement('li');
            li.textContent = option;
            optionsarray[Index] = option;
            li.className = 'option';

            // Add click event listener to each option
            li.addEventListener('click', () => handleOptionClick(Index, question, optionsarray));
            optionsList.appendChild(li);
        });

        // Reset selectedOption variable
        selectedOption = null;

        // Check if all questions have been fetched
        if (fetchfunctioncount === questionCount) 
        {
            // Show view result button and hide next button
            document.getElementById('viewresultforfooter').style.display = 'block';
            document.getElementById('nextBtn').style.display = 'none';
        } 
        else 
        {
            // Show next button and hide view result button
            document.getElementById('nextBtn').style.display = 'block';
            document.getElementById('viewresultforfooter').style.display = 'none';
        }
    }



    // Funtion to check whether the option is correct or not
    function handleOptionClick(selectedIndex,question,optionsarray) 
    {   
       
        let question_object_array_flag=0;
        // Get the selected option by its index
        selectedOption = document.querySelectorAll('.option')[selectedIndex];

        // Extract the text content of the selected option
        const selectedAnswer = selectedOption.textContent;
        
        
        // Send the selected answer to the server (Flask)
        fetch('/check_answer', 
        {
                method: 'POST',
                headers: 
                {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    selected_answer: selectedAnswer,
                    question:question
                }),
            })
            .then(response => response.json())
            .then(data => 
                {
                // The server returns a boolean indicating correctness
                const isCorrect = data.isCorrect; 
                // Update UI based on correctness
                if (isCorrect) 
                {
                    // Add the 'correct' class to the selected option
                    selectedOption.classList.add('correct');
                    selectedOption.innerHTML=`<span>Correct</span>`
                    TotalcorrectAnswerCount++; // Increment correct answers count
                    snake_ladder(); //Calling snake and ladder function
                    question_object_array_function(question,optionsarray,selectedIndex,selectedAnswer)
                    question_object_array_flag=1;
                    
                } 
                else 
                {
                    // Add the 'wrong' class to the selected option
                    selectedOption.classList.add('wrong');
                    selectedOption.innerHTML=`<span>Wrong</span>`
                    question_object_array_function(question,optionsarray,selectedIndex)
                    question_object_array_flag=1;
                    WrongcorrectAnswerCount++; // Increment wrong answers count
                    
                }
                if(question_object_array_flag===0)    
                  {
                    question_object_array_function(question,optionsarray,selectedIndex)
                  }
                // Use setTimeout to delay further clicks
                setTimeout(() => 
                {
                    // Disable further clicks on options
                    document.querySelectorAll('.option').forEach(option => {
                        option.style.pointerEvents = 'none';
                    });
                }, 500);
            })
            .catch(error => {
                console.error('Error sending data to server:', error);
            });     
    
    }


     // Function to store the question,option array and Selected index
    function question_object_array_function(question,optionsarray,selectedIndex)
    {    
       
        let questionObject; 
        fetch('/viewresult', 
        {
                method: 'POST',
                headers: 
                {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question:question}),
        })
            .then(response => response.json())
            .then(data => 
            {
                if (data.message) 
                {
                    alert(data.message);
                } 
                else 
                {   

                    for(let i=0;i<optionsarray.length;i++)
                    {   
                        if(optionsarray[i]===data.correctanswer)
                          {  answerindex=i }
                    }

                    for (let i = 0; i < questionCount; i++) 
                    { 
                        questionObject = 
                        {
                         question: question,
                         options:optionsarray,
                         selectedIndex:selectedIndex,
                         correctanswer:answerindex 
                        };    
                    }
                     question_object_array.push(questionObject);
            
                }
            })
            .catch(error => console.error('Error fetching questions:', error));

    } 
 
 
 
 
 
    // To Handle Next button click
    document.getElementById('nextBtn').addEventListener('click', () => 
    {  
        warn.style.display="none"; 
        if (!selectedOption) 
        {
            // Handle the case when no option is clicked
            alert('Please select an option before proceeding to the next question.');
            return;
        }

        // Clear previous question's styles
        document.querySelectorAll('.option').forEach(option => 
        {
            option.classList.remove('correct', 'wrong');
            option.style.pointerEvents = 'auto';
        });

        // Fetch the next question
        fetchQuestions();
    });

   
  

    function viewResult()
    {       
        document.getElementById("container").style.marginLeft="0px"; 
        container_2.style.display="none";
        document.getElementById('leaderboardonviewresult').style.display = 'block';
        document.getElementById('viewresultonleaderboard').style.display = 'none';
            container.innerHTML = `
            <div class="header">Result Details</div>
            <div class="content"></div>
            <div id="result-footer">
                <button id="Quiz_Score">Quiz Score</button>
            </div>
            `;   
        

        //Quiz Score

        document.getElementById("Quiz_Score").addEventListener("click",()=>
        {
            container.innerHTML = `
            <div class="header">Quiz Score</div>
                <div id="trophy">
                    <i class="fa-solid fa-trophy"></i>
                </div>
                <h3 id="score">You Got <b id="color">${TotalcorrectAnswerCount}</b> Out Of <b>${questionCount}</b></h3>
                <div id="result-footer">
                    <button id="detailed-result">Result View</button>
                </div>
        `;
            
        document.querySelector("#detailed-result").addEventListener("click",()=>
        {
         viewResult();
        });
            
        // Change color based on correctAnswersCount
            let colorElement = document.getElementById('color');
            if (TotalcorrectAnswerCount === 0) 
            {
            colorElement.style.color = 'red'; // Change color to red if no correct answers
            } 
            else if (TotalcorrectAnswerCount <= questionCount / 2) 
            {
            colorElement.style.color = 'orange'; // Change color to orange if less than half correct
            } 
            else 
            {
            colorElement.style.color = 'lightgreen'; // Otherwise, keep the color green
            }    
        });


        
        // Result Details
        let quiz_result = document.querySelector(".content");
        quiz_result.innerHTML = ""; // Clear previous content
        question_object_array.forEach((quizobject, index) => 
        {   
            quiz_result.innerHTML += `
            <div class="content-wrapper">
                <h2 class="question">${index + 1}. ${quizobject.question}</h2>
                <div class="option-container${index}"></div>
            </div>
            `;
            option_container = document.querySelector(`.option-container${index}`);
            quizobject.options.forEach((option, optionIndex) => 
            {    
               
                if(quizobject.selectedIndex == quizobject.correctanswer)
                {
                    if(optionIndex == quizobject.correctanswer)
                    {
                        option_container.innerHTML += `<p class="result-option correct">${option}<span class="you-text">You</span></p>`;
                    }
                    else
                    {
                        option_container.innerHTML += `<p class="result-option">${option}</p>`
                    }
                }
                else
                {
                    if(optionIndex == quizobject.correctanswer){
                        option_container.innerHTML += `<p class="result-option correct">${option}<span class="you-text">Correct</span></p>`
                    }else if(optionIndex == quizobject.selectedIndex){
                        option_container.innerHTML += `<p class="result-option wrong">${option}<span class="you-text">Wrong</span></p>`
                    }else{
                        option_container.innerHTML += `<p class="result-option">${option}</p>`
                    }
                }
            });
        });   
    }




    document.querySelector("#viewresultforfooter").addEventListener("click",()=>
    {
     viewResult();
    });
       
    function leaderboardcalculate()
    {   
        // Construct payload object
        var payload = 
        {
            name: Playername,
            team: teamname,
            individual_points: TotalcorrectAnswerCount,
            bonus_points: bonus
        };

        // Send data to the Flask backend using fetch API
        fetch('/store_player_score', 
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
            
        })
        .then(function(response) 
        {
            if (response.ok) 
            {
                return response.json();
            }
            throw new Error('Network response was not ok.');
        })
        .then(function(data) 
        {
            console.log(data.message); // Log success message
        })
        .catch(function(error) 
        {
            console.error('There was a problem with the fetch operation:', error.message); // Log error message
        });
                        
    }        
      
            













    document.getElementById('viewresultonleaderboard').addEventListener('click',()=>
    {
        viewResult();
        
        document.getElementById("container").style.display="block"; 
        document.querySelector(".container_4").style.display="none"; 
        document.querySelector(".container_5").style.display="none"; 
        document.querySelector(".container_6").style.display="none"; 
        document.querySelector(".container_7").style.display="none"; 
        
        document.getElementById('container').style.opacity = '1';

    })


    // JavaScript
    document.getElementById("leaderboardbutton").addEventListener('click', () => 
    {
        alert("Please Wait for 20 seconds for all players to complete the game together")
        // Show countdown alert message
        var secondsLeft = 20; 
        var countdownInterval = setInterval(function() 
        {
        
            secondsLeft--;
            if (secondsLeft === 0) 
            {
                clearInterval(countdownInterval);
                
                leaderboard();
                document.querySelector(".container_4").style.display = "block";
                document.querySelector(".container_5").style.display = "block";
                total_team_points();
                both_teams_total_points();
            }
        }, 1000); // Update every second
    });

                    

    //---------------------Leaderboard Section----------------------------------------------------
    function leaderboard()
    {     
            
            container.style.display="none";
            container_2.style.display="none";
            document.querySelector('.win-lose-overlay ').style.display = 'none';
            document.querySelector('.win-lose-message ').style.display = 'none';
            document.getElementById('viewresultonleaderboard').style.display = 'block';
            document.getElementById('leaderboardonviewresult').style.display = 'none';
            

            // -----------------Score Chart Table Section-------------------------------------
            document.querySelector('.container_4').innerHTML = 
            `                    
            <div id="leaderboard">
                <h2>Score Chart</h2>
                <table id="leaderboard-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Name</th>
                            <th>Team</th>
                            <th>Individual points</th>
                            <th>Bonus Points</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody id="leaderboard-list">
                        <!-- Table rows will be populated dynamically -->
                    </tbody>
                </table>
            </div>
            `;                                
                     
            function createBadgeCell(imageSrc, rank) 
            {
                const badgeCell = document.createElement('td');
                const badgeImage = document.createElement('img');
                badgeImage.src = imageSrc;
                badgeImage.width = 20;
                badgeImage.height = 20;
                badgeImage.style.verticalAlign = 'middle';
                badgeCell.innerHTML += `${rank}`;
                badgeCell.appendChild(badgeImage);
                return badgeCell;
            }        
                    
                    let loadCounter = 0;
                    const maxLoadLimit = 10;
                    function fetchLeaderboardDetails() 
                    {
                        if (loadCounter >= maxLoadLimit) 
                        {
                            return;
                        }
                    
                        fetch('/leaderboard')
                        .then(response => response.json())
                        .then(data => {
                            const leaderboardList = document.getElementById('leaderboard-list');
                            leaderboardList.innerHTML = ''; // Clear existing rows
                    
                            data.player_scores.forEach((player, index) => 
                            {
                                const row = document.createElement('tr');
                    
                                if (index === 0 && player.total_points != 0) {
                                    // Insert gold badge image and rank for the top player
                                    const badgeCell = createBadgeCell('static/images/goldbadge.png', player.rank);
                                    row.appendChild(badgeCell);
                                } else if (index === 1) {
                                    // Insert silver badge image and rank for the second player
                                    const badgeCell = createBadgeCell('static/images/silverbadge.png', player.rank);
                                    row.appendChild(badgeCell);
                                } else if (index === 2) {
                                    // Insert bronze badge image and rank for the third player
                                    const badgeCell = createBadgeCell('static/images/bronzebadge.png', player.rank);
                                    row.appendChild(badgeCell);
                                } else {
                                    // Add rank for players other than the top 3
                                    row.innerHTML += `<td>${player.rank}</td>`;
                                }
                    
                                // Add other player details
                                row.innerHTML += `
                                    <td>${player.name}</td>
                                    <td>${player.team}</td>
                                    <td>${player.individual_points}</td>
                                    <td>${player.bonus_points}</td>
                                    <td>${player.total_points}</td>
                                `;
                                leaderboardList.appendChild(row);
                    
                                // Highlight the first row
                                if (index === 0 && player.total_points != 0) 
                                {
                                    row.classList.add('highlighted');
                                }
                            });
                    
                            // Increment the load counter
                            loadCounter++;
                    
                            // After updating the leaderboard, initiate the next long polling request
                            fetchLeaderboardDetails();
                        })
                        .catch(error => console.error('Error fetching leaderboard data:', error));
                    }
                    
                    
                    // Start the long polling process
                    fetchLeaderboardDetails();
                //-------------------------------------------------------------------    
                
                
                
                //----------------- Individual Score  Card Section-------------------------------------
                    // Function to fetch total points for the current player
                    function getTotalPoints()
                    {     
                            // Update the UI here, inside the fetch's then block
                                document.querySelector(".container_7").style.display = "block";
                                document.querySelector('.container_7').innerHTML = `
                                    <div class="info-box">
                                        <h2>Player Name: <span style="color:whitesmoke";>${Playername}</span></h2>
                                        <div class="Box_1">
                                            <div class="stats">
                                                <div class="stat-box-green">
                                                    <p>Total Correct</p>
                                                    <span>${TotalcorrectAnswerCount}</span>
                                                </div>
                                                <div class="stat-box-red">
                                                    <p>Total Wrong</p>
                                                    <span>${WrongcorrectAnswerCount}</span>
                                                </div>
                                                <div class="stat-box-blue">
                                                    <p>Not Answered</p>
                                                    <span>${questionCount - (TotalcorrectAnswerCount + WrongcorrectAnswerCount)}</span>
                                                </div>   
                                            </div>
                                            <div class="comparison">
                                                <p>Previous Total Points</p>
                                                <span>${Previous_total_individual_points}</span>
                                            </div>
                                            <div class="Teamaverage">
                                                <p>Team Average</p>
                                                <span id="teamavg"></span>
                                            </div>
                                        </div>
                                    </div>
                                `; 
                    }   
                    getTotalPoints();
                                
    }
    
    
    // To Handle View Result Button
    document.getElementById("viewresult").addEventListener('click', () => 
    {   
            document.getElementById("container").style.marginLeft="0px"; 
            document.getElementById('container').style.opacity = '1'; 
            container_2.style.display="none";
            document.querySelector('.win-lose-overlay ').style.display = 'none';
            warn.style.display="none"; 
          
            viewResult();
   
    });


    // To handle leaderboardbutton in view result section
    document.getElementById('leaderboardonviewresult').addEventListener('click',()=>
    {
        leaderboard();   
        total_team_points();
        both_teams_total_points();  
        document.getElementById("container").style.display="none"; 
        document.querySelector(".container_4").style.display="block"; 
        document.querySelector(".container_5").style.display="block"; 
        document.querySelector(".container_6").style.display="block"; 
        document.querySelector(".container_7").style.display="block"; 
    })
    
    
        // Handle Start Quiz button click
    document.getElementById('start-quiz').addEventListener('click', () => 
    {   document.getElementById("container").style.marginLeft="-700px"; 
        document.getElementById("container_3").style.display="none";
        container_2.style.display="block";
        // Fetch the first question
        fetchQuestions();

        // Start a timer
        startTimer();
    });

            





    //teamname
    function fetchteamplayername()
    {    
        
        fetch('/get_team_name', 
        {
            method: 'POST', 
            headers: 
            {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.team_name) 
            {    teamname=data.team_name;
                if(teamname===data.team_name)
                {   
                
                Playername=data.Player_name;
                
                } 
                
            } 
            else 
            {
                // Handle error cases
                console.error('Error:', data.error);
            }
        })
        .catch(error => {
            console.error('Error fetching team name:', error);
        });
        
        
    }

    fetchteamplayername()





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
            
            Previous_total_individual_points=data.total_points;
        
        })
        .catch(error => {
            console.error('Error fetching team name:', error);
        });
    }

    get_total_points();





    function total_team_points()
    {
        fetch('/total_team_points', 
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
        
            Teamaverage = Math.round(data.total_points_in_team / data.num_players_in_team);
            document.getElementById("teamavg").textContent=Teamaverage;
            
        })
        .catch(error => {
            console.error('Error fetching team name:', error);
        });
        
    }







    function both_teams_total_points()
    {
        fetch('/both_teams_total_points', 
        {
            method: 'POST', 
            headers: 
            {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => 
        {   const container5 = document.querySelector('.container_5');
            const container6 = document.querySelector('.container_6');
        
        // Assuming you have already defined and initialized team_1 and team_2
        let team_1 = data.Team_1;
        let team_2 = data.Team_2;

        if(team_1===undefined && team_2===undefined)
        {
            team_1=team_2=0;
        }
        
        // Clear the contents of containers
        container5.innerHTML = '';
        container6.innerHTML = '';
        
        // Display the containers
        container5.style.display = 'block';
        container6.style.display = 'block';
        
        // Determine the winner and display the trophy and winner text accordingly
        if (team_1 > team_2) 
        {
        container5.innerHTML = `<div class="trophy-box">
                                    <h4 class="blink">Winner</h4>
                                    <div class="team-name" style="color: aliceblue;">Team 1</div>
                                    <div class="trophy_1">
                                        <i class="fas fa-trophy" style="color: gold;"></i>
                                        <span id="both_team_total_points">${team_1}</span>
                                    </div>
                                </div>`;
        container6.innerHTML = `<div class="trophy-box">
                                    <h4 class="blink">Runner Up</h4>
                                    <div class="team-name" style="color: aliceblue;">Team 2</div>
                                    <div class="trophy_2">
                                        <i class="fas fa-trophy" style="color: silver;"></i>
                                        <span id="both_team_total_points">${team_2}</span>
                                    </div>
                                </div>`;
        } 
        else if (team_2 > team_1) 
        {
        container5.innerHTML = `<div class="trophy-box">
                                    <h4 class="blink">Runner Up</h4>
                                    <div class="team-name" style="color: aliceblue;">Team 1</div>
                                    <div class="trophy_1">
                                        <i class="fas fa-trophy" style="color: silver;"></i>
                                        <span id="both_team_total_points">${team_1}</span>
                                    </div>
                                </div>`;
        container6.innerHTML = `<div class="trophy-box">
                                    <h4 class="blink">Winner</h4>
                                    <div class="team-name" style="color: aliceblue;">Team 2</div>
                                    <div class="trophy_2">
                                        <i class="fas fa-trophy" style="color: gold;"></i>
                                        <span id="both_team_total_points">${team_2}</span>
                                    </div>
                                </div>`;
        } 
        else 
        {
        // Tie scenario
        container5.innerHTML = `<div class="trophy-box">
                                    <h4 class="blink">Tie</h4>
                                    <div class="team-name" style="color: aliceblue;">Team 1</div>
                                    <div class="trophy_1">
                                        <i class="fas fa-trophy" style="color: gold;"></i>
                                        <span id="both_team_total_points">${team_1}</span>
                                    </div>
                                </div>`;
        container6.innerHTML = `<div class="trophy-box">
                                    <h4 class="blink">Tie</h4>
                                    <div class="team-name" style="color: aliceblue;">Team 2</div>
                                    <div class="trophy_2">
                                        <i class="fas fa-trophy" style="color: gold;"></i>
                                        <span id="both_team_total_points">${team_2}</span>
                                    </div>
                                </div>`;
        }
        
                // Hide the blinking effect
        document.querySelectorAll('.blink').forEach(blinkElement => 
        {
            if (blinkElement.textContent === 'Runner Up') 
            {
            blinkElement.style.color = 'rgba(255, 255, 255, 0)';
            }
            if (blinkElement.textContent === 'Tie') 
            {
            blinkElement.style.color = 'lightblue';
            }
        });
        
            
        })
        .catch(error => {
            console.error('Error fetching team name:', error);
        });
        
    }











// -------------Snake and Ladder board and Dice Section------------------------ 
    let boardCreated = false;
    let team1Position = 0;
    let team2Position = 0;

    function snake_ladder() 
    {   
        const diceElement = document.getElementById('dice');
        diceElement.textContent = '';
        diceElement.classList.remove('animate');
        void diceElement.offsetWidth;
        diceElement.classList.add('animate');
        
        function dicerolling()
        {
            const randomNumber = Math.floor(Math.random() * 6) + 1;
            return randomNumber;
        }


        setTimeout(function () 
        {
            
            const rolledNumber=diceElement.textContent = dicerolling();
            diceElement.classList.remove('animate');

            const teamColor = teamname === 'Team 1' ? 'brown' : 'darkgreen';

            let currentPosition = teamname === 'Team 1' ? team1Position : team2Position;
            
            let newPosition = currentPosition + rolledNumber;
        
            if (newPosition > 50) 
            { 
                newPosition = 50;
            }

            // Define snakes and ladders
            const snakesAndLadders = 
            {   //Snake
                24:17,
                47:35, 
                18:4,   
                32:21, 
                40:26,  
                43:27,  
                //Ladder
                5: 19,  
                9:23,   
                12:22, 
                20:31, 
                37:48, 
                29:34, 
                //Timer
                7:7,
                15:15,
                25:25,
                33:33,
                //Bonus
                28:28,
                45:45,
                // Dice Rolling
                2:2,
                30:30,
                44:44
            };
            let key;
            
            // Check if the newPosition is a snake or ladder
            if (snakesAndLadders[newPosition]) 
            {   
                warn.style.display="block"; 
                key=newPosition;
            // Move player based on snakes and ladders
                newPosition = snakesAndLadders[newPosition]; 
                //Ladder
                if(newPosition===19 || newPosition===23 || newPosition===22 || newPosition===31 || newPosition===48 || newPosition===34)
                {
                warn.innerText = `Encountered a ladder! Moved to square ${newPosition}`;
                }
                //Snake
                else if(newPosition===17 || newPosition===35 || newPosition===4 || newPosition===21 || newPosition===26 || newPosition===27)
                {
                    warn.innerText = `Encountered a snake! Moved to square ${newPosition}`; 
                }
                // Timer
                else if(newPosition===7 || newPosition===15 || newPosition===25 || newPosition===33)
                {
                    warn.innerText = `Caught in a time crunch! Time extended by 10 seconds at square ${newPosition}.`; 
                    increaseTime(10);  
                }
                // Bonus Star
                else if(newPosition===28 || newPosition===45)
                {
                    warn.innerText = `Great job! You've earned a bonus-10 extra points! Now at square ${newPosition}.`;
                    bonus+=10; 
                }
                // Dice 
                else if(newPosition === 2 || newPosition === 30 || newPosition === 44) 
                {

                    warn.innerText = `Wow, you got a chance to roll the dice!`;
                    
                    setTimeout(function() 
                    {
                        diceElement.classList.add('animate');
                        diceElement.textContent = 6;
                    }, 100);
                      
                newPosition+= 6;                  
        
                }
                
            }
            

            const squares = document.querySelectorAll('.square');
        
            squares.forEach(square => 
            {
                const squareNumber = parseInt(square.textContent);

                if (squareNumber === newPosition) 
                {    
                    square.style.backgroundColor = teamColor;
                    square.style.color = 'white'; 
                    if(teamname==='Team 1')
                    {   
                        Scoredisplay_1.textContent=`${teamname} - ${Playername} : ${TotalcorrectAnswerCount}`; 
                    }
                    if(teamname==='Team 2')
                    {   
                        Scoredisplay_2.textContent=`${teamname} - ${Playername} : ${TotalcorrectAnswerCount} `; 
                    }
                } 
                else 
                {
                    square.style.backgroundColor = ''; // Reset other squares
                    square.style.color = ''; // Reset other squares' text color
                }
                if (key === squareNumber) 
                {    
                    // To keep track of the blinking state
                    let isBlinking = false;
                
                    // To toggle the background color
                    const blink = () => 
                    {
                        if (isBlinking) 
                        {
                            square.style.backgroundColor = "";
                            square.style.color = 'white'; // Make the number visible
                        } 
                        else 
                        {      // Change this to the original color
                                //ladder
                                if(newPosition===19 || newPosition===23 || newPosition===22 || newPosition===31 || newPosition===48 || newPosition===34)
                                {
                                    square.style.backgroundColor = "lightgreen"; 
                                    square.style.color = 'white';
                                }
                                //Snake
                                else if(newPosition===17 || newPosition===35 || newPosition===4 || newPosition===21 || newPosition===26 || newPosition===27)
                                {
                                    square.style.backgroundColor = "red"; 
                                    square.style.color = 'white';
                                }
                                // Dice rolling
                                else if(newPosition === 8 || newPosition === 50 || newPosition === 36) 
                                {
                                    square.style.backgroundColor = "lightskyblue"; 
                                    square.style.color = 'white';
                                }
                                //Timer
                                else if(newPosition===7 || newPosition===15 || newPosition===25 || newPosition===33)
                                {
                                    square.style.backgroundColor = "orange"; 
                                    square.style.color = 'white';
                                }
                                // Bonus
                                else if(newPosition===28 || newPosition===45)
                                {
                                    square.style.backgroundColor = "lightcyan"; 
                                    square.style.color = 'white';
                                }
                        }
                        isBlinking = !isBlinking; // Toggle blinking state
                    };
                
                    // Call the blink function every 150 milliseconds 
                    const blinkInterval = setInterval(blink, 150);
                
                    // Stop blinking after a certain duration of 3 seconds
                    setTimeout(() => 
                    {
                        clearInterval(blinkInterval); // Stop the blinking
                        square.style.backgroundColor = " "; // Restore the original color
                    }, 3000);
                }
                
            
            });
        
            if (teamname === 'Team 1') 
            {
                team1Position = newPosition;
            } 
            else 
            {
                team2Position = newPosition;
            }
            // Wining position
            if (newPosition === 50) 
            {       
                    bonus+=20;
                    clearInterval(timer)
                    leaderboardcalculate();
                    document.getElementById('container').style.opacity = '0.1';
                    container_2.style.opacity="0.1";
                    document.querySelector('.win-lose-overlay ').style.display = 'block';
                    document.querySelector('.win-lose-message ').style.display = 'block';
                    document.querySelector(".win-lose-button").style.display="block";

                
                    document.querySelector(".win-lose-message").style.color="green";
                    document.querySelector(".win-lose-message").innerHTML= `Hurray! You Won`;

                    // Handle Start Quiz button click
                    document.getElementById('lose-start-quiz').addEventListener('click', () => 
                    {       
                            fetch('/redirect-to-route', 
                            {
                                method: 'GET', 
                                headers: 
                                {
                                    'Content-Type': 'application/json'
                                },
                                
                            })
                            .then(response => {
                                // Handle response (redirect to another page)
                                window.location.href = '/interface';
                            })
                            .catch(error => 
                                {
                                console.error('Error redirecting:', error);
                            });
                    

                    });

            }

        }, 500);

    }

    if (!boardCreated) 
    {
        const board = document.getElementById('board');

        for (let i = 50; i > 0; i--) 
        {
            const square = document.createElement('div');
            square.className = 'square';
            square.textContent = i;
            
            //Snake
            if (i === 24) 
            {
                square.style.backgroundImage = "url('static/images/snake.png')";
                square.style.backgroundSize = "contain";
            } else if (i === 18) 
            {
                square.style.backgroundImage = "url('static/images/snake.png')";
                square.style.backgroundSize = "contain"
            }  else if (i === 32) 
            {
                square.style.backgroundImage = "url('static/images/snake.png')";
                square.style.backgroundSize = "contain"
            } 
            else if (i === 40) 
            {
                square.style.backgroundImage = "url('static/images/snake.png')";
                square.style.backgroundSize = "contain"
            } 
            else if (i === 43) 
            {
                square.style.backgroundImage = "url('static/images/snake.png')";
                square.style.backgroundSize = "contain"
            } 
            else if (i === 47) 
            {
                square.style.backgroundImage = "url('static/images/snake.png')";
                square.style.backgroundSize = "contain"
            } 
            
            //Ladder----------
            else if (i === 5) 
            {
                square.style.backgroundImage = "url('static/images/ladder.png')";
                square.style.backgroundSize = "contain"
            } 
            else if (i === 9) 
            {
                square.style.backgroundImage = "url('static/images/ladder.png')";
                square.style.backgroundSize = "contain"
            } 
            else if (i === 12) 
            {
                square.style.backgroundImage = "url('static/images/ladder.png')";
                square.style.backgroundSize = "contain"
            }
            else if (i === 20) 
            {
                square.style.backgroundImage = "url('static/images/ladder.png')";
                square.style.backgroundSize = "contain"
            }
            else if (i === 29) 
            {
                square.style.backgroundImage = "url('static/images/ladder.png')";
                square.style.backgroundSize = "contain"
            }
            else if (i === 37) 
            {
                square.style.backgroundImage = "url('static/images/ladder.png')";
                square.style.backgroundSize = "contain"
            }
            
            //Timer-plus-picture-
            else if(i===7)
            {
                square.style.backgroundImage = "url('static/images/timerplus.png')";
                square.style.backgroundSize = "contain"
            }
            else if(i===15)
            {
                square.style.backgroundImage = "url('static/images/timerplus.png')";
                square.style.backgroundSize = "contain"
            }
            else if(i===25)
            {
                square.style.backgroundImage = "url('static/images/timerplus.png')";
                square.style.backgroundSize = "contain"
            }
            else if(i===33)
            {
                square.style.backgroundImage = "url('static/images/timerplus.png')";
                square.style.backgroundSize = "contain"
            }
            
            // Bonus Picture
            else if(i===28)
            {
                square.style.backgroundImage = "url('static/images/bonus.png')";
                square.style.backgroundSize = "contain"
            }
            else if(i===45)
            {
                square.style.backgroundImage = "url('static/images/bonus.png')";
                square.style.backgroundSize = "contain"
            }

            //Dice picture
            else if(i===2)
            {
                square.style.backgroundImage = "url('static/images/dicerolling.png')";
                square.style.backgroundSize = "contain"
            }
            else if(i===44)
            {
                square.style.backgroundImage = "url('static/images/dicerolling.png')";
                square.style.backgroundSize = "contain"
            }
            else if(i===30)
            {
                square.style.backgroundImage = "url('static/images/dicerolling.png')";
                square.style.backgroundSize = "contain"
            }
            board.appendChild(square);
        }

        boardCreated = true;
    }


    // -----------------------------Timer Section----------------------

        function startTimer() 
        {
        
            updateTimer(); // Initial call to updateTimer to avoid the initial delay

            // Update timer every second
            timer = setInterval(updateTimer, 1000);
        }
            function updateTimer() 
            {
                const timerElement = document.getElementById('timer');
                const blueTimerElement = document.getElementById("bluetimer");
                const yellowTimerElement = document.getElementById("yellowtimer");
                const redTimerElement = document.getElementById("redtimer");
                
                
                
                timerElement.textContent = `${timeLeft}s`;

               
                if (timeLeft > (timeconst / 2)) 
                {
                    blueTimerElement.style.display = "block";
                    yellowTimerElement.style.display = "none";
                    redTimerElement.style.display = "none";
                } 
                else if (timeLeft > (timeconst / 4)) 
                {
                    yellowTimerElement.style.display = "block";
                    blueTimerElement.style.display = "none";
                    redTimerElement.style.display = "none";
                } 
                else 
                {
                    redTimerElement.style.display = "block";
                    blueTimerElement.style.display = "none";
                    yellowTimerElement.style.display = "none";
                }

                if (timeLeft <= 0) 
                {
                        clearInterval(timer);

                        document.getElementById('timer').classList.add('time-over');

                        document.getElementById('container').style.opacity = '0.1';
                        container_2.style.opacity="0.1";
                        document.querySelector('.win-lose-overlay ').style.display = 'block';
                        document.querySelector('.win-lose-message ').style.display = 'block';
                        document.querySelector(".win-lose-message").innerHTML= `You Lose`;

            
                            // Handle Start Quiz button click
                                document.getElementById('lose-start-quiz').addEventListener('click', () => 
                                {       
                                        fetch('/redirect-to-route', 
                                        {
                                            method: 'GET', 
                                            headers: 
                                            {
                                                'Content-Type': 'application/json'
                                            },
                                            
                                        })
                                        .then(response => {
                                            // Handle response (redirect to another page)
                                            window.location.href = '/interface';
                                        })
                                        .catch(error => 
                                            {
                                            console.error('Error redirecting:', error);
                                        });
                                

                                });
                        
                        
                    
                        document.querySelectorAll('.option').forEach(option => 
                        {
                            option.style.pointerEvents = 'none';
                        });
                        leaderboardcalculate();  
                }
                 else 
                 {
                    timeLeft--;
                }
            }

        function increaseTime(amount) 
        {
            timeLeft += amount;
            timeconst=timeLeft;
            updateTimer(); 
        }
           
});
