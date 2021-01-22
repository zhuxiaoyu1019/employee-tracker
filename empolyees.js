class Employees {
    employeesTable(connection, start) {
        connection.query(
            `SELECT employee.id, employee.first_name, employee.last_name, role.title, name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager 
            FROM employee 
            JOIN role ON employee.role_id = role.id 
            LEFT JOIN employee manager ON employee.manager_id = manager.id JOIN department ON role.department_id = department.id`,
            (err, data) => {
                if (err) throw err;
                console.table(data);
                start();
            }
        );
    }

    employeesList(connection, cb) {
        connection.query(
            `SELECT employee.id AS id, CONCAT(employee.first_name, " ", employee.last_name) AS name, employee.first_name, employee.last_name, role.title, role.id AS role_id, name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager 
            FROM employee 
            JOIN role ON employee.role_id = role.id 
            LEFT JOIN employee manager ON employee.manager_id = manager.id JOIN department ON role.department_id = department.id`,
            (err, data) => {
                if (err) throw err;
                return cb(data)
            }
        );
    }
}

module.exports = Employees;