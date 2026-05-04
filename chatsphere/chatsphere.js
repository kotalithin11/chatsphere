// User Profile Management Class
class UserProfile {
  constructor() {
    this.currentUser = null;
    this.users = JSON.parse(localStorage.getItem('chatsphere_users') || '{}');
    this.friends = JSON.parse(localStorage.getItem('chatsphere_friends') || '{}');
    this.notifications = JSON.parse(localStorage.getItem('chatsphere_notifications') || '{}');
    this.messages = JSON.parse(localStorage.getItem('chatsphere_messages') || '{}');
    this.otp = null;
    this.resetEmail = null;
  }

  // Register a new user
  register(name, email, password) {
    if (this.users[email]) {
      throw new Error('User already exists with this email');
    }

    const user = {
      id: name, // User ID is the name
      name: name,
      email: email,
      password: this.hashPassword(password),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      loginCount: 0
    };

    this.users[email] = user;
    this.friends[email] = [];
    this.notifications[email] = [];
    this.saveUsers();
    this.saveFriends();
    this.saveNotifications();
    return user;
  }

  // Login existing user
  login(email, password) {
    const user = this.users[email];
    if (!user) {
      throw new Error('Invalid email or password');
    }
    if (user.password !== this.hashPassword(password)) {
      // Wrong password, generate OTP
      this.generateOTP(email);
      this.resetEmail = email;
      throw new Error('PASSWORD_INCORRECT');
    }

    // Update login info
    user.lastLogin = new Date().toISOString();
    user.loginCount = (user.loginCount || 0) + 1;
    this.saveUsers();

    return user;
  }

