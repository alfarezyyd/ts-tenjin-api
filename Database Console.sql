DROP DATABASE IF EXISTS ts_tenjin_api;
CREATE DATABASE ts_tenjin_api;
USE ts_tenjin_api;
SHOW TABLES;
SELECT * FROM categories;
SELECT * FROM tags;
SELECT * FROM mentors;
SELECT * FROM educations;
SELECT * FROM skills;
SELECT * FROM assistants;
SELECT * FROM orders;
SELECT * FROM experiences;
SELECT * FROM experience_resources;
SELECT * FROM tags;
SELECT * FROM languages;
SELECT * FROM orders;
SELECT * FROM users;
INSERT INTO users (uniqueId, name, email, password, telephone, pin, photo_path) VALUE (1, 'test', 'test', 'test', 'test', 'test', 'test')