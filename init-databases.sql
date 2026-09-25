-- ============================================
-- UrbanGlide - Database Initialization Script
-- ============================================
-- This script creates separate databases for each microservice
-- demonstrating the Database-per-Service pattern.
--
-- For local development with H2, databases are in-memory.
-- For production with MySQL, run this script first:

-- Create databases
CREATE DATABASE IF NOT EXISTS urban_auth_db;
CREATE DATABASE IF NOT EXISTS urban_ride_db;
CREATE DATABASE IF NOT EXISTS urban_driver_db;
CREATE DATABASE IF NOT EXISTS urban_payment_db;

-- Grant permissions (for MySQL deployment)
GRANT ALL PRIVILEGES ON urban_auth_db.* TO 'urbanglide'@'%';
GRANT ALL PRIVILEGES ON urban_ride_db.* TO 'urbanglide'@'%';
GRANT ALL PRIVILEGES ON urban_driver_db.* TO 'urbanglide'@'%';
GRANT ALL PRIVILEGES ON urban_payment_db.* TO 'urbanglide'@'%';
FLUSH PRIVILEGES;
