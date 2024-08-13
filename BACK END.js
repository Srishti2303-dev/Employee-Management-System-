const http = require('http');
const url = require('url');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');
const dataFilePath = path.join(__dirname, 'employees.txt');
const usersFilePath = path.join(__dirname, 'users.txt');

// Load users from text file
function loadUsers() {
    if (fs.existsSync(usersFilePath)) {
        const data = fs.readFileSync(usersFilePath, 'utf-8');
        return data.trim().split('\n').map(line => {
            const [username, password] = line.split('|');
            return { username, password };
        });
    }
    return [];
}
// Save users to text file
function saveUsers(users) {
    const data = users.map(user => `${user.username}|${user.password}`).join('\n');
    fs.writeFileSync(usersFilePath, data, 'utf-8');
}


// Load employees from text file
function loadEmployees() {
    if (fs.existsSync(dataFilePath)) {
        const data = fs.readFileSync(dataFilePath, 'utf-8');
        return data.trim().split('\n').map(line => {
            const [id, name, role, salary] = line.split('|');
            return { id: parseInt(id), name, role, salary: parseInt(salary) };
        });
    }
    return [];
}

// Save employees to text file
function saveEmployees(employees) {
    const data = employees.map(emp => `${emp.id}|${emp.name}|${emp.role}|${emp.salary}`).join('\n');
    fs.writeFileSync(dataFilePath, data, 'utf-8');
}


let employees = loadEmployees();
let users = loadUsers();

// Simple session management
let session = {};

