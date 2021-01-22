# Employee Tracker

![GitHub license](https://img.shields.io/badge/License-MIT-grey.svg)

## Description

This is a command-line application that allows the user to be able to view and manage the departments, roles, and employees in the company so that they can organize and plan for business.

## Table of Contents

- [Usage](#usage)
- [Installation](#installation)
- [Contributing](#contributing)
- [Questions](#questions)
- [License](#license)

## Usage

### Application

![demo](Assets/demo.gif)

- View, add, and delete departments, roles, employees

- Update employee roles

- Update employee managers

- View employees by manager

- View the total utilized budget of a department

### Database Schema

![Database Schema](Assets/schema.png)

- **department**:

  - **id** - INT PRIMARY KEY
  - **name** - VARCHAR(30) to hold department name

- **role**:

  - **id** - INT PRIMARY KEY
  - **title** - VARCHAR(30) to hold role title
  - **salary** - DECIMAL to hold role salary
  - **department_id** - INT to hold reference to department role belongs to

- **employee**:

  - **id** - INT PRIMARY KEY
  - **first_name** - VARCHAR(30) to hold employee first name
  - **last_name** - VARCHAR(30) to hold employee last name
  - **role_id** - INT to hold reference to role employee has
  - **manager_id** - INT to hold reference to another employee that manages the employee being Created. This field may be null if the employee has no manager

## Installation

To install necessary dependencies, run the following command:

      npm i

## Contributing

      folk / pull

## Questions

If you have any questions about the repo, open an issue or contact me directly @[xiaoyz28@uw.edu](xiaoyz28@uw.edu). You can find more of my work at [zhuxiaoyu1019](https://github.com/zhuxiaoyu1019).

## License

Copyright (c) Rita Z All rights reserved.

Licensed under the [MIT](https://choosealicense.com/licenses/mit/) license.
