# Subur: Healthier Rice Crops through Image-Based Disease Detection

## Overview

The **Subur** project is designed to help Indonesian farmers detect rice plant diseases and predict rice production. The project leverages machine learning models to analyze images for disease detection and tabular data to estimate crop production. The backend is built on Google Cloud using Compute Engine and Firebase for efficient data storage and management.

---

## Project Structure

### **Backend Infrastructure**

The backend handles API requests related to topics, articles, comments, and user authentication. It also manages communication between the mobile frontend and machine learning models for disease detection and production forecasting.

- **Firebase**: Used for storing user account data, articles, topics, and comments.
- **Firebase Storage**: Stores images (e.g., for disease detection and production models).
- **Google Cloud Compute Engine**: Hosts and runs both the backend and machine learning models.
- **GitHub**: Used for version control and collaborative development.

## Deployment Information

### **Compute Engine Instances**

- **Backend Instance (subur-be)**  
  - **Instance ID**: `9125123164134974250`  
  - **Machine Type**: `e2-medium` (2 vCPUs, 4 GB RAM)  
  - **Creation Time**: Dec 11, 2024, 9:12 PM (UTC+07:00)  
  - **Location**: `asia-southeast2-b`  
  - **Firewalls**: HTTP and HTTPS traffic allowed.  
  - **Purpose**: Handles backend API operations and high-volume user requests.

---
## Backend Access URLs

To interact with the backend, you can use the following URLs for different services:

- **Backend URL (Subur API)**:  
  - `http://34.101.111.234:3000`  
  - `https://34.101.111.234:3001`

These URLs provide access to the various backend features and API endpoints such as topics, articles, comments, and authentication.

---
## API Endpoints

### **User Authentication & Profile Management**

- **Login**:  
  - `POST /login`  
    Handles user login. The user submits their credentials, and the system authenticates them.

- **Profile Management**:  
  - `PUT /profile/:uid`  
    Allows the user to update their profile, including uploading a new profile image.  
  - `GET /profile/:uid`  
    Retrieves the user's profile by their unique ID (`uid`). It uses authentication middleware to ensure that only authorized users can access the profile.

- **Registration**:  
  - `POST /register`  
    Handles user registration, allowing new users to create an account.

- **Logout**:  
  - `POST /logout`  
    Logs the user out.

### **Topic Management**

- **Topic Operations**:
  - `GET /topic`  
    Retrieves all topics.
  - `GET /topic/:id`  
    Retrieves a specific topic by its ID.
  - `GET /topic/user/:uid`  
    Retrieves topics created by a specific user (`uid`).
  - `POST /topic`  
    Adds a new topic.
  - `PUT /topic/:id`  
    Updates a topic by its ID.
  - `DELETE /topic/:id`  
    Deletes a topic by its ID.

### **Comment Management**

- **Comment Operations**:
  - `GET /comment`  
    Retrieves all comments.
  - `GET /comment/user/:uid`  
    Retrieves comments made by a specific user (`uid`).
  - `GET /comment/topic/:topic_id`  
    Retrieves comments for a specific topic by its ID.
  - `POST /comment`  
    Adds a new comment.
  - `PUT /comment/:id`  
    Updates a comment by its ID.
  - `DELETE /comment/:id`  
    Deletes a comment by its ID.

### **Article & User Insights**

- **Articles**:
  - `GET /article`  
    Retrieves all articles.

- **User Insights**:
  - `GET /users/top/topics`  
    Retrieves the top users based on topics created.
  - `GET /users/top/comments`  
    Retrieves the top users based on the number of comments they have made.

---

## Installation

### **1. Clone the repository**

To get started with the project, clone this repository to your local machine:

```bash
git clone https://github.com/Rasthian/Capstone-beta.git
cd subur
