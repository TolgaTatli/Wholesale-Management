-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: warehouse_management
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `transaction_payment`
--

DROP TABLE IF EXISTS `transaction_payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction_payment` (
  `Payment_ID` int NOT NULL AUTO_INCREMENT,
  `Payment_Date` date NOT NULL DEFAULT (curdate()),
  `Amount_Paid` decimal(10,2) NOT NULL,
  `Payment_Status` enum('Paid','Pending','Cancelled') COLLATE utf8mb4_turkish_ci DEFAULT 'Pending',
  `Order_ID` int NOT NULL,
  PRIMARY KEY (`Payment_ID`),
  KEY `Order_ID` (`Order_ID`),
  CONSTRAINT `transaction_payment_ibfk_1` FOREIGN KEY (`Order_ID`) REFERENCES `order` (`Order_ID`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction_payment`
--

LOCK TABLES `transaction_payment` WRITE;
/*!40000 ALTER TABLE `transaction_payment` DISABLE KEYS */;
INSERT INTO `transaction_payment` VALUES (1,'2024-01-16',25000.00,'Paid',1),(2,'2024-01-20',15000.00,'Pending',1),(3,'2024-01-19',4750.00,'Paid',2),(4,'2024-01-22',18000.00,'Pending',3);
/*!40000 ALTER TABLE `transaction_payment` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-26 18:44:15
