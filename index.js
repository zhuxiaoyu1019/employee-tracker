const inquirer = require('inquirer');
const mysql = require('mysql');
const figlet = require('figlet');
const { table } = require('table');
require('console.table');
const Employees = require('./empolyees');

// ascii
let config,
    data,
    output;
data = [
    [figlet.textSync("Employee")],
    [figlet.textSync("Manager")]
];
config = {
    singleLine: true
};
output = table(data, config);
console.log(output);

// create the connection information for the sql database
let connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: "password",
    database: "employeeTracker_DB"
});

// connect to the mysql server and sql database
connection.connect((err) => {
    if (err) throw err;
    start();
});

// prompts the user for what action they should take
const start = () => {
    inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "What would you like to do?",
            choices: ["View All Employees", "View All Employees By Department", "View All Employees By Manager", "View Utilized Budget By Department", "Add Employee", "Remove Employee", "Update Employee Role", "Update Employee Manager", "View All Roles", "Add Role", "Remove Role", "View All Departments", "Add Department", "Remove Department", "Quit"]
        }
    ]).then(({ action }) => {
        switch (action) {
            case "View All Employees":
                allEmpolyee();
                break;
            case "View All Employees By Department":
                byDeparment();
                break;
            case "View All Employees By Manager":
                byManager();
                break;
            case "View Utilized Budget By Department":
                budget();
                break;
            case "Add Employee":
                addEmployee();
                break;
            case "Remove Employee":
                removeEmployee();
                break;
            case "Update Employee Role":
                updateEmployeeRole();
                break;
            case "Update Employee Manager":
                updateEmployeeManager();
                break;
            case "View All Roles":
                allRoles();
                break;
            case "Add Role":
                addRole();
                break;
            case "Remove Role":
                removeRole();
                break;
            case "View All Departments":
                allDepartments();
                break;
            case "Add Department":
                addDepartment();
                break;
            case "Remove Department":
                removeDepartment();
                break;
            default:
                console.log("Thanks for using employee tracker.")
                connection.end();
                break;
        }
    });
}

// display table that have all the employees
const allEmpolyee = () => {
    const allEmpolyees = new Employees();
    allEmpolyees.employeesTable(connection, start);
}

// view all employees by department
const byDeparment = () => {
    connection.query(
        `SELECT * FROM department`,
        (err, data) => {
            if (err) throw err;
            const departments = inquirerObj(data);
            inquirer.prompt([
                {
                    type: "list",
                    name: "department",
                    message: "Which department would you like to see employee for?",
                    choices: departments
                }
            ]).then(({ department }) => {
                connection.query(
                    `SELECT employee.id, employee.first_name, employee.last_name, role.title FROM employee 
                    JOIN role ON employee.role_id = role.id
                    JOIN department ON role.department_id = department.id
                    WHERE department.name = ?`, [department.name],
                    (err, data) => {
                        if (err) throw err;
                        console.table(data);
                        start();
                    }
                );
            });
        }
    );
}

// view all employees by manager
const byManager = () => {
    connection.query(
        `SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee
        WHERE manager_id IS NULL`,
        (err, data) => {
            if (err) throw err;
            const managers = inquirerObj(data);
            inquirer.prompt([
                {
                    type: "list",
                    name: "manager",
                    message: "Which manager would you like to see employee for?",
                    choices: managers
                }
            ]).then(({ manager }) => {
                connection.query(
                    `SELECT employee.id, CONCAT(employee.first_name, " ", employee.last_name) AS name, role.title AS role FROM employee
                    JOIN role ON employee.role_id = role.id
                    WHERE employee.manager_id = ?`, [manager.id],
                    (err, employee) => {
                        if (err) throw err;
                        console.table(employee);
                        start();
                    }
                );
            });
        }
    );
}

// view departmental budget
const budget = () => {
    connection.query(
        `SELECT id, name FROM department`,
        (err, data) => {
            if (err) throw err;
            const departments = inquirerObj(data);
            inquirer.prompt([
                {
                    type: "list",
                    name: "department",
                    message: "Which department would you like to see budget for?",
                    choices: departments
                }
            ]).then(({ department }) => {
                connection.query(
                    `SELECT department.id, role.salary FROM employee 
                    JOIN role ON employee.role_id = role.id
                    JOIN department ON role.department_id = department.id
                    WHERE department.id = ?`, [department.id],
                    (err, salaries) => {
                        if (err) throw err;
                        let totalBudget = 0;
                        salaries.forEach(salary => {
                            totalBudget += salary.salary;
                        });
                        console.log(`The total utilized budget of ${department.name} department is $${totalBudget}.`);
                        start();
                    }
                )
            });
        }
    );
}

