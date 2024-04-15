from flask import Flask, render_template, request, redirect, url_for, flash, session,jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
from operator import attrgetter
from flask_bcrypt import generate_password_hash
from flask_bcrypt import check_password_hash


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['PERMANENT_SESSION_LIFETIME'] = 200  # Session expiration time (in seconds)
db = SQLAlchemy(app)



class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), nullable=False)
    password = db.Column(db.String(60), nullable=False)
    email=db.Column(db.String(20), unique=True, nullable=False)
    Designation = db.Column(db.String(10), nullable=False)
    approved = db.Column(db.String(10),default="Nothing")  

class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    team = db.Column(db.String(50), nullable=False)
    player = db.Column(db.String(50), nullable=False)

class QuizQuestion(db.Model):
    QuestionID = db.Column(db.Integer, primary_key=True)
    Question = db.Column(db.String(100), nullable=False)

class QuizQuestionAnswer(db.Model):
    ID = db.Column(db.Integer, primary_key=True)  # Unique identifier for each answer
    QuestionID = db.Column(db.Integer, db.ForeignKey('quiz_question.QuestionID'), nullable=False)  # Refers to the question being answered
    Options = db.Column(db.String(100), nullable=False)  # Multiple options for the question
    Answer = db.Column(db.Integer, nullable=False)  # The correct answer among the options
    question = db.relationship('QuizQuestion', backref=db.backref('answers', lazy=True))  # Establishes a connection to the QuizQuestion table

