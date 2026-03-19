-- MySQL dump 10.13  Distrib 5.7.44, for osx11.0 (x86_64)
--
-- Host: localhost    Database: kompi_cyber
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `certificates`
--

DROP TABLE IF EXISTS `certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `certificates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_id` int NOT NULL,
  `certificate_code` char(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `issued_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `pdf_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_certificates_code` (`certificate_code`),
  UNIQUE KEY `uq_certificates_user_course` (`user_id`,`course_id`),
  KEY `idx_certificates_course_id` (`course_id`),
  CONSTRAINT `fk_certificates_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  CONSTRAINT `fk_certificates_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificates`
--

LOCK TABLES `certificates` WRITE;
/*!40000 ALTER TABLE `certificates` DISABLE KEYS */;
INSERT INTO `certificates` VALUES (1,'cd54a7ce-1b95-11f1-a2a0-853fa890d88b',1,'CYBER-2026-A1B2','2026-03-05 12:00:00','/certs/CYBER-2026-A1B2.pdf');
/*!40000 ALTER TABLE `certificates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `domain_id` int NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `level` enum('beginner','intermediate','advanced') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'beginner',
  `duration_hrs` smallint NOT NULL DEFAULT '0',
  `is_published` tinyint(1) NOT NULL DEFAULT '0',
  `created_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_courses_domain_id` (`domain_id`),
  KEY `idx_courses_created_by` (`created_by`),
  CONSTRAINT `fk_courses_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_courses_domain` FOREIGN KEY (`domain_id`) REFERENCES `domains` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,1,'Introduction to Cybersecurity','Starter course on threats, CIA triad, and cyber hygiene.','beginner',12,1,'cd54602a-1b95-11f1-a2a0-853fa890d88b','2026-03-09 08:56:03','2026-03-09 08:56:03'),(2,2,'Ethical Hacking Essentials','Introductory ethical hacking methodology and tooling.','intermediate',20,1,'cd54602a-1b95-11f1-a2a0-853fa890d88b','2026-03-09 08:56:03','2026-03-09 08:56:03'),(3,1,'Network Security Basics','Learn how to secure networks and detect intrusions.','beginner',15,1,'cd54602a-1b95-11f1-a2a0-853fa890d88b','2026-03-12 03:13:33','2026-03-12 03:13:33'),(4,2,'Web Application Security','Introduction to web app vulnerabilities and OWASP top 10.','intermediate',18,1,'cd54602a-1b95-11f1-a2a0-853fa890d88b','2026-03-12 03:13:33','2026-03-12 03:13:33'),(5,1,'Incident Response & Forensics','Handle security incidents and perform digital forensics.','advanced',25,1,'cd54602a-1b95-11f1-a2a0-853fa890d88b','2026-03-12 03:13:33','2026-03-12 03:13:33');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `domains`
--

DROP TABLE IF EXISTS `domains`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `domains` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_domains_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `domains`
--

