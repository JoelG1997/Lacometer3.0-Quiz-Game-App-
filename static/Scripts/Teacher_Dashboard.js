// TeacherInterface.js
let optionsLabel = document.getElementById("optionslabel");
let question_count=0;
function getquestioncount()
{
    fetch('/get_question_count')
        .then(response => response.json())
        .then(data => 
        {
            // Access the question count from the response
            question_count = data.question_count;
            console.log(question_count);
        })
        .catch(error => 
        {
            console.error('Error fetching question count:', error);
        });
}
getquestioncount();
function addOptions() 
{
    optionsLabel.innerHTML = `<label for="options" id="optionslabel">Options:</label>`;
    // Create a new li element with an input field
    var newOption = document.createElement("li");
    newOption.innerHTML = '<input type="text" name="options" placeholder="Option" required>';

    // Append the new li element to the optionsList
    document.getElementById("optionsList").appendChild(newOption);
}


document.getElementById("submit").addEventListener('click', () => 
{     
    var question = document.getElementById('question');
    var options = document.getElementById('optionslabel');
    var correctAnswer = document.getElementById('correctAnswer');
     
    if (question.value !== "" && options.value !== "" && correctAnswer.value !== "") {
       alert("Query has been submitted");
    } else { 
        alert("Please complete the query");
    }
});




document.getElementById('addquestion').addEventListener('click', () => 
{   document.getElementById("container").style.display="block";
    document.querySelector(".container_2").style.display="none"; 
    document.getElementById("back").style.display="block";
});

document.getElementById("studentscorebutton").addEventListener('click', () => 
{   
    document.querySelector(".container_2").style.display="none"; 
    document.getElementById("back").style.display="block";
    document.querySelector(".container_3").style.display="block";
   
                                         
    document.querySelector('.container_3').innerHTML = `
                               
    <div id="studentscore">
        <h2>Student Scores</h2>
        <table id="studentscore-table">
            <thead>
                <tr>
                    <th>Rank</th>
                    <th>Student Name</th>
                    <th>Quiz Score out of ${question_count}</th>
                </tr>
            </thead>
            <tbody id="studentscore-list">
                <!-- Table rows will be populated dynamically -->
            </tbody>
        </table>
    </div>
`;

let loadCounter = 0;
const maxLoadLimit = 10;
function fetchstudentscoreDetails() 
{
    if (loadCounter >= maxLoadLimit) {
        console.log('Maximum load limit reached. Stopping further polling.');
        return;
    }

    fetch('/leaderboard')
    .then(response => response.json())
    .then(data => {
        const studentscoreList = document.getElementById('studentscore-list');
        studentscoreList.innerHTML = ''; // Clear existing rows

        data.player_scores.forEach((player, index) => 
        {
            const row = document.createElement('tr');

           
            row.innerHTML += `
                <td>${player.rank}</td>
                <td>${player.name}</td>
                <td>${player.individual_points}</td>
            `;
            studentscoreList.appendChild(row);
            if (index === 0 && player.total_points != 0) 
             {
                row.classList.add('highlighted');
             }

        });

        // Increment the load counter
        loadCounter++;

        // After updating the leaderboard, initiate the next long polling request
        fetchstudentscoreDetails();
    })
    .catch(error => console.error('Error fetching leaderboard data:', error));
}




// Start the long polling process
fetchstudentscoreDetails();

});

document.getElementById("backbutton").addEventListener('click', () => 
{
    document.querySelector(".container_2").style.display="block"; 
    document.getElementById("container").style.display="none";
    document.querySelector(".container_3").style.display="none";
    document.getElementById("back").style.display="none";    
});