// add new employee
const addEmployee = () => {
    connection.query(
        `SELECT *, title AS name FROM role`,
        (err, data) => {
            if (err) throw err;
            const roles = inquirerObj(data);
            inquirer.prompt([
                {
                    type: "input",
                    name: "firstName",
                    message: "What is the employee's first name?"
                },
                {
                    type: "input",
                    name: "lastName",
                    message: "What is the employee's last name?"
                },
                {
                    type: "list",
                    name: "role",
                    message: "What is the employee's role?",
                    choices: roles
                }
            ]).then(({ firstName, lastName, role }) => {
                connection.query(
                    `SELECT name FROM department 
                    WHERE id = ?`, [role.department_id],
                    (err, department) => {
                        if (err) throw err;
                        connection.query(
                            `SELECT employee.id, CONCAT(employee.first_name, " ", employee.last_name) AS name FROM employee 
                            JOIN role ON employee.role_id = role.id
                            LEFT JOIN employee manager ON employee.manager_id = manager.id
                            JOIN department ON role.department_id = department.id
                            WHERE department.name = ? AND manager.id IS NULL`, [department[0].name],
                            (err, data) => {
                                if (err) throw err;
                                const managers = inquirerObj(data);
                                managers.push(
                                    {
                                        name: "None",
                                        value: { id: null }
                                    }
                                );
                                inquirer.prompt([
                                    {
                                        type: "list",
                                        name: "manager",
                                        message: "Who is the employee's manager?",
                                        choices: managers
                                    }
                                ]).then(({ manager }) => {
                                    connection.query(
                                        `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                        VALUES (?, ?, ?, ?)`, [firstName, lastName, role.id, manager.id],
                                        err => {
                                            if (err) throw err;
                                            console.log("New employee added.")
                                            start();
                                        }
                                    );
                                });
                            }
                        );
                    }
                );
            });
        }
    );
}

// remove employee
const removeEmployee = () => {
    const empolyees = new Employees();
    empolyees.employeesList(connection, data => {
        const allEmpolyees = inquirerObj(data);
        inquirer.prompt([
            {
                type: "list",
                name: "fire",
                message: "Which employee do you want to remove?",
                choices: allEmpolyees
            }
        ]).then(({ fire }) => {
            connection.query(
                `UPDATE employee SET manager_id = ? WHERE manager_id = ?`, [null, fire.id],
                err => {
                    if (err) throw err;
                    connection.query(
                        `DELETE FROM employee WHERE id = ?`, [fire.id],
                        err => {
                            if (err) throw err;
                            console.log(`${fire.name} has been fired.`)
                            start();
                        }
                    );
                }
            );
        });

    });
}

// change employee's role
const updateEmployeeRole = () => {
    const empolyees = new Employees();
    empolyees.employeesList(connection, data => {
        const allEmpolyees = inquirerObj(data);
        inquirer.prompt([
            {
                type: "list",
                name: "promote",
                message: "Which employee's role do you want to update?",
                choices: allEmpolyees
            }
        ]).then(({ promote }) => {
            connection.query(
                `SELECT department_id FROM role
                WHERE id = ?`, [promote.role_id],
                (err, department) => {
                    if (err) throw err;
                    connection.query(
                        `SELECT id, title AS name FROM role
                            WHERE department_id = ?`, [department[0].department_id],
                        (err, roles) => {
                            if (err) throw err;
                            const roleList = inquirerObj(roles);
                            inquirer.prompt([
                                {
                                    type: "list",
                                    name: "role",
                                    message: "Which role do you want to assign the selected employee?",
                                    choices: roleList
                                }
                            ]).then(({ role }) => {
                                connection.query(
                                    `UPDATE employee SET role_id = ? WHERE id = ?`, [role.id, promote.id],
                                    err => {
                                        if (err) throw err;
                                        console.log(`${promote.name}'s role has been updated to ${role.name}.`)
                                        start();
                                    }
                                );
                            });
                        }
                    );
                }
            );
        });
    });
}

