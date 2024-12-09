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
SELECT * FROM users WHERE email = 'adityaalfarezyrezy@gmail.com'
SELECT * FROM assistance_resources;
SELECT * FROM assistance_tags;
SELECT * FROM assistance_languages;
SELECT * FROM orders;
UPDATE orders SET order_status = 'CONFIRMED', order_payment_status = 'PAID', order_condition = 'APPROVED' WHERE id = 'dfcf69ed-2663-4fb6-8c9b-c2d80d718c96'
SELECT * FROM experiences;

SELECT * FROM experience_resources;
SELECT * FROM tags;
SELECT * FROM languages;
SELECT * FROM users;
SELECT * FROM one_time_password_tokens;
SELECT * FROM mentors;
SELECT * FROM mentor_addresses;
SELECT * FROM chats;
SELECT * FROM mentor_resources;
DELETE FROM mentor_resources WHERE id = 8;
SELECT * FROM mentor_bank_accounts;
SELECT * FROM reviews;
SELECT * FROM withdraw_requests;
DELETE FROM mentor_bank_accounts;
DELETE FROM mentor_addresses;
DELETE FROM mentors;
DELETE FROM experience_resources;
DELETE FROM experiences WHERE id IN (1,2);
DELETE FROM orders;
DELETE FROM assistance_languages;
DELETE FROM orders;
DELETE FROM assistance_tags;
DELETE FROM assistance_carts;
DELETE FROM assistance_resources;
DELETE FROM assistants;
DELETE FROM orders;
UPDATE users SET is_management = true WHERE id = 2;
UPDATE reviews SET user_id = 1 WHERE id = 1;
INSERT INTO assistance_resources( image_path, video_url, assistance_id) value ('5cbb69b0-73c6-4096-80e7-1ebdf98297b4-Logo Invfestxisf9.0.png', null, 2)
DELETE FROM assistance_resources WHERE id = 3;
UPDATE assistance_resources SET image_path = 'b4b6c91b-7854-48eb-aebd-f9b20e44616c-Logo Invfestxisf9.0.png' WHERE assistance_id = 3