LOCK TABLES `domains` WRITE;
/*!40000 ALTER TABLE `domains` DISABLE KEYS */;
INSERT INTO `domains` VALUES (1,'Cybersecurity Fundamentals','Core security concepts for beginners.'),(2,'Ethical Hacking','Offensive security basics and safe lab practice.');
/*!40000 ALTER TABLE `domains` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `enrollments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_id` int NOT NULL,
  `enrolled_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_enrollments_user_course` (`user_id`,`course_id`),
  KEY `idx_enrollments_course_id` (`course_id`),
  CONSTRAINT `fk_enrollments_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`),
  CONSTRAINT `fk_enrollments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollments`
--

LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
INSERT INTO `enrollments` VALUES (1,'cd54a7ce-1b95-11f1-a2a0-853fa890d88b',1,'2026-03-01 09:00:00'),(2,'cd54ee00-1b95-11f1-a2a0-853fa890d88b',1,'2026-03-01 09:30:00'),(3,'cd54a7ce-1b95-11f1-a2a0-853fa890d88b',2,'2026-03-02 10:00:00'),(4,'cd54a7ce-1b95-11f1-a2a0-853fa890d88b',3,'2026-03-06 02:00:00'),(5,'cd54ee00-1b95-11f1-a2a0-853fa890d88b',4,'2026-03-06 02:30:00'),(6,'cd54a7ce-1b95-11f1-a2a0-853fa890d88b',5,'2026-03-07 03:00:00');
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exercise_submissions`
--

DROP TABLE IF EXISTS `exercise_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exercise_submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exercise_id` int NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `stdout` text COLLATE utf8mb4_unicode_ci,
  `stderr` text COLLATE utf8mb4_unicode_ci,
  `execution_time_ms` int DEFAULT NULL,
  `memory_used_mb` smallint DEFAULT NULL,
  `passed` tinyint(1) NOT NULL DEFAULT '0',
  `score` tinyint NOT NULL DEFAULT '0',
  `submitted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ex_sub_user_id` (`user_id`),
  KEY `idx_ex_sub_exercise_id` (`exercise_id`),
  KEY `idx_ex_sub_submitted_at` (`submitted_at`),
  CONSTRAINT `fk_ex_sub_exercise` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`),
  CONSTRAINT `fk_ex_sub_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exercise_submissions`
--

LOCK TABLES `exercise_submissions` WRITE;
/*!40000 ALTER TABLE `exercise_submissions` DISABLE KEYS */;
INSERT INTO `exercise_submissions` VALUES (1,1,'cd54a7ce-1b95-11f1-a2a0-853fa890d88b','def classify_password(pw):\n    return \"strong\" if len(pw) >= 12 else \"weak\"','strong','',19,12,1,100,'2026-03-03 09:00:00'),(2,2,'cd54a7ce-1b95-11f1-a2a0-853fa890d88b','def open_ports(scan_output):\n    return [22,443]','[22,443]','',23,14,1,100,'2026-03-04 09:30:00'),(3,1,'cd54ee00-1b95-11f1-a2a0-853fa890d88b','def classify_password(pw):\n    return \"weak\"','weak','',11,10,0,30,'2026-03-04 11:00:00');
/*!40000 ALTER TABLE `exercise_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exercise_test_cases`
--

DROP TABLE IF EXISTS `exercise_test_cases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exercise_test_cases` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exercise_id` int NOT NULL,
  `input` text COLLATE utf8mb4_unicode_ci,
  `expected_output` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_hidden` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_test_cases_exercise_id` (`exercise_id`),
  CONSTRAINT `fk_test_cases_exercise` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exercise_test_cases`
--

LOCK TABLES `exercise_test_cases` WRITE;
/*!40000 ALTER TABLE `exercise_test_cases` DISABLE KEYS */;
INSERT INTO `exercise_test_cases` VALUES (1,1,'P@ssw0rd123!','strong',0),(2,1,'abc123','weak',1),(3,2,'22/open\n80/closed\n443/open','[22,443]',0),(4,2,'21/open\n25/open\n110/closed','[21,25]',1),(5,3,'allow tcp 80\nblock tcp 23','True',0),(6,4,'SELECT * FROM users WHERE username=\'admin\'--','True',0),(7,5,'ALERT: malware detected\nALERT: port scan','[\'malware detected\',\'port scan\']',0);
/*!40000 ALTER TABLE `exercise_test_cases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exercises`
--

DROP TABLE IF EXISTS `exercises`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exercises` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lesson_id` int NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `instructions_md` text COLLATE utf8mb4_unicode_ci,
  `starter_code` text COLLATE utf8mb4_unicode_ci,
  `language` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'python',
  `time_limit_ms` int NOT NULL DEFAULT '10000',
  `memory_limit_mb` smallint NOT NULL DEFAULT '128',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_exercises_lesson_id` (`lesson_id`),
  CONSTRAINT `fk_exercises_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exercises`
--

LOCK TABLES `exercises` WRITE;
/*!40000 ALTER TABLE `exercises` DISABLE KEYS */;
INSERT INTO `exercises` VALUES (1,3,'Password Strength Checker','Write a Python function that classifies a password as weak/medium/strong.','def classify_password(pw: str) -> str:\n    # TODO\n    return \"weak\"\n','python',5000,128,'2026-03-09 08:56:03'),(2,5,'Basic Port Scan Parser','Parse scan output and return only open ports as integers in ascending order.','def open_ports(scan_output: str) -> list[int]:\n    # TODO\n    return []\n','python',7000,128,'2026-03-09 08:56:03'),(3,8,'Firewall Rule Checker','Write a Python function to validate firewall rules.','def check_rules(rules: str) -> bool:\n    return False\n','python',5000,128,'2026-03-12 03:16:41'),(4,12,'SQL Injection Detector','Detect SQL injection patterns in user input.','def detect_sql_injection(query: str) -> bool:\n    return False\n','python',7000,128,'2026-03-12 03:16:41'),(5,16,'Incident Log Parser','Parse incident logs and summarize alerts.','def parse_logs(logs: str) -> list[str]:\n    return []\n','python',8000,128,'2026-03-12 03:16:41');
/*!40000 ALTER TABLE `exercises` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lesson_progress`
--

DROP TABLE IF EXISTS `lesson_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lesson_progress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lesson_id` int NOT NULL,
  `status` enum('not_started','in_progress','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'not_started',
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_lesson_progress_user_lesson` (`user_id`,`lesson_id`),
  KEY `idx_lesson_progress_lesson_id` (`lesson_id`),
  CONSTRAINT `fk_lesson_progress_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`),
  CONSTRAINT `fk_lesson_progress_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lesson_progress`
--

LOCK TABLES `lesson_progress` WRITE;
/*!40000 ALTER TABLE `lesson_progress` DISABLE KEYS */;
INSERT INTO `lesson_progress` VALUES (1,'cd54a7ce-1b95-11f1-a2a0-853fa890d88b',1,'completed','2026-03-03 08:00:00'),(2,'cd54a7ce-1b95-11f1-a2a0-853fa890d88b',2,'in_progress',NULL),(3,'cd54ee00-1b95-11f1-a2a0-853fa890d88b',1,'completed','2026-03-03 10:00:00'),(4,'cd54ee00-1b95-11f1-a2a0-853fa890d88b',3,'not_started',NULL),(5,'cd54a7ce-1b95-11f1-a2a0-853fa890d88b',6,'not_started',NULL),(6,'cd54ee00-1b95-11f1-a2a0-853fa890d88b',10,'not_started',NULL);
/*!40000 ALTER TABLE `lesson_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lessons`
--

DROP TABLE IF EXISTS `lessons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lessons` (
  `id` int NOT NULL AUTO_INCREMENT,
  `module_id` int NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_md` mediumtext COLLATE utf8mb4_unicode_ci,
  `lesson_order` tinyint NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_lessons_module_order` (`module_id`,`lesson_order`),
  CONSTRAINT `fk_lessons_module` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lessons`
--

LOCK TABLES `lessons` WRITE;
/*!40000 ALTER TABLE `lessons` DISABLE KEYS */;
INSERT INTO `lessons` VALUES (1,1,'Introduction to Cybersecurity','upload/lesson/intro-to-cyber-course/module-1-introduction-to-cybersecurity.md',1,'2026-03-09 08:56:03','2026-03-09 08:56:03'),(2,1,'Common Cyber Threats','upload/lesson/intro-to-cyber-course/module-2-common-cyber-threats.md',2,'2026-03-09 08:56:03','2026-03-09 08:56:03'),(3,2,'CIA Triad and Core Security Principles','upload/lesson/intro-to-cyber-course/module-3-cia-triad-and-core-security-principles.md',1,'2026-03-09 08:56:03','2026-03-09 08:56:03'),(4,2,'Passwords, Authentication, and Access Control','upload/lesson/intro-to-cyber-course/module-4-passwords-authentication-and-access-control.md',2,'2026-03-09 08:56:03','2026-03-09 08:56:03'),(5,3,'Safe Browsing, Email, and Cyber Hygiene','upload/lesson/intro-to-cyber-course/module-5-safe-browsing-email-and-cyber-hygiene.md',1,'2026-03-09 08:56:03','2026-03-09 08:56:03'),(6,4,'Network Layers and Protocols','Doucment/kompi-cyber/upload/lesson/network-security/course3-module1-network-layers.md',1,'2026-03-12 03:15:27','2026-03-12 03:15:27'),(7,4,'Common Network Threats','Doucment/kompi-cyber/upload/lesson/network-security/course3-module1-threats.md',2,'2026-03-12 03:15:27','2026-03-12 03:15:27'),(8,5,'Firewalls and IDS/IPS','Doucment/kompi-cyber/upload/lesson/network-security/course3-module2-firewalls.md',1,'2026-03-12 03:15:27','2026-03-12 03:15:27'),(9,5,'Network Hardening Best Practices','Doucment/kompi-cyber/upload/lesson/network-security/course3-module2-hardening.md',2,'2026-03-12 03:15:27','2026-03-12 03:15:27'),(10,6,'Understanding Web Architecture','Doucment/kompi-cyber/upload/lesson/web-security/course4-module1-architecture.md',1,'2026-03-12 03:15:27','2026-03-12 03:15:27'),(11,6,'OWASP Top 10 Overview','Doucment/kompi-cyber/upload/lesson/web-security/course4-module1-owasp.md',2,'2026-03-12 03:15:27','2026-03-12 03:15:27'),(12,7,'SQL Injection and XSS','Doucment/kompi-cyber/upload/lesson/web-security/course4-module2-sql-xss.md',1,'2026-03-12 03:15:27','2026-03-12 03:15:27'),(13,7,'Secure Coding Practices','Doucment/kompi-cyber/upload/lesson/web-security/course4-module2-secure-coding.md',2,'2026-03-12 03:15:27','2026-03-12 03:15:27'),(14,8,'Preparing for Incidents','Doucment/kompi-cyber/upload/lesson/incident-response/course5-module1-preparation.md',1,'2026-03-12 03:15:27','2026-03-12 03:15:27'),(15,8,'Identifying and Containing Threats','Doucment/kompi-cyber/upload/lesson/incident-response/course5-module1-containment.md',2,'2026-03-12 03:15:27','2026-03-12 03:15:27'),(16,9,'Evidence Collection Techniques','Doucment/kompi-cyber/upload/lesson/incident-response/course5-module2-evidence.md',1,'2026-03-12 03:15:27','2026-03-12 03:15:27'),(17,9,'Forensic Analysis Tools','Doucment/kompi-cyber/upload/lesson/incident-response/course5-module2-tools.md',2,'2026-03-12 03:15:27','2026-03-12 03:15:27');
/*!40000 ALTER TABLE `lessons` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `modules`
--

DROP TABLE IF EXISTS `modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `modules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module_order` tinyint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_modules_course_order` (`course_id`,`module_order`),
  CONSTRAINT `fk_modules_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modules`
--

LOCK TABLES `modules` WRITE;
/*!40000 ALTER TABLE `modules` DISABLE KEYS */;
INSERT INTO `modules` VALUES (1,1,'Foundations of Security',1),(2,1,'Safe Digital Behavior',2),(3,2,'Reconnaissance Basics',1),(4,3,'Network Fundamentals',1),(5,3,'Securing Networks',2),(6,4,'Introduction to Web Security',1),(7,4,'Vulnerability Assessment',2),(8,5,'Incident Response Process',1),(9,5,'Forensics Techniques',2);
/*!40000 ALTER TABLE `modules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_answers`
--

DROP TABLE IF EXISTS `quiz_answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `quiz_answers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `attempt_id` int NOT NULL,
  `question_id` int NOT NULL,
  `selected_option_id` int NOT NULL,
  `is_correct` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_quiz_answers_attempt_id` (`attempt_id`),
  KEY `idx_quiz_answers_question_id` (`question_id`),
  KEY `fk_quiz_answers_option` (`selected_option_id`),
  CONSTRAINT `fk_quiz_answers_attempt` FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts` (`id`),
  CONSTRAINT `fk_quiz_answers_option` FOREIGN KEY (`selected_option_id`) REFERENCES `quiz_options` (`id`),
  CONSTRAINT `fk_quiz_answers_question` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_answers`
--

LOCK TABLES `quiz_answers` WRITE;
/*!40000 ALTER TABLE `quiz_answers` DISABLE KEYS */;
INSERT INTO `quiz_answers` VALUES (1,1,1,1,1),(2,2,2,5,0),(3,3,2,6,1),(4,4,1,1,1);
/*!40000 ALTER TABLE `quiz_answers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_attempts`
--

DROP TABLE IF EXISTS `quiz_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `quiz_attempts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lesson_id` int NOT NULL,
  `attempt_no` tinyint NOT NULL DEFAULT '1',
  `score` tinyint NOT NULL DEFAULT '0',
  `passed` tinyint(1) NOT NULL DEFAULT '0',
  `submitted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_quiz_attempts_user_lesson` (`user_id`,`lesson_id`),
  KEY `idx_quiz_attempts_lesson_id` (`lesson_id`),
  CONSTRAINT `fk_quiz_attempts_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`),
  CONSTRAINT `fk_quiz_attempts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_attempts`
--

LOCK TABLES `quiz_attempts` WRITE;
/*!40000 ALTER TABLE `quiz_attempts` DISABLE KEYS */;
INSERT INTO `quiz_attempts` VALUES (1,'cd54a7ce-1b95-11f1-a2a0-853fa890d88b',1,1,100,1,'2026-03-03 08:10:00'),(2,'cd54a7ce-1b95-11f1-a2a0-853fa890d88b',2,1,50,0,'2026-03-03 08:20:00'),(3,'cd54a7ce-1b95-11f1-a2a0-853fa890d88b',2,2,100,1,'2026-03-03 08:35:00'),(4,'cd54ee00-1b95-11f1-a2a0-853fa890d88b',1,1,100,1,'2026-03-03 10:10:00');
/*!40000 ALTER TABLE `quiz_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_options`
--

DROP TABLE IF EXISTS `quiz_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `quiz_options` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `option_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_quiz_options_question_id` (`question_id`),
  CONSTRAINT `fk_quiz_options_question` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_options`
--

LOCK TABLES `quiz_options` WRITE;
/*!40000 ALTER TABLE `quiz_options` DISABLE KEYS */;
INSERT INTO `quiz_options` VALUES (1,1,'Protecting digital systems and data from unauthorized access and attacks',1),(2,1,'Only installing antivirus software',0),(3,1,'Creating social media accounts securely',0),(4,1,'Turning off all internet connections',0),(5,2,'Availability',0),(6,2,'Integrity',1),(7,2,'Confidentiality',0),(8,2,'Authentication',0),(9,3,'Unexpected urgent request with suspicious link',1),(10,3,'A scheduled weekly newsletter',0),(11,3,'Email from your own verified domain',0),(12,3,'Meeting invite from your team calendar',0),(13,4,'HTTPS',1),(14,4,'FTP',0),(15,4,'SMTP',0),(16,4,'HTTP',0),(17,5,'Denial of Service',1),(18,5,'Phishing',0),(19,5,'Malware Email',0),(20,5,'Rogue USB',0),(21,6,'Web application security risks',1),(22,6,'Network cabling',0),(23,6,'Server hardware',0),(24,6,'Desktop OS',0),(25,7,'SQL Injection',1),(26,7,'Buffer Overflow',0),(27,7,'Keylogger',0),(28,7,'Phishing',0),(29,8,'Preparation',1),(30,8,'Recovery',0),(31,8,'Analysis',0),(32,8,'Remediation',0),(33,9,'Recover evidence and analyze attack',1),(34,9,'Install antivirus',0),(35,9,'Update firewall',0),(36,9,'Change passwords',0);
/*!40000 ALTER TABLE `quiz_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_questions`
--

DROP TABLE IF EXISTS `quiz_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `quiz_questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lesson_id` int NOT NULL,
  `question_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_order` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_quiz_questions_lesson_id` (`lesson_id`),
  CONSTRAINT `fk_quiz_questions_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_questions`
--

LOCK TABLES `quiz_questions` WRITE;
/*!40000 ALTER TABLE `quiz_questions` DISABLE KEYS */;
INSERT INTO `quiz_questions` VALUES (1,1,'Which of the following best defines cybersecurity?',1),(2,2,'In the CIA triad, which pillar ensures data is accurate and unaltered?',1),(3,4,'Which sign most strongly indicates a phishing email?',1),(4,6,'Which protocol is used for secure communication over the internet?',1),(5,7,'Which attack targets the network layer directly?',1),(6,11,'What does the OWASP top 10 focus on?',1),(7,12,'Which vulnerability allows attacker to inject SQL queries?',1),(8,14,'First step in incident response is?',1),(9,16,'Forensic analysis helps to?',1);
/*!40000 ALTER TABLE `quiz_questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_roles_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (3,'admin'),(2,'instructor'),(1,'student');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` int NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_role_id` (`role_id`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('cd54116a-1b95-11f1-a2a0-853fa890d88b','Admin User','admin@cybernext.local','$2a$10$7EqJtq98hPqEX7fNZaFWoOHi6M9M0Wn4R7iT7W6h4x8b5Q8G7wW7S',3,1,'2026-03-09 08:56:03','2026-03-09 08:56:03'),('cd54602a-1b95-11f1-a2a0-853fa890d88b','Aisha Instructor','aisha@cybernext.local','$2a$10$7EqJtq98hPqEX7fNZaFWoOHi6M9M0Wn4R7iT7W6h4x8b5Q8G7wW7S',2,1,'2026-03-09 08:56:03','2026-03-09 08:56:03'),('cd54a7ce-1b95-11f1-a2a0-853fa890d88b','Nimal Student','nimal@cybernext.local','$2a$10$7EqJtq98hPqEX7fNZaFWoOHi6M9M0Wn4R7iT7W6h4x8b5Q8G7wW7S',1,1,'2026-03-09 08:56:03','2026-03-09 08:56:03'),('cd54ee00-1b95-11f1-a2a0-853fa890d88b','Kavya Student','kavya@cybernext.local','$2a$10$7EqJtq98hPqEX7fNZaFWoOHi6M9M0Wn4R7iT7W6h4x8b5Q8G7wW7S',1,1,'2026-03-09 08:56:03','2026-03-09 08:56:03');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-12 10:25:25
