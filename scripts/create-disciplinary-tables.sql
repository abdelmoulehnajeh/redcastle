-- Disciplinary tables for infractions, absences, retards, tenue de travail
CREATE TABLE IF NOT EXISTS infractions (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS absences (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS retards (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenues_de_travail (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
