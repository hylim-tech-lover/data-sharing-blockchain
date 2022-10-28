# Private Blockchain Implementation MVP - API Server

## Description
API Server is the "service provider" that performs certain actions on RESTful API request and will return JSON response regardless success or fail. 

It is used to abstract underlying infrastructure communication from client and acts as their intermediary with dedicated endpoints. 

## Objective
- Code refactoring for backend and frontend services using same API services
- Standardize response packet format for both backend and frontend services

## .env file 
Create `.env` file in `src` directory along side with `.env.example` and refer to `.env.example` and fill in the information accordingly.  
