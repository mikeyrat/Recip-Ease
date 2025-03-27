document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const messageBox = document.getElementById('login-message');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        try {
            
            const loginResponse = await fetch('http://localhost:3000/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const loginData = await loginResponse.json();

            if (!loginResponse.ok || !loginData.userId) {
                messageBox.innerHTML = `<p style="color: red;">Login failed: ${loginData.error || 'Invalid credentials'}</p>`;
                
                return;
            }
            
            const userId = loginData.userId;
            localStorage.setItem('userId', userId);

            const userResponse = await fetch(`http://localhost:3000/api/users/${userId}`);
            const userData = await userResponse.json();

            if (!userResponse.ok || !userData.firstName) {
                messageBox.innerHTML = `<p style="color: red;">Login failed: Could not load user info.</p>`;
                return;
            }    
            messageBox.innerHTML = `
            <div class="ui-message success">
                Welcome ${userData.firstName}!
                
            </div>
            
        `;
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';

            document.getElementById('view-account').disabled = false;
            document.getElementById('change-credentials').disabled = false;
            document.getElementById('logout-container').style.display = 'flex';

        } catch (err) {
            console.error("Login error:", err);
            messageBox.innerHTML = `<p style="color: red;">Server error. Please try again later.</p>`;
        }
    });

    document.getElementById('show-signup').addEventListener('click', () => {
        const html = Mustache.render(signupTemplate, {});
        const signupPanel = document.getElementById('signup-panel');
    
        signupPanel.innerHTML = html;
        signupPanel.style.display = 'block';
        document.getElementById('account-action-panel').style.display = 'none';
    
        setTimeout(() => {
            const signupForm = document.getElementById('signup-form');
            if (!signupForm) {
                console.error("Signup form not found after rendering.");
                return;
            }

            document.querySelector('.cancel-signup').addEventListener('click', () => {
                document.getElementById('signup-panel').style.display = 'none';
                document.getElementById('signup-panel').innerHTML = ''; // clear it out (optional)
            });
            console.log("Signup form found. Binding submit handler...");
    
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                console.log("Signup form submitted");
    
                const firstName = document.getElementById('signup-first').value.trim();
                const lastName = document.getElementById('signup-last').value.trim();
                const username = document.getElementById('signup-username').value.trim();
                const email = document.getElementById('signup-email').value.trim();
                const password = document.getElementById('signup-password').value;
                const passwordConfirm = document.getElementById('signup-password-confirm').value;

                if (password !== passwordConfirm) {
                    document.getElementById('signup-message').innerHTML = `
                        <p style="color: red;">Passwords do not match. Please try again.</p>
                    `;
                    return;
                }
    
                try {
                    const response = await fetch('http://localhost:3000/api/users/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, email, password, firstName, lastName })
                    });
    
                    const data = await response.json();
                    const messageBox = document.getElementById('signup-message');
    
                    if (response.ok) {
                        messageBox.innerHTML = `<p style="color: green;">Account created successfully. You may now log in.</p>`;
                    
                        setTimeout(() => {
                            const panel = document.getElementById('signup-panel');
                            panel.style.display = 'none';
                            panel.innerHTML = ''; 
                        }, 2000); 
                    } else {
                        messageBox.innerHTML = `<p style="color: red;">Error: ${data.error || 'Unable to register user.'}</p>`;
                    }
                } catch (err) {
                    console.error("Signup error:", err);
                    document.getElementById('signup-message').innerHTML = "<p style='color: red;'>Server error. Try again later.</p>";
                }
            });
        }, 50);  
    });

    document.getElementById('view-account').addEventListener('click', async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
    
        const response = await fetch(`http://localhost:3000/api/users/${userId}`);
        const user = await response.json();
    
        const html = Mustache.render(accountInfoTemplate, user);
        const panel = document.getElementById('account-action-panel');
        panel.innerHTML = html;
        panel.style.display = 'block';
        document.getElementById('signup-panel').style.display = 'none'; // hide sign-up if visible
    });

    document.getElementById('change-credentials').addEventListener('click', () => {
        const html = Mustache.render(changeCredentialsTemplate, {});
        const panel = document.getElementById('account-action-panel');
        panel.innerHTML = html;
        panel.style.display = 'block';
        document.getElementById('signup-panel').style.display = 'none';
    
        // ⏳ Ensure the DOM is fully updated before we bind
        setTimeout(() => {
            requestAnimationFrame(() => {
                const updateForm = document.getElementById('update-form');
    
                if (!updateForm) {
                    return;
                }
    
                console.log("✅ Found #update-form. Binding submit handler...");
    
                updateForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
    
                    const userId = localStorage.getItem('userId');
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
    
                    const body = {};
                    if (newEmail) body.email = newEmail;
                    if (newPassword) body.password = newPassword;
    
                    try {
                        const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(body)
                        });
    
                        if (response.ok) {
                            panel.innerHTML = `
                                <div class="ui-message success">Account updated successfully.</div>
                            `;

                            setTimeout(() => {
                                panel.innerHTML = '';
                                panel.style.display = 'none';
                                document.getElementById('logout-container').style.display = 'flex';
                            }, 6000); // Message shows for 6 seconds
                        } else {
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
    
                // ✅ Add Cancel Button
                const cancelBtn = document.querySelector('.cancel-update');
                if (cancelBtn) {
                    cancelBtn.addEventListener('click', () => {
                        panel.style.display = 'none';
                        panel.innerHTML = '';
                    });
                }
            });
        }, 0);
    });

    document.getElementById('logout').addEventListener('click', () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('firstName'); // if you're storing it
        
        // Hide protected features
        document.getElementById('logout').style.display = 'none';
        document.getElementById('view-account').disabled = true;
        document.getElementById('change-credentials').disabled = true;
        document.getElementById('account-action-panel').style.display = 'none';
        document.getElementById('account-action-panel').innerHTML = '';
        document.getElementById('logout-container').style.display = 'none';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    
        // Show message or reset form
        const messageBox = document.getElementById('login-message');
        messageBox.innerHTML = `
            <div class="ui-message info">You have been logged out.</div>
        `;
    });
    

    document.getElementById('view-account').disabled = true;
    document.getElementById('change-credentials').disabled = true;
});
