USE employeeTracker_DB;

INSERT INTO department (name)
VALUES ("Engineering"), ("Finance"), ("Legal"), ("Sales");

INSERT INTO role (title, salary, department_id)
VALUES ("Sales Lead", 100000, 4), ("Salesperson", 80000, 4), ("Software Engineering", 120000, 1);

INSERT INTO employee (first_name, last_name, role_id)
VALUES ("John", "Doe", 1), ("Kevin", "Tupik", 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("Mike", "Chen", 2, 1);

-- select all employees
SELECT employee.id, employee.first_name, employee.last_name, role.title, name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee 
JOIN role ON employee.role_id = role.id
LEFT JOIN employee manager ON employee.manager_id = manager.id
JOIN department ON role.department_id = department.id;

-- select employee by department
SELECT employee.id, employee.first_name, employee.last_name, role.title FROM employee 
JOIN role ON employee.role_id = role.id
JOIN department ON role.department_id = department.id
WHERE department.name = "Sales";

-- select department
SELECT name FROM department 
WHERE id = 1;

-- select departmental managers
SELECT employee.id, CONCAT(employee.first_name, " ", employee.last_name) AS manager FROM employee 
JOIN role ON employee.role_id = role.id
LEFT JOIN employee manager ON employee.manager_id = manager.id
JOIN department ON role.department_id = department.id
WHERE department.name = "Sales" AND manager.id IS NULL;

-- select all employees
SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employee;

-- resolve foreign key constraint and delete employee
UPDATE employee SET manager_id = NULL WHERE manager_id = 1;
DELETE FROM employee WHERE id = 1;