# Instructor Dashboard Documentation

## Overview
The Instructor Dashboard is a comprehensive management system for instructors to manage courses, create and edit quizzes, and track student analytics. It provides a role-based interface with three main tabs: My Courses, Quizzes, and Analytics.

## Features

### 1. Role-Based Access Control
- **Detection**: Automatically detects if logged-in user is an instructor
- **Route Protection**: Only instructors can access `/instructor/dashboard`
- **Fallback**: Redirects to login if not authenticated

### 2. Course Management
- View all instructor's courses
- Display course statistics (students enrolled, quizzes created)
- Edit and delete courses
- Select active course for quiz and analytics management

### 3. Quiz Management
- **Create Quizzes**: Add new quizzes for lessons
- **Edit Quizzes**: Modify existing quiz content
- **Delete Quizzes**: Remove quizzes with confirmation
- **Multiple Choice Support**: Each question supports up to 4 options
- **Single Correct Answer**: Enforce one correct answer per question
- **Form Validation**: Ensure all required fields are filled

### 4. Student Analytics
- **Overview Tab**: 
  - Total enrolled students
  - Total quizzes created
  - Average score across all quizzes
  - Pass rate statistics
  - Performance trend visualization

- **Students Tab**:
  - List of all enrolled students
  - Individual scores and completion rates
  - Status indicators (On Track, In Progress, At Risk)
  - Performance progress bars

- **Quizzes Tab**:
  - Quiz-specific score breakdown
  - Individual student attempts
  - Completion times
  - Correct answer counts

- **Export**: Download analytics as CSV for reporting

## Project Structure

```
frontend/src/
├── pages/instructor/
│   └── InstructorDashboard.jsx        # Main dashboard component
├── components/instructor/
│   ├── QuizForm.jsx                   # Quiz creation/editing form
│   ├── QuizList.jsx                   # Quiz listing and management
│   └── AnalyticsPanel.jsx             # Analytics dashboard
└── hooks/
    ├── useInstructorAPI.js            # API calls for instructor operations
    └── useAuth.js                     # Authentication and role checking
```

## Components

### InstructorDashboard.jsx
Main component that orchestrates the dashboard interface.

**Props**: None
**State**:
- `courses`: Array of instructor's courses
- `lessons`: Array of lessons for selected course
- `activeTab`: Current tab (courses, quizzes, analytics)
- `selectedCourse`: Currently selected course
- `showQuizForm`: Show/hide quiz form modal

**Features**:
- Tab navigation (My Courses, Quizzes, Analytics)
- Course selector dropdown
- Statistics cards
- Empty state handling
- Loading states

### QuizForm.jsx
Component for creating and editing quizzes with questions and options.

**Props**:
- `lessonId` (optional): Lesson ID for editing existing quiz
- `courseId`: Course ID for context
- `lessons`: Array of available lessons
- `onSuccess`: Callback when quiz is saved
- `onCancel`: Callback to close form

**Features**:
- Dynamic question addition/removal
- Multiple choice options (up to 4)
- Correct answer selection (radio buttons)
- Form validation
- Error and success messages
- Loading states during submission

**Usage**:
```jsx
<QuizForm
  courseId={courseId}
  lessons={lessons}
  onSuccess={() => setShowQuizForm(false)}
  onCancel={() => setShowQuizForm(false)}
/>
```

### QuizList.jsx
Component for displaying and managing quizzes.

**Props**:
- `courseId`: Course ID to fetch quizzes
- `lessons`: Array of available lessons
- `onEdit`: Callback when edit button clicked

**Features**:
- Expandable quiz items
- Question preview
- Quiz statistics (average score, completion count, pass rate)
- Edit and delete actions
- Loading and error states

**Usage**:
```jsx
<QuizList
  courseId={selectedCourse.id}
  lessons={lessons}
  onEdit={(quiz) => handleEdit(quiz)}
/>
```

### AnalyticsPanel.jsx
Component for displaying student performance and quiz analytics.

**Props**:
- `courseId`: Course ID to fetch analytics
- `lessons`: Array of available lessons

**Tabs**:

1. **Overview**: High-level statistics and trends
2. **Students**: Individual student performance metrics
3. **Quizzes**: Quiz-specific score breakdown

**Features**:
- Multi-tab interface
- Performance metrics cards
- Student performance table
- Quiz score breakdown
- Progress bars and visual indicators
- CSV export functionality

**Usage**:
```jsx
<AnalyticsPanel
  courseId={selectedCourse.id}
  lessons={lessons}
/>
```

## Hooks

### useInstructorAPI
Custom hook for all instructor-related API calls with automatic error handling and loading states.