class PlayerScore(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    team = db.Column(db.String(50), nullable=False)
    individual_points = db.Column(db.Integer, nullable=False, default=0)
    bonus_points = db.Column(db.Integer, nullable=False, default=0)
    total_points = db.Column(db.Integer, nullable=False, default=0)

    


# Route for registering and logging in
@app.route('/', methods=['GET', 'POST'])
def loginregister():
    # Check if the user is already logged in, if yes, redirect to the interface
    if 'username' in session:
       return redirect(url_for('interface'))
    
    if request.method == 'POST':
        # Registration Section-----------------
        if request.form.get('form_type') == 'register': 
            reg_email = request.form.get('reg-email')
            reg_password = request.form.get('reg-password')
            designation = request.form.get('designation')

            # Check if the email or username already exists in the database
            existing_user_email = User.query.filter_by(email=reg_email).first()
            existing_user_username = User.query.filter_by(username=reg_email.split("@")[0]).first()

            if existing_user_email:
                return jsonify({'message': 'Email Address already exists. Please choose a different email address.'})
            elif existing_user_username:
                return jsonify({'message': 'Username already exists. Please choose a different one.'})

            # Hash the password before storing it in the database
            hashed_password = generate_password_hash(reg_password).decode('utf-8')
            new_user = User(email=reg_email, username=reg_email.split("@")[0], password=hashed_password, Designation=designation)
            db.session.add(new_user)
            db.session.commit() # Commit changes to the database
            
            return jsonify({'message': 'Registration successful!'})
        
        # Login Section-----------------
        elif request.form.get('form_type') == 'login':
            email = request.form.get('email')
            password = request.form.get('password')

            # Check if the user exists and if the password is correct
            user = User.query.filter_by(email=email).first()

            if user and check_password_hash(user.password, password):
                if user.approved == "True":
                    emailinput = email
                    username = emailinput.split("@")[0]
                    
                    # Store user information in session and redirect based on designation
                    session['username'] = username
                    session['id'] = user.id

                    if user.Designation == "Student":
                        return redirect(url_for('interface'))
                    elif user.Designation == "Teacher":
                        return redirect(url_for('TeacherInterface'))
                    elif user.Designation == "admin":
                        return redirect(url_for('admin_approval'))
                else:
                    # Redirect to login page if user is not approved
                    return redirect(url_for('loginregister'))
        
    # Render the login page template
    return render_template('Login_Registration.html')






# Route for logging out
@app.route('/logout', methods=['POST'])
def logout():
    # Check if the user is logged in
    if 'username' in session:
        # Clear the session by removing the 'username' key
        session.pop('username', None)
    
    # Redirect the user to the login/register page
    return redirect(url_for('loginregister'))







# Route for administrator
@app.route('/admin', methods=['GET', 'POST'])
def admin_approval():
    # Check if the user is logged in
    if 'username' in session:   
        # If it's a GET request, fetch pending users and render the administration page
        if request.method == 'GET':
            pending_users = User.query.filter_by(approved="Nothing").all() 
            return render_template('Administration.html', users=pending_users)
        
        # If it's a POST request, process the approval/disapproval action
        elif request.method == 'POST':
            user_id = request.form.get('user_id')  
            action = request.form.get('action')  
            user = User.query.filter_by(id=user_id).first()  # Get the user object from the database
            
            # If the user exists, update their approval status
            if user:
                try:
                    if action == 'Approve':
                        user.approved = "True"  # Approve the user
                    elif action == 'Disapprove':
                        user.approved = "False"  # Disapprove the user
                        db.session.delete(user)  # Remove user if disapproved
                    db.session.commit()  # Commit changes to the database
                    approval_message = 'User {} {}d.'.format(user.username, action)  # Generate approval message
                    return jsonify({'approval_message': approval_message})  # Return approval message as JSON response
                except Exception as e:
                    db.session.rollback()  # Rollback changes if any exception occurs
                    return jsonify({'message': 'Error occurred while processing request: {}'.format(str(e))}), 500  
    else:
        # If the user is not logged in, redirect to the login/register page
        return redirect(url_for("loginregister"))   














# Route for TeacherInterface
@app.route('/TeacherInterface', methods=['GET', 'POST'])
def TeacherInterface(): 
    # Check if the user is logged in   
    if 'username' in session:
        # If logged in, retrieve the username from the session
        username = session['username']
        if request.method == 'POST':
            try:
                question_text = request.form.get('question')
                options = request.form.getlist('options')
                correct_answer = request.form.get('correctAnswer')
        

                # Create and add a new question to the database
                new_question = QuizQuestion(Question=question_text)
                db.session.add(new_question)
                db.session.commit()  # Commit changes to the database

                # Add options and correct answer for the question to the database
                for option in options:
                    answer_value = 1 if option == correct_answer else 0
                    new_answer = QuizQuestionAnswer(QuestionID=new_question.QuestionID, Options=option, Answer=answer_value)
                    db.session.add(new_answer)
                
                db.session.commit()   # Commit changes to the database

            except Exception as e:
                db.session.rollback()  # Rollback changes in case of an error
                flash(f'Error adding question: {str(e)}', 'danger')
        # Render the interface template and pass the username to it
        return render_template('Teacher_Dashboard.html',username=username)
    else:
         # If not logged in, redirect to the login/register page
        return redirect(url_for('loginregister'))




# --------------------------------------All the routes for TEAM SELECTION PAGE---------------------------------------


# Route for Team Interface
@app.route('/interface')
def interface():
    # Check if the user is logged in
    if 'username' in session:
        # If logged in, retrieve the username from the session
        username = session['username']
        # Render the interface template and pass the username to it
        return render_template('Team_Selection_Interface.html', username=username)
    else:
        # If not logged in, redirect to the login/register page
        return redirect(url_for('loginregister'))




# Route for Storing Player Name and Player Team
@app.route('/store_player_name', methods=['POST'])
def store_player_name():
    # Check if the user is logged in
    if 'username' in session:
        # Parse JSON data from the request
        data = request.json
        team = data['team']
        player = data['player']

        # Check if the player already exists and belongs to another team
        existing_player = Player.query.filter_by(player=player).first()
        if existing_player and existing_player.team != team:
            return jsonify({"error": "Player already belongs to another team."}), 400

        # Count the number of players in the team
        team_players_count = Player.query.filter_by(team=team).count()
        max_players = 4

        # Check if the team has reached its maximum capacity
        if team_players_count >= max_players:
            return jsonify({"error": "Team is full. Cannot add more players."}), 400

        # Add the new player to the database if it doesn't exist, otherwise update the team
        if not existing_player:
            new_player = Player(team=team, player=player)
            db.session.add(new_player)
        else:
            existing_player.team = team

        # Commit changes to the database
        db.session.commit()

        # Return success message
        return jsonify({"message": "Player name stored successfully"}), 200
    else:
        # If the user is not logged in, redirect to the login/register page
        return redirect(url_for('loginregister'))



@app.route('/check_player_team', methods=['POST'])
def check_player_team():
    if 'username' in session:
        data = request.json
        player = data['player']

        # Check if the player has already joined a team
        existing_player = Player.query.filter_by(player=player).first()
        if existing_player and existing_player.team:
            return jsonify({"message": "Player has joined a team"})
        else:
            return jsonify({"message": "Player has not joined a team"})
    else:
        # If the user is not logged in, redirect to the login/register page
        return redirect(url_for('loginregister'))

#----------------------------------------------------------------------------------------------------------------





# Route for Player Name,Team Name,Individual Points,Bonus Points and Total Points 
@app.route('/store_player_score', methods=['POST'])
def store_player_score():
        # Parse JSON data from the request
        data = request.json
        name = data['name']
        team = data['team']
        individual_points = data['individual_points']
        bonus_points = data['bonus_points']
        total_points = individual_points + bonus_points  # Calculate total points
        
        # Check if the player already has a score entry
        existing_score = PlayerScore.query.filter_by(name=session['username']).first()
        if existing_score:
            # Update the existing score entry
            existing_score.individual_points += individual_points
            existing_score.bonus_points += bonus_points
            existing_score.total_points += total_points
        else:
            # Create a new score entry
            new_score = PlayerScore(
                name=name,
                team=team,
                individual_points=individual_points,
                bonus_points=bonus_points,
                total_points=total_points
            )
            db.session.add(new_score)

        # Commit changes to the database
        db.session.commit()
   

    








# Route for Score Chart Table & Student Score Table
@app.route('/leaderboard')
def leaderboard():
    # Fetch all player scores from the database
    player_scores = PlayerScore.query.all()

    # Sort player scores based on total points in descending order
    sorted_scores = sorted(player_scores, key=attrgetter('total_points'), reverse=True)

    # Assign ranks to players based on their position in the sorted list
    for i, score in enumerate(sorted_scores, start=1):
        score.rank = i
    
    # Return JSON response with sorted scores and ranks
    return jsonify(player_scores=
    [{
        'name': score.name,
        'team': score.team,
        'individual_points': score.individual_points,
        'bonus_points': score.bonus_points,
        'total_points': score.total_points,
        'rank': score.rank
    } for score in sorted_scores])

   










@app.route('/quiz')
def index():
    if 'username' in session:  
        # team =session['team']  
        session['current_question_id'] = 0
        return render_template("Quiz_Game.html")
    else:
        return redirect(url_for('loginregister'))
@app.route('/StudentInterface', methods=['GET', 'POST'])
def student_interface():
    if 'username' in session:    
        # Get the current question ID from the session
        current_question_id = session.get('current_question_id', 0)

        # Fetch the next question and its options from the database
        question_data = db.session.query(QuizQuestion, QuizQuestionAnswer).\
            join(QuizQuestionAnswer).\
            filter(QuizQuestion.QuestionID > current_question_id).\
            order_by(QuizQuestion.QuestionID).\
            first()

        if question_data:
            # Update the session with the current question's ID
            session['current_question_id'] = question_data[0].QuestionID

            question = question_data[0].Question
            options = [answer.Options for answer in question_data[0].answers]

            # Create a dictionary to represent the question and options
            question_json = {
                'question': question,
                'options': options
            }

            # Return the JSON response
            return jsonify(question_json)
        else:
            session['current_question_id'] = 0
            # No more questions available
            return jsonify({'message': 'No more questions available'})
    else:
        return redirect(url_for('loginregister'))








@app.route('/get_question_count')
def get_question_count():
    if 'username' in session:
        # Fetch the count of questions from the database
        question_count = db.session.query(func.count(QuizQuestion.QuestionID)).scalar()
        
        # Return the count as JSON response
        return jsonify({'question_count': question_count})
    else:
        return redirect(url_for('loginregister'))







# Route to get team player count
@app.route('/team_player_count', methods=['POST'])
def team_player_count():
    if 'username' in session:
        # Query the database to get the count of players for each team
        team_player_counts = db.session.query(Player.team, db.func.count(Player.id)).group_by(Player.team).all()

        # Format the data into the desired JSON structure
        team_player_count_json = {}
        for team, count in team_player_counts:
            team_player_count_json[team] = count
        
        # Return the JSON response
        return jsonify(team_player_count_json)
    else:
        return redirect(url_for('loginregister'))






# Route to get team name
@app.route('/get_team_name', methods=['POST'])
def get_team_name():
    if 'username' in session:
        username = session['username']
        user = Player.query.filter_by(player=username).first()
        if user:
            team_name = user.team
            Player_name=user.player
            return jsonify({'team_name': team_name,
                            'Player_name':Player_name})
        else:
            return jsonify({'error': 'User not found'}), 404
    else:
        return redirect(url_for('loginregister'))
    


# Route to get Total points of a player
@app.route('/get_total_points', methods=['POST'])
def get_total_points():
    if 'username' in session:
        username = session['username']

        player_score = PlayerScore.query.filter_by(name=username).first()
        if player_score:
            total_points = player_score.total_points
            return jsonify({'total_points': total_points})
        else:
            total_points=0
            return jsonify({'total_points': total_points})
    else:
        return redirect(url_for('loginregister'))





# Route to get team total points and count based on username 
@app.route('/total_team_points', methods=['POST'])
def total_team_points():
    if 'username' in session:
        username = session['username']
        # Assuming PlayerScore is the model for player scores
        user = PlayerScore.query.filter_by(name=username).first()
        if user:
            team_name = user.team
            # Retrieve all players in the same team
            players_in_team = PlayerScore.query.filter_by(team=team_name).all()
            total_points_in_team = sum(player.total_points for player in players_in_team)
            num_players_in_team = len(players_in_team)
            return jsonify({
                'total_points_in_team': total_points_in_team,
                'num_players_in_team': num_players_in_team
            })
        else:
            return jsonify({'error': 'User not found'}), 404
    else:
        return redirect(url_for('loginregister'))






# Total points of both teams
@app.route('/both_teams_total_points', methods=['POST'])
def both_teams_total_points():
    if 'username' in session:
        username = session['username']
        # Assuming PlayerScore is the model for player scores
        user = PlayerScore.query.filter_by(name=username).first()
        if user:
            # Retrieve all players in both teams
            team_1_players = PlayerScore.query.filter_by(team='Team 1').all()
            team_2_players = PlayerScore.query.filter_by(team='Team 2').all()
            
            # Calculate total points for Team 1
            team_1_total_score = sum(player.total_points for player in team_1_players)
            
            # Calculate total points for Team 2
            team_2_total_score = sum(player.total_points for player in team_2_players)
            
            return jsonify({
                'Team_1': team_1_total_score,
                'Team_2': team_2_total_score
            })
        else:
            return jsonify({'error': 'User not found'}), 404
    else:
        return redirect(url_for('loginregister'))









#--------------------------------------------------------------------------------------------------------------------------

@app.route('/check_answer', methods=['GET','POST'])
def check_answer():
    if 'username' in session:
        selected_answer = request.json.get('selected_answer')# Get the selected answer from the request
        question=request.json.get('question')#Get the question from the request
                 
        # Query the database to get the correct answer for the given question text
        correct_answer = db.session.query(QuizQuestionAnswer.Answer).join(QuizQuestion).filter(QuizQuestion.Question == question, QuizQuestionAnswer.Options == selected_answer).scalar()
                                                                                                                                                                                              
        # Determine correctness
        if correct_answer==1:
            is_correct = True
        else: is_correct=False
    
        # Return the result as JSON
        return jsonify({'isCorrect': is_correct})
    else:
        return redirect(url_for('loginregister'))    








#-------------------------------------------------------------------

@app.route('/viewresult', methods=['GET','POST'])
def viewresult():
    if 'username' in session:
        question=request.json.get('question')
    
        # Query the database to get the correct answer for the given question text
        correct_answer = db.session.query(QuizQuestionAnswer.Options).join(QuizQuestion).filter(QuizQuestion.Question == question, QuizQuestionAnswer.Answer == 1).scalar()
        
        # Return the result as JSON
        return jsonify({'correctanswer': correct_answer})
    else:
        return redirect(url_for('loginregister'))

        





#Route for lose start button click to redirect to interface.html
@app.route('/redirect-to-route', methods=['GET'])
def redirect_to_route():  
    return redirect(url_for('interface'))





if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