function displayLogin(req, res) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #23242a;
        }

        .container {
            position: relative;
            width: 380px;
            height: 420px;
            background: #1c1c1c;
            border-radius: 8px;
            overflow: hidden;
            animation: neon-animation 6s linear infinite;
        }

        .container::before, .container::after {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 380px;
            height: 420px;
            background: linear-gradient(0deg, blue, red,green, #45f3ff, #45f3ff);
            z-index: 1;
            transform-origin: bottom right;
            animation: animate 6s linear infinite;
        }

        .container::after {
            animation-delay: -3s;
        }

        .borderLine {
            position: absolute;
            top: 0;
            inset: 0;
        }

        .borderLine::before, .borderLine::after {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 380px;
            height: 420px;
            background: linear-gradient(0deg, transparent, transparent, red, #ff2770, #ff2770);
            z-index: 1;
            transform-origin: bottom right;
            animation: animate 6s linear infinite;
        }

        .borderLine::after {
            animation-delay: -4.5s;
        }

        @keyframes neon-animation {
  0% {
    text-shadow: 0 0 5px #ff0000, 0 0 10px #ff0000, 0 0 20px #ff0000, 0 0 30px #ff0000, 0 0 40px #ff0000, 0 0 50px #ff0000, 0 0 60px #ff0000;
    color: #ff0000;
  }
  50% {
    text-shadow: 0 0 10px #ff0000, 0 0 20px #ff0000, 0 0 30px #ff0000, 0 0 40px #ff0000, 0 0 50px #ff0000, 0 0 60px #ff0000, 0 0 70px #ff0000;
    color: #ff0000;
  }
  100% {
    text-shadow: 0 0 5px #ff0000, 0 0 10px #ff0000, 0 0 20px #ff0000, 0 0 30px #ff0000, 0 0 40px #ff0000, 0 0 50px #ff0000, 0 0 60px #ff0000;
    color: #ff0000;
  }
}

.neon-text {
  animation: neon-animation 6s linear infinite;
}


        @keyframes animate {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }

        .container form {
            position: absolute;
            inset: 4px;
            background: #222;
            padding: 50px 40px;
            border-radius: 8px;
            z-index: 2;
            display: flex;
            flex-direction: column;
        }

        .container form h2 {
            color: #fff;
            font-weight: 500;
            text-align: center;
            letter-spacing: 0.1em;
        }

        .container form .inputBox {
            position: relative;
            width: 300px;
            margin-top: 35px;
        }

        .container form .inputBox input {
            position: relative;
            width: 100%;
            padding: 20px 10px 10px;
            background: transparent;
            outline: none;
            border: none;
            box-shadow: none;
            color: #23242a;
            font-size: 1em;
            letter-spacing: 0.05em;
            transition: 0.5s;
            z-index: 10;
            opacity: 0;
            transform: translateY(100px);
        }

        .container:hover .inputBox input {
            opacity: 1;
            transform: translateY(0);
        }

        .container form .inputBox span {
            position: absolute;
            left: 0;
            padding: 20px 0px 10px;
            pointer-events: none;
            color: #8f8f8f;
            font-size: 1em;
            letter-spacing: 0.05em;
            transition: 0.5s;
        }

        .container form .inputBox input:valid ~ span {
            color: #fff;
            font-size: 0.75em;
            transform: translateY(-34px);
        }

        .container form .inputBox i {
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 2px;
            background: #fff;
            border-radius: 4px;
            overflow: hidden;
            transition: 0.5s;
            pointer-events: none;
        }

        .container form .inputBox input:valid ~ i,
        .container form .inputBox input:focus ~ i {
            height: 44px;   
        }

        .container form .links {
            display: flex;
            justify-content: space-between;
        }

        .container form .links a {
            margin: 10px 0;
            font-size: 0.75em;
            color: #8f8f8f;
            text-decoration: none;
        }

        .container form .links a:hover,
        .container form .links a:nth-child(2) {
            color: #fff;
        }

        .container form input[type="submit"] {
            border: none;
            outline: none;
            padding: none;
            background: #fff;
            cursor: pointer;
            font-size: 0.9em;
            border-radius: 4px;
            font-weight: 600;
            width: 100px;
            margin-top: 10px;
        }

        .container form input[type="submit"]:active {
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Login</h1>
        <form method="POST" action="/login">
            <div class="inputBox">
                <input type="text" name="username" id="username" required>
                <span>Username</span>
                <i></i>
            </div>
            <div class="inputBox">
                <input type="password" name="password" id="password" required>
                <span>Password</span>
                <i></i>
            </div>
            <input type="submit" value="Login">
            <div class="links">
                <a href="/signup">Sign Up</a>
            </div>
        </form>
    </div>
</body>
</html>


    `;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
}

function displaySignup(req, res) {
    const html = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign Up</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #23242a;
        }

        .container {
            position: relative;
            width: 380px;
            height: 420px;
            background: red;
            border-radius: 8px;
            overflow: hidden;
            animation: neon-animation 6s linear infinite;
        }

        .container::before, .container::after {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 380px;
            height: 420px;
            background: linear-gradient(0deg, green, blue, red, #45f3ff, #45f3ff);
            z-index: 1;
            transform-origin: bottom right;
            animation: animate 6s linear infinite;
        }

        .container::after {
            animation-delay: -3s;
        }

        .borderLine {
            position: absolute;
            top: 0;
            inset: 0;
        }

        .borderLine::before, .borderLine::after {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 380px;
            height: 420px;
            background: linear-gradient(0deg, green, blue, red, #ff2770, #ff2770);
            z-index: 1;
            transform-origin: bottom right;
            animation: animate 6s linear infinite;
        }

        .borderLine::after {
            animation-delay: -4.5s;
        }

        @keyframes neon-animation {
            0% {
                box-shadow: 0 0 10px #3498db;
            }
            25% {
                box-shadow: 0 -10px 20px #3498db, 10px 0 20px #8e44ad;
            }
            50% {
                box-shadow: 10px 0 20px #8e44ad, 0 10px 20px #3498db;
            }
            75% {
                box-shadow: 0 10px 20px #3498db, -10px 0 20px #8e44ad;
            }
            100% {
                box-shadow: -10px 0 20px #8e44ad, 0 -10px 20px #3498db;
            }
        }

        @keyframes animate {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }

        .container form {
            position: absolute;
            inset: 4px;
            background: #222;
            padding: 50px 40px;
            border-radius: 8px;
            z-index: 2;
            display: flex;
            flex-direction: column;
        }

        .container form h1 {
            color: #fff;
            font-weight: 500;
            text-align: center;
            letter-spacing: 0.1em;
        }

        .container form .inputBox {
            position: relative;
            width: 300px;
            margin-top: 35px;
        }

        .container form .inputBox input {
            position: relative;
            width: 100%;
            padding: 20px 10px 10px;
            background: transparent;
            outline: none;
            border: none;
            box-shadow: none;
            color: #23242a;
            font-size: 1em;
            letter-spacing: 0.05em;
            transition: 0.5s;
            z-index: 10;
            opacity: 0;
            transform: translateY(100px);
        }

        .container:hover .inputBox input {
            opacity: 1;
            transform: translateY(0);
        }

        .container form .inputBox span {
            position: absolute;
            left: 0;
            padding: 20px 0px 10px;
            pointer-events: none;
            color: #8f8f8f;
            font-size: 1em;
            letter-spacing: 0.05em;
            transition: 0.5s;
        }

        .container form .inputBox input:valid ~ span {
            color: #fff;
            font-size: 0.75em;
            transform: translateY(-34px);
        }

        .container form .inputBox i {
            position: absolute;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 2px;
            background: #fff;
            border-radius: 4px;
            overflow: hidden;
            transition: 0.5s;
            pointer-events: none;
        }

        .container form .inputBox input:valid ~ i,
        .container form .inputBox input:focus ~ i {
            height: 44px;   
        }

        .container form .links {
            display: flex;
            justify-content: space-between;
        }

        .container form .links a {
            margin: 10px 0;
            font-size: 0.75em;
            color: #8f8f8f;
            text-decoration: none;
        }

        .container form .links a:hover,
        .container form .links a:nth-child(2) {
            color: #fff;
        }

        .container form input[type="submit"] {
            border: none;
            outline: none;
            padding: none;
            background: #fff;
            cursor: pointer;
            font-size: 0.9em;
            border-radius: 4px;
            font-weight: 600;
            width: 100px;
            margin-top: 10px;
        }

        .container form input[type="submit"]:active {
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Sign Up</h1>
        <form method="POST" action="/signup">
            <div class="inputBox">
                <input type="text" name="username" id="username" required>
                <span>Username</span>
                <i></i>
            </div>
            <div class="inputBox">
                <input type="password" name="password" id="password" required>
                <span>Password</span>
                <i></i>
            </div>
            <input type="submit" value="Sign Up">
            <div class="links">
                <a href="/login">Back to Login</a>
            </div>
        </form>
    </div>
</body>
</html>

    `;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
}

function handleLogin(req, res) {
    parsePostData(req, (postData) => {
        const { username, password } = postData;

        const user = users.find(user => user.username === username && user.password === password);
        if (user) {
            session.isAuthenticated = true;
            res.writeHead(302, { 'Location': '/' });
            res.end();
        } else {
            res.writeHead(401, { 'Content-Type': 'text/html' });
            res.end('<h1>401 Unauthorized</h1><p>Invalid credentials</p>');
        }
    });
}

function handleSignup(req, res) {
    parsePostData(req, (postData) => {
        const { username, password } = postData;

        if (users.some(user => user.username === username)) {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end('<h1>400 Bad Request</h1><p>Username already exists</p>');
            return;
        }

        users.push({ username, password });
        saveUsers(users);
        res.writeHead(302, { 'Location': '/login' });
        res.end();
    });
}

function displayEmployees(req, res) {
    if (!session.isAuthenticated) {
        res.writeHead(302, { 'Location': '/login' });
        res.end();
        return;
    }

    const html = `
    <html>
      <head>
        <title>Employee Salary Management</title>
        <style>
          body { margin: 0; padding: 0; background-color: #f9f9f9; }
          .container { width: 80%; margin: auto; overflow: hidden; }
          header { background: #333; color: #fff; padding: 10px 0; text-align: center; }
          table { width: 100%; margin: 20px 0; border-collapse: collapse; }
          table, th, td { border: 1px solid #ddd; }
          th, td { padding: 8px; text-align: left; }
          th { background-color: #333; color: white; }
          a { display: inline-block; margin: 10px 0; padding: 10px 20px; background: #4CAF50; color: #fff; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <header>
          <h1>Employee Salary Management</h1>
        </header>
        <div class="container">
          <h1>Employee List</h1>
          <table>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Salary</th>
            </tr>
            ${employees.map((employee) => `
              <tr>
                <td>${employee.id}</td>
                <td>${employee.name}</td>
                <td>${employee.role}</td>
                <td>${employee.salary}</td>
              </tr>
            `).join('')}
          </table>
          <a href="/add">Add Employee</a>
          <a href="/update">Update Employee</a>
          <a href="/delete">Delete Employee</a>
        </div>
      </body>
    </html>
    `;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
}

function displayAddEmployee(req, res) {
    const html = `
    <html>
      <head>
        <title>Add Employee</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            background: linear-gradient(120deg, #2ecc71, #27ae60);
            height: 100vh; 
            display: flex; 
            justify-content: center; 
            align-items: center;
          }
          .container {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .container h1 { text-align: center; }
          .container form { text-align: center; }
          .container input { margin: 10px 0; padding: 10px; width: 100%; }
          .container button {
            background: #2ecc71;
            color: white;
            border: none;
            padding: 10px;
            width: 100%;
            border-radius: 5px;
            cursor: pointer;
          }
          .container button:hover { background: #2980b9; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Add Employee</h1>
          <form method="POST" action="/add">
            <input type="text" name="name" placeholder="Name" required><br>
            <input type="text" name="role" placeholder="Role" required><br>
            <input type="number" name="salary" placeholder="Salary" required><br>
            <button type="submit">Add Employee</button>
          </form>
        </div>
      </body>
    </html>
    `;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
}

function addEmployee(req, res) {
    parsePostData(req, (postData) => {
        const { name, role, salary } = postData;
        const id = employees.length ? employees[employees.length - 1].id + 1 : 1;
        employees.push({ id, name, role, salary: parseInt(salary) });
        saveEmployees(employees);
        res.writeHead(302, { 'Location': '/' });
        res.end();
    });
}

function displayUpdateEmployee(req, res) {
    const html = `
    <html>
      <head>
        <title>Update Employee</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            background: linear-gradient(120deg, #2ecc71, #27ae60); 
            height: 100vh; 
            display: flex; 
            justify-content: center; 
            align-items: center;
          }
          .container {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .container h1 { text-align: center; }
          .container form { text-align: center; }
          .container input { margin: 10px 0; padding: 10px; width: 100%; }
          .container button {
            background: #2ecc71;
            color: white;
            border: none;
            padding: 10px;
            width: 100%;
            border-radius: 5px;
            cursor: pointer;
          }
          .container button:hover { background: #2980b9; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Update Employee</h1>
          <form method="POST" action="/update">
            <input type="number" name="id" placeholder="Employee ID" required><br>
            <input type="text" name="name" placeholder="Name"><br>
            <input type="text" name="role" placeholder="Role"><br>
            <input type="number" name="salary" placeholder="Salary"><br>
            <button type="submit">Update Employee</button>
          </form>
        </div>
      </body>
    </html>
    `;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
}

function updateEmployee(req, res) {
    parsePostData(req, (postData) => {
        const { id, name, role, salary } = postData;
        const employee = employees.find(emp => emp.id === parseInt(id));
        if (employee) {
            if (name) employee.name = name;
            if (role) employee.role = role;
            if (salary) employee.salary = parseInt(salary);
            saveEmployees(employees);
            res.writeHead(302, { 'Location': '/' });
            res.end();
        } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1><p>Employee not found</p>');
        }
    });
}

function displayDeleteEmployee(req, res) {
    const html = `
    <html>
      <head>
        <title>Delete Employee</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            background: linear-gradient(120deg, #2ecc71, #27ae60);; 
            height: 100vh; 
            display: flex; 
            justify-content: center; 
            align-items: center;
          }
          .container {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .container h1 { text-align: center; }
          .container form { text-align: center; }
          .container input { margin: 10px 0; padding: 10px; width: 100%; }
          .container button {
            background: #2ecc71;
            color: white;
            border: none;
            padding: 10px;
            width: 100%;
            border-radius: 5px;
            cursor: pointer;
          }
          .container button:hover { background: #2980b9; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Delete Employee</h1>
          <form method="POST" action="/delete">
            <input type="number" name="id" placeholder="Employee ID" required><br>
            <button type="submit">Delete Employee</button>
          </form>
        </div>
      </body>
    </html>
    `;
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
}

function deleteEmployee(req, res) {
    parsePostData(req, (postData) => {
        const { id } = postData;
        employees = employees.filter(emp => emp.id !== parseInt(id));
        saveEmployees(employees);
        res.writeHead(302, { 'Location': '/' });
        res.end();
    });
}

function parsePostData(req, callback) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        const postData = querystring.parse(body);
        callback(postData);
    });
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname === '/login' && req.method === 'GET') {
        displayLogin(req, res);
    } else if (pathname === '/login' && req.method === 'POST') {
        handleLogin(req, res);
    } else if (pathname === '/signup' && req.method === 'GET') {
        displaySignup(req, res);
    } else if (pathname === '/signup' && req.method === 'POST') {
        handleSignup(req, res);
    } else if (pathname === '/' && req.method === 'GET') {
        displayEmployees(req, res);
    } else if (pathname === '/add' && req.method === 'GET') {
        displayAddEmployee(req, res);
    } else if (pathname === '/add' && req.method === 'POST') {
        addEmployee(req, res);
    } else if (pathname === '/update' && req.method === 'GET') {
        displayUpdateEmployee(req, res);
    } else if (pathname === '/update' && req.method === 'POST') {
        updateEmployee(req, res);
    } else if (pathname === '/delete' && req.method === 'GET') {
        displayDeleteEmployee(req, res);
    } else if (pathname === '/delete' && req.method === 'POST') {
        deleteEmployee(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>');
    }
});

server.listen(8000, () => {
    console.log('Server is running on http://localhost:8000');
});