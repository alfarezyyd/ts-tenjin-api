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
SELECT * FROM assistance_resources;
SELECT * FROM assistance_tags;
SELECT * FROM assistance_languages;
SELECT * FROM orders;
SELECT * FROM experiences;
SELECT * FROM users;
UPDATE orders SET order_payment_status = 'PAID' WHERE id = '8f51fff3-3f6e-406c-bd1f-8cb641e5a610';
SELECT * FROM experience_resources;
SELECT * FROM tags;
SELECT * FROM languages;
SELECT * FROM users;
SELECT * FROM one_time_password_tokens;
SELECT * FROM mentors;
SELECT * FROM mentor_addresses;
SELECT * FROM chats;
SELECT * FROM mentor_resources;
SELECT * FROM user_bank_accounts;
SELECT * FROM reviews;
SELECT * FROM withdraw_requests;
DELETE FROM mentor_bank_accounts;
DELETE FROM mentor_addresses;
DELETE FROM mentors;
DELETE FROM experience_resources;
DELETE FROM orders;
DELETE FROM reviews;
DELETE FROM assistance_languages;
DELETE FROM orders;
DELETE FROM assistance_tags;
DELETE FROM assistance_carts;
DELETE FROM assistance_resources;
DELETE FROM assistants;
DELETE FROM orders;
DELETE FROM categories;
DELETE FROM withdraw_requests;

UPDATE users SET total_balance = 100000;