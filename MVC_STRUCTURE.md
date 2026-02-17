# MVC Architecture Documentation

## Overview

The backend has been refactored to follow the **Model-View-Controller (MVC)** pattern, which provides better code organization, maintainability, and separation of concerns.

## Directory Structure

```
server/
├── models/              # Data layer - Database operations
│   ├── User.js
│   ├── Habit.js
│   ├── Progress.js
│   └── Share.js
├── controllers/         # Business logic layer
│   ├── authController.js
│   ├── habitController.js
│   ├── progressController.js
│   ├── shareController.js
│   └── userController.js
├── routes/             # Route definitions
│   ├── auth.js
│   ├── habits.js
│   ├── progress.js
│   ├── share.js
│   └── users.js
├── middleware/         # Middleware functions
│   └── auth.js
├── config/            # Configuration files
│   └── betterAuth.js
├── db/                # Database setup
│   ├── index.js
│   └── schema.js
└── index.js           # Application entry point
```

## Architecture Layers

### 1. Models (Data Layer)

**Location:** `server/models/`

Models handle all database operations and data manipulation. They provide a clean interface for interacting with the database.

#### User.js
- `findById(userId)` - Get user profile by ID
- `create(userData)` - Create new user profile
- `update(userId, updateData)` - Update user profile
- `delete(userId)` - Delete user account and all related data

#### Habit.js
- `findByUserId(userId, filters)` - Get all habits for a user with optional filters
- `findById(habitId, userId)` - Get specific habit
- `create(habitData)` - Create new habit
- `update(habitId, userId, updateData)` - Update habit
- `updateStats(habitId, userId, stats)` - Update habit statistics
- `delete(habitId, userId)` - Delete habit
- `getCategories(userId)` - Get all habit categories

#### Progress.js
- `findByDateRange(userId, filters)` - Get progress within date range
- `findByDate(userId, habitId, date)` - Get progress for specific date
- `create(progressData)` - Create progress entry
- `update(progressId, updateData)` - Update progress entry
- `getTodayProgress(userId)` - Get today's progress for all habits
- `getCompletedProgress(habitId, userId)` - Get completed progress entries
- `getCompletionCount(habitId, userId)` - Get total completion count
- `getStats(userId, filters)` - Get progress statistics

#### Share.js
- `create(shareData)` - Create shareable link
- `findByShareId(shareId)` - Get shared data by share ID
- `findByUserId(userId)` - Get all shares for a user
- `delete(shareId, userId)` - Delete shared link
- `getShareableStats(userId)` - Get stats for sharing

### 2. Controllers (Business Logic Layer)

**Location:** `server/controllers/`

Controllers handle the business logic, process requests, validate data, and coordinate between models and routes.

#### authController.js
- `register(req, res)` - Handle user registration
- `login(req, res)` - Handle user login
- `googleAuth(req, res)` - Handle Google OAuth
- `getCurrentUser(req, res)` - Get current user info
- `logout(req, res)` - Handle user logout

#### habitController.js
- `getAll(req, res)` - Get all habits with filters
- `create(req, res)` - Create new habit
- `update(req, res)` - Update habit
- `delete(req, res)` - Delete habit
- `getCategories(req, res)` - Get habit categories

#### progressController.js
- `getProgress(req, res)` - Get progress data
- `toggleProgress(req, res)` - Toggle habit completion
- `getTodayProgress(req, res)` - Get today's progress
- `getStats(req, res)` - Get progress statistics
- `getCalendar(req, res)` - Get calendar view
- `calculateStreaks(progressRows)` - Helper to calculate streaks

#### shareController.js
- `getShareableStats(req, res)` - Get shareable statistics
- `createShare(req, res)` - Create shareable link
- `getSharedProgress(req, res)` - Get shared progress (public)
- `getUserLinks(req, res)` - Get user's shared links
- `deleteShare(req, res)` - Delete shared link

#### userController.js
- `getProfile(req, res)` - Get user profile
- `updateProfile(req, res)` - Update user profile
- `getDashboard(req, res)` - Get dashboard data
- `deleteAccount(req, res)` - Delete user account

### 3. Routes (API Endpoints)

**Location:** `server/routes/`

Routes define the API endpoints and connect them to controllers. They also handle validation middleware.

#### Example Route Structure:
```javascript
import express from 'express';
import { body } from 'express-validator';
import auth from '../middleware/auth.js';
import HabitController from '../controllers/habitController.js';

const router = express.Router();

router.get('/', auth, HabitController.getAll);
router.post('/', [auth, body('name').trim().isLength({ min: 1 })], HabitController.create);

export default router;
```

## Benefits of MVC Pattern

### 1. Separation of Concerns
- **Models** handle data operations
- **Controllers** handle business logic
- **Routes** handle HTTP requests/responses

### 2. Maintainability
- Easy to locate and fix bugs
- Changes in one layer don't affect others
- Clear responsibility for each component

### 3. Reusability
- Models can be reused across different controllers
- Controllers can be tested independently
- Business logic is centralized

### 4. Testability
- Each layer can be unit tested separately
- Mock dependencies easily
- Better test coverage

### 5. Scalability
- Easy to add new features
- Simple to extend existing functionality
- Clear structure for team collaboration

## Data Flow

```
Client Request
    ↓
Route (validates & routes)
    ↓
Controller (business logic)
    ↓
Model (database operations)
    ↓
Database
    ↓
Model (returns data)
    ↓
Controller (formats response)
    ↓
Route (sends response)
    ↓
Client Response
```

## Example: Creating a Habit

### 1. Route (`routes/habits.js`)
```javascript
router.post('/', [
  auth,
  body('name').trim().isLength({ min: 1 })
], HabitController.create);
```

### 2. Controller (`controllers/habitController.js`)
```javascript
static async create(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const habit = await Habit.create({
    userId: req.userId,
    name: req.body.name,
    // ... other fields
  });
  
  res.status(201).json(formattedHabit);
}
```

### 3. Model (`models/Habit.js`)
```javascript
static async create(habitData) {
  const [habit] = await db
    .insert(schema.habits)
    .values(habitData)
    .returning();
  
  return habit;
}
```

## Migration from Old Structure

The refactoring maintains backward compatibility:
- All API endpoints remain the same
- Response formats are unchanged
- Authentication flow is preserved
- Database schema is unmodified

## Best Practices

1. **Keep Controllers Thin**: Move complex logic to models or services
2. **Single Responsibility**: Each model/controller handles one resource
3. **Error Handling**: Consistent error responses across all controllers
4. **Validation**: Use express-validator in routes
5. **Async/Await**: Use async/await for all database operations
6. **ES6 Modules**: Use import/export instead of require

## Future Enhancements

- Add service layer for complex business logic
- Implement repository pattern for data access
- Add DTOs (Data Transfer Objects) for request/response
- Implement caching layer
- Add comprehensive unit tests
- Add API documentation with Swagger

## Conclusion

The MVC pattern provides a solid foundation for the application, making it easier to maintain, test, and scale. Each component has a clear responsibility, and the separation of concerns makes the codebase more professional and enterprise-ready.