**Methods**:
```javascript
const {
  loading,
  error,
  clearError,
  fetchInstructorCourses,
  fetchCourseQuizzes,
  fetchQuizByLesson,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  fetchAnalytics,
  fetchStudentList,
  fetchQuizScores,
} = useInstructorAPI();
```

**Example Usage**:
```javascript
const [quizzes, setQuizzes] = useState([]);
const { fetchCourseQuizzes, loading, error } = useInstructorAPI();

useEffect(() => {
  fetchCourseQuizzes(courseId)
    .then(data => setQuizzes(data))
    .catch(err => console.error(err));
}, [courseId]);
```

### useAuth
Hook for authentication and role-based access control.

**Methods**:
```javascript
const {
  getAuthHeaders,
  getUserRole,
  isInstructor,
  isStudent,
  logout,
} = useAuth();
```

**Example Usage**:
```javascript
const { isInstructor } = useAuth();

useEffect(() => {
  isInstructor().then(result => {
    if (!result) navigate('/dashboard');
  });
}, []);
```

## API Endpoints

### Instructor Courses
- `GET /api/instructor/courses` - Fetch all instructor's courses
- `GET /api/instructor/courses/:id` - Get specific course details
- `POST /api/instructor/courses` - Create new course
- `PUT /api/instructor/courses/:id` - Update course
- `DELETE /api/instructor/courses/:id` - Delete course

### Quizzes
- `GET /api/quizzes/course/:courseId` - Get all quizzes for course
- `GET /api/quizzes/lesson/:lessonId` - Get quiz for specific lesson
- `POST /api/quizzes/lesson/:lessonId` - Create quiz
- `PUT /api/quizzes/lesson/:lessonId` - Update quiz
- `DELETE /api/quizzes/lesson/:lessonId` - Delete quiz

### Analytics
- `GET /api/instructor/analytics/:courseId` - Get course analytics
- `GET /api/instructor/courses/:courseId/students` - Get enrolled students
- `GET /api/instructor/quizzes/:quizId/scores` - Get quiz attempt scores

### Lessons
- `GET /api/lessons/course/:courseId` - Get all lessons for course

## Styling

The dashboard uses **Tailwind CSS** for styling with:
- Color scheme: Slate (gray), Blue (primary), Green, Purple, Orange (accents)
- Responsive grid layouts (1 col mobile, 2-3 cols desktop)
- Card-based design
- Smooth transitions and hover effects
- Icons from `lucide-react`

## Error Handling

All components include:
- Try-catch blocks for API calls
- User-friendly error messages
- Error dismissal buttons
- Automatic retry options
- Loading state indicators

## Loading States

Components show loading indicators during:
- Initial data fetch
- Form submission
- API operations
- Quiz loading

## Responsive Design

All components are fully responsive:
- Mobile: Single column, stacked layout
- Tablet: Two columns where applicable
- Desktop: Full width with optimized spacing

## Best Practices

1. **Authentication**: Always check token before API calls
2. **Error Handling**: Display user-friendly error messages
3. **Loading States**: Show loaders during async operations
4. **Form Validation**: Validate before submission
5. **Component Reusability**: Use hooks for shared logic
6. **State Management**: Lift state when needed
7. **Accessibility**: Use semantic HTML and ARIA labels

## Common Tasks

### Create a New Quiz
1. Select course from dropdown
2. Click "Quizzes" tab
3. Click "Create Quiz" button
4. Select lesson
5. Add questions and options
6. Mark correct answers
7. Submit form

### View Student Analytics
1. Select course from dropdown
2. Click "Analytics" tab
3. View overview statistics
4. Switch to "Students" tab for individual performance
5. Switch to "Quizzes" tab to see quiz-specific scores
6. Export report as CSV

### Edit Quiz
1. Select course from dropdown
2. Click "Quizzes" tab
3. Expand quiz item
4. Click "Edit" button
5. Modify questions/options
6. Submit

## Troubleshooting

### Quiz Not Saving
- Ensure all questions have text
- Ensure all questions have at least 2 options
- Ensure each question has a correct answer selected

### Analytics Not Loading
- Check course ID is valid
- Ensure student data exists for course
- Check API endpoints are configured correctly

### Form Validation Errors
- Fill all required fields
- Ensure proper data types
- Check field length restrictions

## Future Enhancements

- [ ] Bulk quiz import/export
- [ ] Quiz templates
- [ ] Student messaging system
- [ ] Real-time analytics updates
- [ ] Performance predictions
- [ ] Quiz scheduling
- [ ] Question bank management
- [ ] Peer review system