// change employee's manager
const updateEmployeeManager = () => {
    const empolyees = new Employees();
    empolyees.employeesList(connection, data => {
        const allEmpolyees = inquirerObj(data);
        inquirer.prompt([
            {
                type: "list",
                name: "employee",
                message: "Which employee's manager do you want to update?",
                choices: allEmpolyees
            }
        ]).then(({ employee }) => {
            connection.query(
                `SELECT department_id FROM role
                    WHERE id = ?`, [employee.role_id],
                (err, department) => {
                    if (err) throw err;
                    connection.query(
                        `SELECT employee.id, CONCAT(employee.first_name, " ", employee.last_name) AS name FROM employee
                            JOIN role ON employee.role_id = role.id
                            LEFT JOIN employee manager ON employee.manager_id = manager.id
                            JOIN department ON role.department_id = department.id
                            WHERE department.id = ? AND manager.id IS NULL`, [department[0].department_id],
                        (err, managers) => {
                            if (err) throw err;
                            const managerArr = inquirerObj(managers);
                            managerArr.push({ name: "None", value: { id: null } });
                            inquirer.prompt([
                                {
                                    type: "list",
                                    name: "newManager",
                                    message: `Who is ${employee.name}'s new manager?`,
                                    choices: managerArr
                                }
                            ]).then(({ newManager }) => {
                                connection.query(
                                    `UPDATE employee SET manager_id = ? WHERE id = ?`, [newManager.id, employee.id],
                                    err => {
                                        if (err) throw err;
                                        console.log(`${employee.name}'s manager has been updated.`);
                                        start();
                                    }
                                );
                            });
                        }
                    );
                }
            );
        });
    });
}

// view all roles
const allRoles = () => {
    connection.query(
        `SELECT title FROM role`,
        (err, roles) => {
            if (err) throw err;
            console.table(roles);
            start();
        }
    );
}

// add new role
const addRole = () => {
    connection.query(
        `SELECT id, name FROM department`,
        (err, departments) => {
            if (err) throw err;
            const departmentArr = inquirerObj(departments);
            inquirer.prompt([
                {
                    type: "input",
                    name: "newRole",
                    message: "What is the new Role?"
                },
                {
                    type: "number",
                    name: "salary",
                    message: "What is the salary?"
                },
                {
                    type: "list",
                    name: "department",
                    message: "Which department does it belong to?",
                    choices: departmentArr
                }
            ]).then(({ newRole, salary, department }) => {
                connection.query(
                    `INSERT INTO role (title, salary, department_id)
                    VALUES (?, ?, ?)`, [newRole, salary, department.id],
                    err => {
                        if (err) throw err;
                        console.log(`${newRole} has been added under ${department.name} department.`)
                        start();
                    }
                );
            });
        }
    );
}

// remove role
const removeRole = () => {
    connection.query(
        `SELECT id, title AS name FROM role`,
        (err, data) => {
            if (err) throw err;
            const allRoles = inquirerObj(data)
            inquirer.prompt([
                {
                    type: "list",
                    name: "remove",
                    message: "Which role do you want to remove?",
                    choices: allRoles
                }
            ]).then(({ remove }) => {
                connection.query(
                    `UPDATE employee SET role_id = ? WHERE role_id = ?`, [null, remove.id],
                    err => {
                        if (err) throw err;
                        connection.query(
                            `DELETE FROM role WHERE ?`, [{ id: remove.id }],
                            err => {
                                if (err) throw err
                                console.log(`${remove.name} has been deleted.`)
                                start();
                            }
                        );
                    }
                );
            });
        }
    );
}

// view all departments
const allDepartments = () => {
    connection.query(
        `SELECT name as department FROM department`,
        (err, departments) => {
            if (err) throw err;
            console.table(departments);
            start();
        }
    );
}

// add new department
const addDepartment = () => {
    inquirer.prompt([
        {
            type: "input",
            name: "newDepartment",
            message: "What is the new department?"
        }
    ]).then(({ newDepartment }) => {
        connection.query(
            `INSERT INTO department (name)
            VALUES (?)`, [newDepartment],
            err => {
                if (err) throw err;
                console.log(`${newDepartment} department has been added.`)
                start();
            }
        );
    });
}

// remove department
const removeDepartment = () => {
    connection.query(
        `SELECT id, name FROM department`,
        (err, data) => {
            if (err) throw err;
            const allDepartments = inquirerObj(data)
            inquirer.prompt([
                {
                    type: "list",
                    name: "remove",
                    message: "Which department do you want to remove?",
                    choices: allDepartments
                }
            ]).then(({ remove }) => {
                connection.query(
                    `UPDATE role SET department_id = ? WHERE department_id = ?`, [null, remove.id],
                    err => {
                        if (err) throw err;
                        connection.query(
                            `DELETE FROM department WHERE id = ?`, [remove.id],
                            err => {
                                if (err) throw err
                                console.log(`${remove.name} department has been deleted.`)
                                start();
                            }
                        );
                    }
                );
            });
        }
    );
}

// parse data into object format with name and value as key pair for inquirer to read
const inquirerObj = arr => {
    return arr.map(item => {
        return {
            name: item.name,
            value: item
        }
    });
}