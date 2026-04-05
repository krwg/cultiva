/* ============================================
   AUTH MODULE 
   ============================================ */

const USERS_DB_KEY = 'cultiva-users';
const SESSION_KEY = 'cultiva-session';

export const auth = {
  
  async hash(text) {
    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  async register(email, password) {
    const users = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '{}');
    
    if (users[email]) {
      throw new Error('User already exists');
    }

    const hashedPass = await this.hash(password);
    
    users[email] = {
      email,
      password: hashedPass,
      createdAt: new Date().toISOString(),
      avatar: null
    };

    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    
    return this.login(email, password);
  },

  async login(email, password) {
    const users = JSON.parse(localStorage.getItem(USERS_DB_KEY) || '{}');
    const user = users[email];

    if (!user) throw new Error('User not found');

    const hashedPass = await this.hash(password);
    if (user.password !== hashedPass) {
      throw new Error('Incorrect password');
    }

    const session = { email: user.email, isLoggedIn: true, loginAt: new Date().toISOString() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    
    return session;
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
// In the future, we'll add clearing of garden data from memory,
// but not from localStorage, so that it loads when you log in again.
  },

  isAuthenticated() {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    return session ? session.isLoggedIn : false;
  },

  getCurrentUser() {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    return session ? session.email : null;
  }
};