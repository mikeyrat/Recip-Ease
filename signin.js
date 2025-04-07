document.addEventListener('DOMContentLoaded', () => { // this mess is for the signin page. And I thought it would be my easiest page LOL!
    sharedPageInit();

    const userId = localStorage.getItem('userId');
if (userId) {
    // Fetch user data to confirm and update the UI
    fetch(`http://3.84.112.227:3000/api/users/${userId}`)
        .then(res => res.json())
        .then(user => {
            if (user && user.firstName) {
                document.getElementById('view-account').disabled = false;
                document.getElementById('change-credentials').disabled = false;
                document.getElementById('logout-container').style.display = 'flex';

                const messageBox = document.getElementById('login-message');
                messageBox.innerHTML = `
                    <div class="ui-message info">
                        Welcome back, ${user.firstName}!
                    </div>
                `;
            }
        })
        .catch(err => {
            console.error("Auto-login check failed:", err);
        });
}

    const loginForm = document.getElementById('login-form'); //call these forms to the webpage when it renders
    const messageBox = document.getElementById('login-message');

    loginForm.addEventListener('submit', async (e) => { // wait for the user to put in username and pass and hit submit
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        try { // cuz this page had a lot of errors with timing and other stupid stuff and I had to do some trapping
            
            const loginResponse = await fetch('http://3.84.112.227:3000/api/users/login', { //send username and pass
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const loginData = await loginResponse.json(); //wait for response

            if (!loginResponse.ok || !loginData.userId) { // no match for both, start over chump
                messageBox.innerHTML = `<p style="color: red;">Login failed: ${loginData.error || 'Invalid credentials'}</p>`;
                
                return;
            }
            
            const userId = loginData.userId; // the above returns the users document id
            localStorage.setItem('userId', userId); // store that for later use all over the site

            const userResponse = await fetch(`http://3.84.112.227:3000/api/users/${userId}`); // go back with the userdi and grab the username
            const userData = await userResponse.json();

            if (!userResponse.ok || !userData.firstName) { // when login failed, we can't get first name (this code not used much due to other checks)
                messageBox.innerHTML = `<p style="color: red;">Login failed: Could not load user info.</p>`;
                return;
            }    
            // if it all works, show a welcome message with the user's first name
            messageBox.innerHTML = ` 
            <div class="ui-message success"> 
                Welcome ${userData.firstName}!
                
            </div> 
            
        `;
            document.getElementById('username').value = ''; // clear the username and password
            document.getElementById('password').value = '';

            document.getElementById('view-account').disabled = false;
            document.getElementById('change-credentials').disabled = false;
            document.getElementById('logout-container').style.display = 'flex';

        } catch (err) { // trap errors like node.js not responding
            console.error("Login error:", err);
            messageBox.innerHTML = `<p style="color: red;">Server error. Please try again later.</p>`;
        }

        sharedPageInit();
    });
 
    document.getElementById('show-signup').addEventListener('click', () => {  // code for displaying the signup form if "Sign Up" clicked
        const html = Mustache.render(signupTemplate, {});
        const signupPanel = document.getElementById('signup-panel');
    
        signupPanel.innerHTML = html;
        signupPanel.style.display = 'block';
        document.getElementById('account-action-panel').style.display = 'none'; //change visibility 
    
        setTimeout(() => {
            const signupForm = document.getElementById('signup-form');
            if (!signupForm) {
                console.error("Signup form not found after rendering AARRGG!!."); // had some timing issues where the form would show, but not be "rendered" in the code, making the form useless
                return;
            }

            document.querySelector('.cancel-signup').addEventListener('click', () => { // user cancels sign up
                document.getElementById('signup-panel').style.display = 'none';
                document.getElementById('signup-panel').innerHTML = ''; // clear it out if cancelled
            });
            
    
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                console.log("Signup form submitted"); // troubleshooting console log. Not relevant to operation.
    
                const firstName = document.getElementById('signup-first').value.trim(); //Grab user particulars
                const lastName = document.getElementById('signup-last').value.trim();
                const username = document.getElementById('signup-username').value.trim();
                const email = document.getElementById('signup-email').value.trim();
                const password = document.getElementById('signup-password').value;
                const passwordConfirm = document.getElementById('signup-password-confirm').value;

                if (password !== passwordConfirm) { // make sure passwords match
                    document.getElementById('signup-message').innerHTML = `
                        <p style="color: red;">Passwords do not match. Please try again.</p>
                    `;
                    return;
                }
    
                try {
                    const response = await fetch('http://3.84.112.227:3000/api/users/register', { // if all good, add user to collection
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, email, password, firstName, lastName })
                    });
    
                    const data = await response.json();
                    const messageBox = document.getElementById('signup-message'); // display acknowledgement
    
                    if (response.ok) {
                        messageBox.innerHTML = `<p style="color: green;">Account created successfully. You may now log in.</p>`;
                    
                        setTimeout(() => { // wait 2 seconds and then change visibility
                            const panel = document.getElementById('signup-panel');
                            panel.style.display = 'none';
                            panel.innerHTML = ''; 
                        }, 2000); 
                    } else { // problems with database perhaps?
                        messageBox.innerHTML = `<p style="color: red;">Error: ${data.error || 'Unable to register user.'}</p>`;
                    }
                } catch (err) {
                    console.error("Signup error:", err); //error message on trap
                    document.getElementById('signup-message').innerHTML = "<p style='color: red;'>Server error. Try again later.</p>"; // turn on your node.js dumbass
                }
            });
        }, 50);  
    });

    document.getElementById('view-account').addEventListener('click', async () => { // pretty straight forward - grabs user details and displays
            const userId = localStorage.getItem('userId');
            if (!userId) {
                document.getElementById('login-message').innerHTML = `
                    <p style="color: red;">Please sign in to view account details.</p>
                `;
                return;
            }
    
        const response = await fetch(`http://3.84.112.227:3000/api/users/${userId}`);
        const user = await response.json();
    
        const html = Mustache.render(accountInfoTemplate, user);
        const panel = document.getElementById('account-action-panel');
        panel.innerHTML = html;
        panel.style.display = 'block';
        document.getElementById('signup-panel').style.display = 'none'; // hide sign-up if visible
    });

    document.getElementById('change-credentials').addEventListener('click', () => { // since this creates another form where the sign-up panel goes, I had the same issue with timing it rendered on the screen but not the DOM
        const userId = localStorage.getItem('userId');
            if (!userId) {
                document.getElementById('login-message').innerHTML = `
                    <p style="color: red;">Please sign in to change account details.</p>
                `;
                return;
            }
        
        const html = Mustache.render(changeCredentialsTemplate, {});
        const panel = document.getElementById('account-action-panel');
        panel.innerHTML = html;
        panel.style.display = 'block';
        document.getElementById('signup-panel').style.display = 'none';
    
        // Ensure the DOM is fully updated before we try to actually use the form
        setTimeout(() => {
            requestAnimationFrame(() => {
                const updateForm = document.getElementById('update-form');
    
                if (!updateForm) {
                    return;
                }
    
                updateForm.addEventListener('submit', async (e) => { // note, the user if offered the change to change email or pass. If either is left blank in the form, their document is unchanged for that field
                    e.preventDefault();
    
                    const userId = localStorage.getItem('userId'); // store pertinant info and gather info to change from the user.
                    const newEmail = document.getElementById('new-email').value.trim();
                    const newPassword = document.getElementById('new-password').value;
                    const confirmPassword = document.getElementById('new-password-confirm').value;

                    if (newPassword && newPassword !== confirmPassword) {
                        panel.innerHTML = `
                            <p style="color: red;">Passwords do not match. Please try again.</p>
                        `;
                        return;
                    }
    
                    if (!newEmail && !newPassword) return;
    
                    const body = {}; // fill these with either the existing or changed depending on user action
                    if (newEmail) body.email = newEmail;
                    if (newPassword) body.password = newPassword;
    
                    try {
                        const response = await fetch(`http://3.84.112.227:3000/api/users/${userId}`, { // change the document in the collection
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(body)
                        });
    
                        if (response.ok) { //yay!
                            panel.innerHTML = `
                                <div class="ui-message success">Account updated successfully.</div>
                            `;

                            setTimeout(() => {
                                panel.innerHTML = '';
                                panel.style.display = 'none';
                                document.getElementById('logout-container').style.display = 'flex';
                            }, 6000); // Message shows for 6 seconds
                        } else { //BOO!
                            panel.innerHTML = `
                                <div class="ui-message error">Failed to update account.</div>
                            `;

                            setTimeout(() => {
                                panel.innerHTML = '';
                                panel.style.display = 'none';
                                document.getElementById('logout-container').style.display = 'flex';
                            }, 6000);
                        }
                    } catch (err) {
                        console.error("Update error:", err);
                        panel.innerHTML = `<p style="color: red;">Server error. Try again later.</p>`;
                    }
                });
    
                const cancelBtn = document.querySelector('.cancel-update'); // cancel button if they don't want to change
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', () => {
                        panel.style.display = 'none';
                        panel.innerHTML = '';
                    });
                }
            });
        }, 0);
    });

    document.getElementById('logout').addEventListener('click', () => { // logout removed userID and firstname from localStorage
        localStorage.removeItem('userId');
        localStorage.removeItem('firstName');
        
        document.getElementById('logout').style.display = 'none'; // this all makes sure any forms displayed for next user are blank
        document.getElementById('view-account').disabled = true;
        document.getElementById('change-credentials').disabled = true;
        document.getElementById('account-action-panel').style.display = 'none';
        document.getElementById('account-action-panel').innerHTML = '';
        document.getElementById('logout-container').style.display = 'none';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    
        const messageBox = document.getElementById('login-message'); // peace out user
        messageBox.innerHTML = `
            <div class="ui-message info">You have been logged out.</div>
        `;
        sharedPageInit();
    });
    
    document.getElementById('view-account').disabled = true; //sets visibility on these when not needed.
    document.getElementById('change-credentials').disabled = true;
});
