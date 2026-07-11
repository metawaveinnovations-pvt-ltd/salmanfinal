-- Pro Care Homes Database Schema
-- Production Ready for Hostinger Premium Shared Hosting MySQL

-- Disable foreign key checks temporarily during setup
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- Table structure for table `referrals`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `referrals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `commissioner_name` VARCHAR(255) NOT NULL,
  `authority` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `service_user_name` VARCHAR(255) NOT NULL,
  `dob` DATE NOT NULL,
  `diagnosis` VARCHAR(255) NOT NULL,
  `funding_status` VARCHAR(255) NOT NULL,
  `risk_details` TEXT DEFAULT NULL,
  `required_ratios` VARCHAR(255) NOT NULL,
  `authority_type` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Performance and Lookup Indexes
  INDEX `idx_email` (`email`),
  INDEX `idx_commissioner` (`commissioner_name`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `inquiries`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `inquiries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `relation` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Performance and Lookup Indexes
  INDEX `idx_inq_email` (`email`),
  INDEX `idx_inq_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `careers`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `careers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `position` VARCHAR(255) NOT NULL,
  `has_dbs` VARCHAR(10) NOT NULL,
  `experience` TEXT DEFAULT NULL,
  `statement` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Performance and Lookup Indexes
  INDEX `idx_car_email` (`email`),
  INDEX `idx_car_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `commissioner_referrals`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `commissioner_referrals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `commissioner_name` VARCHAR(255) NOT NULL,
  `authority` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `service_user_name` VARCHAR(255) NOT NULL,
  `dob` DATE NOT NULL,
  `diagnosis` VARCHAR(255) NOT NULL,
  `funding_status` VARCHAR(255) NOT NULL,
  `risk_details` TEXT DEFAULT NULL,
  `required_ratios` VARCHAR(255) NOT NULL,
  `authority_type` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Performance and Lookup Indexes
  INDEX `idx_comm_email` (`email`),
  INDEX `idx_comm_name` (`commissioner_name`),
  INDEX `idx_comm_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
