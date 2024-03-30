DROP DATABASE ts_zenith_api;
CREATE DATABASE ts_zenith_api;
USE ts_zenith_api;
SELECT *
FROM users;
UPDATE users
SET name  = 'TEST',
    email = 'test@gmail.com'
WHERE id = 1;

SELECT * FROM addresses;