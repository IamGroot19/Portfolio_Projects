## Table of Contents (Optional)

- [INTRODUCTION](#INTRODUCTION)
- [BRIEF OVEVIEW OF APP STRUCTURE](#BRIEF-OVERVIEW-INTO-STRUCTURE-OF-APP)
    - [DATABASE SCHEMAS](#DATABASE-SCHEMAS)
    - [ROUTES](#ROUTES)
    - [AUTHENTICATION & AUTHORISATION](#AUTHENTICATION--AUTHORISATION)
- [CHALLENGES FACED / PROBLEMS SOLVED](#CHALLENGES-FACED--PROBLEMS-SOLVED)
    - [INTRODUCING A RATING SYSTEM & OPTIMISING IT](#INTRODUCING-A-RATING-SYSTEM--OPTIMISING-IT)
    - [AUTHORISATION & OPTIMISING THE PROCESS](#AUTHORISATION--OPTIMISING-THE-PROCESS)
    - [ADMIN ROLE (for content moderation) - Product Management Perspective](#ADMIN-ROLE-for-content-moderation-Product-Management-Perspective)
    - [DEPLOYMENT CHALLENGES](#DEPLOYMENT-CHALLENGES)
- [MISCELLANEOUS](#MISCELLANEOUS)
    - [POSSIBLE FUTURE FEATURES](#POSSIBLE-FUTURE-FEATURES)
    - [Dependencies](#Dependencies-can-be-found-in-package.json-package.json-file-as-well)

# INTRODUCTION

### Project Name: **FoodCravings**

### What is it?
A restaurant review website where owners can add their restaurants and users can review it. (Kind of like a Zomato clone). 
To know more about basic features, check out about page of the website.

### What is it made of?
- **Frontend**: HTML, CSS, Bootstrap, Javascript, EJS (templates)
- **Backend**: NodeJS, Express
- **Database**: MongoDB Atlas (Cloud based MongoDB service)
- **Authentication**: PassportJS (Strategy: Username + Password) 
- **Email service**: Nodemailer (for password reset)
- **Deployment**: AWS Beanstalk + CI/CD Pipeline to automatically deploy the new code

### Few Notable Features:
- Password reset (if user wants to change their old password with a new one)
- Forgot password (reset through email)
- Google Maps API showing restaurants’ locations
- Rating system
- Administrator (moderator) roles

### How to run it?
- Clone the github repository
- (Assuming you have nodejs installed) Open up the root directory (or main directory) in command prompt/terminal and type `npm install` to install all the dependencies.
- Then type the command `nodemon app.js`
- In your browser, type the following link: `localhost:6969`

---

# BRIEF OVERVIEW INTO STRUCTURE OF APP

NOTE: This project initially started out as a camping ground review website and then was changed into a restaurant review app. So,( campgrounds & Restaurants), Reviews & comments) are synonymously used. 

## DATABASE SCHEMAS

3 collections (NoSQL equivalent of SQL’s Relations)  exists: a) [Restaurants](/db/campgrounds.js)   b) [Reviews](/db/comment.js) c) [Users](/db/user.js)

<ins>Restaurant schema contains following data</ins>:
    Name, Image, Price, Description, Location (or address), Latitude, Longitude, Average Rating, AuthorID, CommentID, cmntLoopFlag. 

<ins>Comment Schema contains following data:</ins>
  Text (Actual comment text), username, userid, Rating

<ins>User Schema contains following data:</ins>
        Username, Password (hashed version ofcourse!), First Name, Last name, resetPasswordToken, resetPassword expires, bio, adminStatus, List of reviewed restaurants.

Data Association(Referencing) vs Embedding:
- Since all 3 data are used together, instead of redundant storage of data items(for eg, entire user data inside Restaurant’s Author field), **Data Association** technique has been used.
- In this technique, we reference a record’s unique mongoDB ID and then lookup the variables from the collection. 
- Note that there is a trade off between space taken for storing in same collection and time looking up the data from another collection.
- So in cases where some data from another table has to be looked up frequently (for eg, author id for each comment), such data is directly stored in that collection itself (i.e. **Embedding**). 

## ROUTES:

4 major Route types (all based on above schemas) viz. 
- **[Index routes](/routes/indexRoutes.js)** (Login, Signup, Logout).
- **[Credential Routes](/routes/credentialRoutes.js)** (Forgot password, Password reset).
- **[Restaurant routes](/routes/campgroundRoutes.js)** (**C**reate/**R**ead/**U**pdate/**D**elete restaurants).
- **[Reviews routes](/routes/coomentRoutes.js)** (**C**reate/**R**ead/**U**pdate/**D**elete comments). 

As much as possible, Route names have been designed based on [RESTful naming conventions](https://restfulapi.net/resource-naming).

The routes are as follows:

|HTTP Verbs |  ROUTES (restaurants)   |                     DESCRIPTION                          |
|-----------|:-----------------------:|----------------------------------------------------------|
| GET       | /campgrounds – sh       | Shows all restaurants                                    |
| GET       | /campgrounds/:id        | Shows a particular restaurant                            |
| GET       | /campgrounds/new        | Redirects to a form for filling up new restaurant details|
| POST      | /campgrounds            | To enter the new form data into database                 |
| GET       | /campgrounds/:id/edit   | Redirects to a form to update restaurants details        |
| PUT       | /campgrounds/:id        | To update an existing restaurant of :id into database    |
| DELETE    | /campgrounds/:id/delete | Delete a restaurant of particular id                     |

 (Similarly, the other routes & their actions can be found at respective routes files)

## AUTHENTICATION & AUTHORISATION

- `passport`, `passport-local`, `passport-local-mongoose` packages have been used for authentication purposes. 

- A username/password type of authentication strategy has been used. (Check [index routes](/routes/indexRoutes.js))

- For authorisation actions like preventing one user from deleting another user’s post (& some more restrictions – check about page of the webiste more info), middlewares have been extensively inside route handlers. 

- To facilitate moderation, an `isAdmin` flag is used inside user schema. For moderator accounts, middlewares are used inside route handlers to restrict them from editing or creating any new posts but at the same time facilitating permission to delete posts. 

## CHALLENGES FACED / PROBLEMS SOLVED:

### a) INTRODUCING A RATING SYSTEM & OPTIMISING IT
1. When the rating feature (i.e. rate each restaurant between 1-5 average of which will be displayed at top) was to be introdoced, the first approach I made involved simply looping through all comments associated with a campground and taking average of those values.
2. But the above solution could be tripped up by same user commenting multiple times. To mitigate this, I added authorisation feature by which a user can post only 1 per restaurant. (ref sub-section(b) ).
3. Also, solution 1 makes the loading really slow especially when there will be 1000s of reviews/hotel and this will have to be performed everytime. 
4. To mitigate problem mentioned in 3, I introduced 2 other variables inside restaurant's schema viz. `avgRating` `cmntLoopFlag`.  The displayed rating will be taken from database and when a comment(or review) is edited/added/deleted the flag will be set so that only when required the backend oops through all comments to calculate average rating.

### b) AUTHORISATION & OPTIMISING THE PROCESS
1. As mentioned above, to prevent messing up of rating system, each user must be allowed only once to review per restaurant. 
2. The first approach I took was to loop through list of all reviews to see if a user's id exists in those before determine whether to allow them to give access or not. But this method is computationally expensive and we can do better.
3. Since no. of restaurants < no. of reviews, we can store a list of all restaurants reviewed by a user and when they go to a particular restaurant's page, we can check the user's data to determine whether to allow them to review or not. 

### c) ADMIN ROLE (for content moderation) - Product Management Perspective
1. Given the fact that internet is anonymous, things can become ugly very quickly if no one moderates content. So, facilitate moderation, I introdued a moderator account.
2. A moderator can remove restaurants/reviews on the grounds of it being inappropriate. Since fake information is more harmful than no information, it was decided that moderators cannot edit posts.
3. Each user account has an `isAdmin` flag and moderators before signing up will be provided with a seret code. If it matches those acounts will be made moderators
4. Also, to prevent moderators from abusing their power, moderators won't be allowed to create any reviews/restaurants of their own. 
5. The actual implementation involved usage of `middlewares` in route handlers that a user's request against the `isAdmin` flag of their account.

### d) DEPLOYMENT CHALLENGES
- **AIM**: To deploy the website in AWS with minimal complexity. 
- Keeping this in mind, I chose AWS Beanstalk since everything is taken care of in the background.
- I chose MongoDB Atlas over AWS's DynamoDB since usage of DynamoDB would have involved familiarising with their SDK & hence more time.
- **First issue**: `Nginx 502 bad gateway` which caused the instance's health to continously deteriorate. After spending sometime with logs,  I that the issue was lack of communication between NGINX Server (which communicates with outside world) & my Express server. Further inspection revealed that port variable was not declared correctly.
- **Second Issue**: MongoDB Atlas was blocking requests from AWS Beanstalk instance since the IP was not whitelisted. But obtaining Beanstalk's IP was not straightforward since IP gets changed when the instance gets reallocated. To mitigate this, I assigned an **Elastic IP Address** to the instance & whitelisted it in the Atlas server.
---
# MISCELLANEOUS

## POSSIBLE FUTURE FEATURES:
- Social Media signin (Google/Facebook).
- Payment options for seat reservation at hotel.
- Image upload in reviews. 
- Editable user profiles.

## Dependencies (can be found in [package.json](/package.json) file as well)
    "async": "^3.2.0",
    "connect-flash": "^0.1.1",
    "dotenv": "^8.2.0",
    "ejs": "^3.1.5",
    "express": "^4.17.1",
    "express-session": "^1.17.1",
    "method-override": "^3.0.0",
    "moment": "^2.27.0",
    "moment-timezone": "^0.5.31",
    "mongoose": "^5.10.4",
    "node-geocoder": "^3.27.0",
    "nodemailer": "^6.4.11",
    "nodemon": "^2.0.4",
    "passport": "^0.4.1",
    "passport-local": "^1.0.0",
    "passport-local-mongoose": "^6.0.1"


