let login_form = document.querySelector(".login-form");
let register_form=document.querySelector(".register-form");
document.querySelector(".register-form").style.display="none";
// Login---------------------------------------------------------------------------------------------
login_form.innerHTML=`
<!-- Login Form -->
<form class="form-box" method="POST">
    <div class="form-title">
        <h4>Login<span>Form</span></h4>
        <h5>Sign in to your account</h5>
    </div>
    <input type="hidden" name="form_type" value="login">
    <input type="text" name="email" id="email" placeholder="Email Address" required />
    <input type="password" name="password" placeholder="Passsword" id="password" required><i class="fa fa-eye" id="login_eye"></i></input>
    <input type="submit" value="Sign in" class="submit-btn" />
</form>
<a class="signup" id="signup">Don't have an account? Sign up</a>`;

const eyeIcon = document.getElementById('login_eye');
const passwordInput = document.getElementById('password');

eyeIcon.addEventListener('click', function() 
{
    if (passwordInput.type === 'password') 
    {
        passwordInput.type = 'text';
        eyeIcon.classList.remove('fa-eye');
        eyeIcon.classList.add('fa-eye-slash');
    } 
    else 
    {
        passwordInput.type = 'password';
        eyeIcon.classList.remove('fa-eye-slash');
        eyeIcon.classList.add('fa-eye');
    }
});










// Registration---------------------------------------------------------------------------------------

let signup = document.getElementById("signup");

signup.addEventListener('click', () => 
{
    document.querySelector(".login-form").style.display = "none";
    document.querySelector(".register-form").style.display = "block";
    document.querySelector(".register-form").innerHTML = `
    <!-- Registration Form -->
    <form class="form-box" id="register-form" method="POST">
        <div class="form-title">
            <h4>Registration<span>Form</span></h4>
            <h5>Create a new Account</h5>
        </div>
        <input type="hidden" name="form_type" value="register">
        <input type="text" id="reg-email" name="reg-email" placeholder="Email" required />
        <span class="error-message"></span>
        <input type="password" id="reg-password" name="reg-password" placeholder="Password" required><i class="fa fa-eye" id="register_eye"></i></input>
        <span class="error-message" id="password-error-message"></span>
        <div id="designation-selection">
            <input type="radio" id="student" name="designation" value="Student" required>
            <label for="student">Student</label>
            <input type="radio" id="teacher" name="designation" value="Teacher">
            <label for="teacher">Teacher</label>
        </div>
        <input type="submit" value="Sign Up" id="register_submit" class="submit-btn" />
    </form>
    <a class="signup" id="signin">Already have an account? Log in</a>`;
    


    const eyeIcon = document.getElementById('register_eye');
    const passwordInput = document.getElementById('reg-password');
     
    eyeIcon.addEventListener('click', function() 
    {
        if (passwordInput.type === 'password') 
        {
            passwordInput.type = 'text';
            eyeIcon.classList.remove('fa-eye');
            eyeIcon.classList.add('fa-eye-slash');
        } 
        else 
        {
            passwordInput.type = 'password';
            eyeIcon.classList.remove('fa-eye-slash');
            eyeIcon.classList.add('fa-eye');
        }
    });
    
    const registerForm = document.getElementById('register-form');
    registerForm.addEventListener('submit', function(event) 
    {     
        event.preventDefault(); // Prevent default form submission behavior
        
        // Check if the username is in email format
        const emailInput = document.getElementById('reg-email'); 
        const email = emailInput.value.trim(); // Get email value and remove leading/trailing whitespace
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regular expression for email format

        if (!emailRegex.test(email)) // Test if email matches the regex pattern
        {
            // If not in email format, display warning message and highlight input field
            emailInput.classList.add('error-message');
            emailInput.nextElementSibling.innerText = "Please enter a valid email address.";
            return; // Stop further execution of the submission process
        } 
        else 
        {
            // If the email is in the correct format, remove any previous warning messages and styles
            emailInput.classList.remove('error-message');
            emailInput.nextElementSibling.innerText = "";
        }

        // Password Checking------------------------------
        const passwordInput = document.getElementById('reg-password'); 
        const passwordcheck = passwordInput.value.trim(); // Get password value and remove leading/trailing whitespace
        const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/; // Regular expression for password requirements

        if (!passRegex.test(passwordcheck)) // Test if password matches the regex pattern
        {
            // If password does not meet requirements, display warning message and highlight input field
            passwordInput.classList.add("error-message")
            document.getElementById("password-error-message").innerText = "Password must be at least 8 characters long and include a mix of letters (both uppercase and lowercase) and digits"
            return; // Stop further execution of the submission process
        }
        else
        {
            // If password meets requirements, remove any previous warning messages and styles
            passwordInput.classList.remove("error-message")
            document.getElementById("password-error-message").innerText = "";
        }

         
        // Fetch logic for registration
        // Include form data in the fetch call body
        fetch('/', 
        {
            method: 'POST',
            body: new FormData(registerForm),
        })
        .then(response => 
        {
            if (!response.ok) 
            {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => 
        {
            if (data.message==='Email Address already exists. Please choose a different email address.') 
            {
                document.querySelector('.error-message').textContent="Email Address already exists. Please choose a different email address.";
            }
            else if(data.message==='Username already exists. Please choose a different one.')
            {
                document.querySelector('.error-message').textContent="Username already exists. Please choose a different one.";
            }
            else
            {
                document.querySelector(".register-form").style.display="none";
                alert(data.message)
                document.querySelector(".login-form").style.display = "Block"; 
                
            }

           
        })
        .catch(error => 
        {  
         console.error('There was a problem with the fetch operation:', error);
        });
    });
   

    document.getElementById('signin').addEventListener('click',()=>
    {
        document.querySelector('.register-form').style.display = "none";
        document.querySelector('.login-form').style.display = "block";
    });

});