  // Generate OTP
  generateOTP(email) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes
    this.otp = { code, expires, email };
    // Simulate sending email
    console.log(`enter the otp: ${code}`);
    alert(`enter the otp: ${code}`);
  }

  // Verify OTP
  verifyOTP(code) {
    if (!this.otp || this.otp.code !== code || Date.now() > this.otp.expires) {
      return false;
    }
    return true;
  }

  // Reset password
  resetPassword(newPassword) {
    const user = this.users[this.resetEmail];
    if (user) {
      user.password = this.hashPassword(newPassword);
      this.saveUsers();
      this.otp = null;
      this.resetEmail = null;
    }
  }

  hashPassword(password) {
    return btoa(password);
  }

  saveUsers() {
    localStorage.setItem('chatsphere_users', JSON.stringify(this.users));
  }

  setCurrentUser(user) {
    this.currentUser = user;
    localStorage.setItem('chatsphere_current_user', JSON.stringify(user));
  }

  getCurrentUser() {
    if (!this.currentUser) {
      const saved = localStorage.getItem('chatsphere_current_user');
      this.currentUser = saved ? JSON.parse(saved) : null;
    }
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('chatsphere_current_user');
  }

  // Check if user is logged in
  isLoggedIn() {
    return this.getCurrentUser() !== null;
  }

  // Get user by ID
  getUserById(id) {
    for (let email in this.users) {
      if (this.users[email].id === id) return this.users[email];
    }
    return null;
  }

  // Friends management
  addFriend(email, friendId) {
    const friend = this.getUserById(friendId);
    if (!friend || friend.id === this.users[email].id) return; // can't add self
    if (!this.friends[email].includes(friendId)) {
      this.friends[email].push(friendId);
      this.saveFriends();
      // Add notification to friend
      this.addNotification(friend.email, `${this.users[email].name} sent you a friend request.`);
    }
  }

  removeFriend(email, friendId) {
    if (this.friends[email]) {
      this.friends[email] = this.friends[email].filter(id => id !== friendId);
      this.saveFriends();
    }
  }

  getFriends(email) {
    const friendIds = this.friends[email] || [];
    return friendIds.map(id => this.getUserById(id)).filter(user => user !== null);
  }

  // Notifications
  addNotification(email, message) {
    if (!this.notifications[email]) this.notifications[email] = [];
    this.notifications[email].push({
      id: Date.now().toString(),
      message,
      timestamp: new Date().toISOString(),
      read: false
    });
    this.saveNotifications();
  }

  getNotifications(email) {
    return this.notifications[email] || [];
  }

  markNotificationRead(email, id) {
    const notifs = this.notifications[email];
    if (notifs) {
      const notif = notifs.find(n => n.id === id);
      if (notif) notif.read = true;
      this.saveNotifications();
    }
  }

  getUnreadNotificationCount(email) {
    const notifs = this.notifications[email] || [];
    return notifs.filter(n => !n.read).length;
  }

  // Messages
  sendMessage(from, to, message) {
    const key = [from, to].sort().join('-');
    if (!this.messages[key]) this.messages[key] = [];
    this.messages[key].push({
      from,
      to,
      message,
      timestamp: new Date().toISOString()
    });
    this.saveMessages();
    // Add notification to recipient
    this.addNotification(to, `New message from ${this.users[from].name}`);
  }

  getMessages(user1, user2) {
    const key = [user1, user2].sort().join('-');
    return this.messages[key] || [];
  }

  // Save methods
  saveFriends() {
    localStorage.setItem('chatsphere_friends', JSON.stringify(this.friends));
  }

  saveNotifications() {
    localStorage.setItem('chatsphere_notifications', JSON.stringify(this.notifications));
  }

  saveMessages() {
    localStorage.setItem('chatsphere_messages', JSON.stringify(this.messages));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const userProfile = new UserProfile();

  // DOM elements
  const loginModal = document.getElementById('login-modal');
  const mainApp = document.getElementById('main-app');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const otpForm = document.getElementById('otp-form');
  const resetForm = document.getElementById('reset-form');
  const loginMessage = document.getElementById('login-message');
  const showRegisterLink = document.getElementById('show-register');
  const showLoginLink = document.getElementById('show-login');
  const backToLoginLink = document.getElementById('back-to-login');
  const backToLoginLink2 = document.getElementById('back-to-login2');

  if (userProfile.isLoggedIn()) {
    
    showMainApp();
  } else {
  
    showLoginModal();
  }

  showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    clearMessage();
  });

  showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    clearMessage();
  });

  backToLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    otpForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    clearMessage();
  });

  backToLoginLink2.addEventListener('click', (e) => {
    e.preventDefault();
    resetForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    clearMessage();
  });

    loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const user = userProfile.login(email, password);
      userProfile.setCurrentUser(user);

      showMessage('Login successful! Welcome back.', 'success');

      setTimeout(() => {
        showMainApp();
      }, 1000);

    } catch (error) {
      if (error.message === 'PASSWORD_INCORRECT') {
        loginForm.classList.add('hidden');
        otpForm.classList.remove('hidden');
        showMessage('Password incorrect. OTP sent to your email.', 'info');
      } else {
        showMessage(error.message, 'error');
      }
    }
  });

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;

    if (password.length < 6) {
      showMessage('Password must be at least 6 characters long', 'error');
      return;
    }

    try {
      const user = userProfile.register(name, email, password);
      userProfile.setCurrentUser(user);

      showMessage('Registration successful! Welcome to ChatSphere.', 'success');

      setTimeout(() => {
        showMainApp();
      }, 1000);

    } catch (error) {
      showMessage(error.message, 'error');
    }
  });

  otpForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const otp = document.getElementById('otp').value.trim();

    if (userProfile.verifyOTP(otp)) {
      otpForm.classList.add('hidden');
      resetForm.classList.remove('hidden');
      showMessage('OTP verified. Enter new password.', 'success');
    } else {
      showMessage('Invalid or expired OTP.', 'error');
    }
  });

  resetForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
      showMessage('Passwords do not match.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showMessage('Password must be at least 6 characters long', 'error');
      return;
    }

    userProfile.resetPassword(newPassword);

    showMessage('Password reset successful. Please login.', 'success');

    setTimeout(() => {
      resetForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
      clearMessage();
    }, 1000);
  });

  function showLoginModal() {
    loginModal.style.display = 'flex';
    mainApp.classList.add('hidden');
  }

  function showMainApp() {
    loginModal.style.display = 'none';
    mainApp.classList.remove('hidden');
    initializeMainApp();
  }

  function showMessage(message, type) {
    loginMessage.textContent = message;
    loginMessage.className = `login-message ${type}`;
  }

  function clearMessage() {
    loginMessage.textContent = '';
    loginMessage.className = 'login-message';
  }

  function initializeMainApp() {
    const infoPanel = document.getElementById('info-panel');
    const sidebarItems = document.querySelectorAll('.sidebar-item');

    const updateBadges = () => {
      const currentUser = userProfile.getCurrentUser();
      const count = userProfile.getUnreadNotificationCount(currentUser.email);
      let badge = document.getElementById('notification-badge');
      if (!badge) {
        const notifItem = document.querySelector('[data-action="notifications"]');
        badge = document.createElement('span');
        badge.id = 'notification-badge';
        badge.className = 'notification-badge';
        notifItem.appendChild(badge);
      }
      badge.textContent = count > 0 ? count : '';
      badge.style.display = count > 0 ? 'block' : 'none';
    };

    updateBadges(); // initial update

    const infoMessages = {
      profile: {
        title: 'Profile',
        text: 'View and update your user profile.'
      },
      notifications: {
        title: 'Notifications',
        text: 'See your latest notifications, alerts, and activity updates.'
      },
      friends: {
        title: 'Friends',
        text: 'Manage your friends list, send friend requests, and browse contacts.'
      },
      chat: {
        title: 'Chat Box',
        text: 'Start chatting with your friends.'
      },
      liveChat: {
        title: 'Live Chat Room',
        text: 'Join live chat rooms and connect with people worldwide.'
      },
      help: {
        title: 'Help',
        text: 'Get help and support for using ChatSphere.'
      },
      settings: {
        title: 'Settings',
        text: 'Customize your ChatSphere experience.'
      },
      logout: {
        title: 'Logout',
        text: 'You will be logged out and returned to the login page.'
      }
    };

    const showInfo = (action) => {
      const currentUser = userProfile.getCurrentUser();

      if (action === 'profile') {
        infoPanel.innerHTML = `
          <h2>${infoMessages.profile.title}</h2>
          <div class="profile-info">
            <p><strong>Name:</strong> ${currentUser.name}</p>
            <p><strong>Email:</strong> ${currentUser.email}</p>
            <p><strong>Member since:</strong> ${new Date(currentUser.createdAt).toLocaleDateString()}</p>
            <p><strong>Last login:</strong> ${new Date(currentUser.lastLogin).toLocaleString()}</p>
          </div>
        `;
      } else if (action === 'friends') {
        const friends = userProfile.getFriends(currentUser.email);
        const friendsList = friends.map(friend => {
          return `<li>${friend.name} (ID: ${friend.id}) <button class="remove-friend" data-friend-id="${friend.id}">Remove</button></li>`;
        }).join('');
        infoPanel.innerHTML = `
          <h2>${infoMessages.friends.title}</h2>
          <div class="friends-section">
            <div class="add-friend">
              <input type="text" id="add-friend-id" placeholder="Enter friend's user ID">
              <button id="add-friend-btn">Add Friend</button>
            </div>
            <ul class="friends-list">
              ${friendsList || '<li>No friends yet.</li>'}
            </ul>
          </div>
        `;
        // Add event listeners
        document.getElementById('add-friend-btn').addEventListener('click', () => {
          const id = document.getElementById('add-friend-id').value.trim();
          if (id) {
            userProfile.addFriend(currentUser.email, id);
            showInfo('friends'); // refresh
          }
        });
        document.querySelectorAll('.remove-friend').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const friendId = e.target.dataset.friendId;
            userProfile.removeFriend(currentUser.email, friendId);
            showInfo('friends'); // refresh
          });
        });
      } else if (action === 'notifications') {
        const notifications = userProfile.getNotifications(currentUser.email);
        const notifsList = notifications.map(notif => `
          <li class="${notif.read ? 'read' : 'unread'}" data-id="${notif.id}">
            ${notif.message} <small>${new Date(notif.timestamp).toLocaleString()}</small>
            ${!notif.read ? '<button class="mark-read">Mark Read</button>' : ''}
          </li>
        `).join('');
        infoPanel.innerHTML = `
          <h2>${infoMessages.notifications.title}</h2>
          <ul class="notifications-list">
            ${notifsList || '<li>No notifications.</li>'}
          </ul>
        `;
        // Mark as read
        document.querySelectorAll('.mark-read').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const id = e.target.closest('li').dataset.id;
            userProfile.markNotificationRead(currentUser.email, id);
            updateBadges();
            showInfo('notifications'); // refresh
          });
        });
      } else if (action === 'chat') {
        const friends = userProfile.getFriends(currentUser.email);
        const friendsList = friends.map(friendEmail => {
          const friend = userProfile.users[friendEmail];
          return `<li><button class="chat-with-friend" data-friend="${friendEmail}">${friend.name}</button></li>`;
        }).join('');
        infoPanel.innerHTML = `
          <h2>${infoMessages.chat.title}</h2>
          <div class="chat-section">
            <div class="friends-chat-list">
              <h3>Your Friends:</h3>
              <ul>
                ${friendsList || '<li>No friends to chat with.</li>'}
              </ul>
            </div>
            <div id="chat-window" class="chat-window" style="display: none;">
              <h3 id="chat-with"></h3>
              <div id="messages" class="messages"></div>
              <div class="message-input">
                <input type="text" id="message-input" placeholder="Type a message...">
                <button id="send-message">Send</button>
              </div>
            </div>
          </div>
        `;
        // Chat functionality
        let currentChatFriend = null;
        document.querySelectorAll('.chat-with-friend').forEach(btn => {
          btn.addEventListener('click', (e) => {
            document.querySelectorAll('.chat-with-friend').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const friendEmail = e.target.dataset.friend;
            const friend = userProfile.users[friendEmail];
            currentChatFriend = friendEmail;
            document.getElementById('chat-with').textContent = `Chatting with ${friend.name}`;
            document.getElementById('chat-window').style.display = 'block';
            loadMessages(friendEmail);
          });
        });
        const loadMessages = (friendEmail) => {
          const messages = userProfile.getMessages(currentUser.email, friendEmail);
          const messagesHtml = messages.map(msg => `
            <div class="message ${msg.from === currentUser.email ? 'sent' : 'received'}">
              <strong>${msg.from === currentUser.email ? 'You' : userProfile.users[msg.from].name}:</strong> ${msg.message}
              <small>${new Date(msg.timestamp).toLocaleTimeString()}</small>
            </div>
          `).join('');
          document.getElementById('messages').innerHTML = messagesHtml;
          document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
        };
        document.getElementById('send-message').addEventListener('click', () => {
          const message = document.getElementById('message-input').value.trim();
          if (message && currentChatFriend) {
            userProfile.sendMessage(currentUser.email, currentChatFriend, message);
            document.getElementById('message-input').value = '';
            loadMessages(currentChatFriend);
            updateBadges();
          }
        });
      } else if (action === 'settings') {
        infoPanel.innerHTML = `
          <h2>${infoMessages.settings.title}</h2>
          <p>${infoMessages.settings.text}</p>
          <button id="logout-button" class="logout-button">Logout</button>
        `;
        // Add event listener for the logout button
        document.getElementById('logout-button').addEventListener('click', () => {
          if (confirm('Are you sure you want to logout? You will need to login again next time.')) {
            userProfile.logout();
            location.reload();
          }
        });
      } else if (action === 'logout') {
        if (confirm('Are you sure you want to logout? You will need to login again next time.')) {
          userProfile.logout();
          location.reload(); 
        }
        return;
      } else {
        const info = infoMessages[action];
        infoPanel.innerHTML = `
          <h2>${info.title}</h2>
          <p>${info.text}</p>
        `;
      }
    };

    sidebarItems.forEach((item) => {
      item.addEventListener('click', () => {
        const action = item.dataset.action;
        showInfo(action);
      });
    });
  }
});
