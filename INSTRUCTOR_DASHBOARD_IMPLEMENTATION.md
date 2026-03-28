# Instructor Dashboard - Implementation Guide

## Quick Start

### 1. Installation
All required packages are already installed in your project:
- `react` (with hooks)
- `axios` (for API calls)
- `lucide-react` (for icons)
- `tailwindcss` (for styling)

### 2. File Structure
```
frontend/src/
├── hooks/
│   ├── useInstructorAPI.js          ✅ Created
│   └── useAuth.js                    ✅ Created
├── components/instructor/
│   ├── QuizForm.jsx                  ✅ Created
│   ├── QuizList.jsx                  ✅ Created
│   └── AnalyticsPanel.jsx            ✅ Created
└── pages/instructor/
    └── InstructorDashboard.jsx       ✅ Updated
```

### 3. Verify Integration

Check that InstructorDashboard imports are working:

```jsx
import QuizForm from "../../components/instructor/QuizForm";
import QuizList from "../../components/instructor/QuizList";
import AnalyticsPanel from "../../components/instructor/AnalyticsPanel";
```

## API Configuration

Ensure your backend API endpoints match the following structure:

### Expected Endpoints

```javascript
// Instructor Routes
GET    /api/instructor/courses
GET    /api/instructor/courses/:id
POST   /api/instructor/courses
PUT    /api/instructor/courses/:id
DELETE /api/instructor/courses/:id
GET    /api/instructor/stats

// Quiz Routes
GET    /api/quizzes/course/:courseId
GET    /api/quizzes/lesson/:lessonId
POST   /api/quizzes/lesson/:lessonId
PUT    /api/quizzes/lesson/:lessonId
DELETE /api/quizzes/lesson/:lessonId

// Analytics Routes
GET    /api/instructor/analytics/:courseId
GET    /api/instructor/courses/:courseId/students
GET    /api/instructor/quizzes/:quizId/scores

// Lesson Routes
GET    /api/lessons/course/:courseId

// User Routes
GET    /api/user/profile
```

## Backend Implementation (Optional Enhancements)

### Analytics Endpoints

If you need to implement the analytics endpoints, here's the structure:

```javascript
// GET /api/instructor/analytics/:courseId
{
  "data": {
    "course_name": "Introduction to Cybersecurity",
    "total_students": 45,
    "total_quizzes": 5,
    "avg_score": 78.5,
    "pass_rate": 82.2,
    "trend": [
      { "week": 1, "score": 65 },
      { "week": 2, "score": 72 },
      { "week": 3, "score": 78.5 }
    ],
    "quizzes": [
      {
        "id": 1,
        "lesson_id": 5,
        "question_count": 10,
        "attempts_count": 45,
        "stats": {
          "avg_score": 78.5,
          "completed_count": 45,
          "pass_rate": 82.2
        }
      }
    ]
  }
}

// GET /api/instructor/courses/:courseId/students
{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "avg_score": 85.5,
      "completion_rate": 95,
      "status": "On Track"
    }
  ]
}

// GET /api/instructor/quizzes/:quizId/scores
{
  "data": [
    {
      "id": 1,
      "student_name": "John Doe",
      "score": 90,
      "correct_answers": 9,
      "total_questions": 10,
      "time_spent": 1200
    }
  ]
}
```

## Testing the Dashboard

### 1. Start Development Server
```bash
cd frontend
npm run dev
```

### 2. Login as Instructor
Navigate to `/instructor/login` and use instructor credentials.

### 3. Test Each Feature

#### Course Tab
- [ ] Courses display correctly
- [ ] Statistics cards show accurate data
- [ ] Course selection updates view
- [ ] View/Edit/Delete buttons work

#### Quiz Tab
- [ ] Quiz list displays
- [ ] Can create new quiz
- [ ] Quiz form validates input
- [ ] Can edit existing quiz
- [ ] Can delete quiz with confirmation
- [ ] Questions preview shows correctly

#### Analytics Tab
- [ ] Overview statistics display
- [ ] Students list shows with metrics
- [ ] Quiz scores show when selected
- [ ] Export CSV button works
- [ ] Progress bars render correctly

## Role-Based Access Control

### Implementation in App.jsx

Ensure instructor routes are protected:

```jsx
// In App.jsx
<Route 
  path="/instructor/dashboard" 
  element={
    <ProtectedRoute requiredRole="instructor">
      <InstructorLayout>
        <InstructorDashboard />
      </InstructorLayout>
    </ProtectedRoute>
  } 
/>
```

### Create ProtectedRoute Component

```jsx
// src/components/ProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children, requiredRole }) {
  const navigate = useNavigate();
  const { getUserRole } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/instructor/login');
        return;
      }

      if (requiredRole) {
        const userRole = await getUserRole();
        if (userRole !== requiredRole) {
          navigate('/dashboard');
          return;
        }
      }

      setIsAuthorized(true);
    };

    checkAuth();
  }, []);

  if (isAuthorized === null) {
    return <div className="flex items-center justify-center min-h-screen">
      <p>Loading...</p>
    </div>;
  }

  return isAuthorized ? children : null;
}
```

## Configuration

### Environment Variables

Create/update `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Or for production:

```env
VITE_API_URL=https://your-api-domain.com
```

## Customization

### Change Colors
Edit Tailwind classes in components:

```jsx
// Change blue to another color
bg-blue-600 → bg-indigo-600
text-blue-600 → text-indigo-600
```

### Change Icons
Replace from `lucide-react`:

```jsx
// Import new icons
import { BarChart, TrendingUp, Download } from 'lucide-react';
```

### Change Layout
Modify grid columns in stat cards:

```jsx
// From 3 columns
grid-cols-1 md:grid-cols-3

// To 4 columns
grid-cols-1 md:grid-cols-2 lg:grid-cols-4
```

## Performance Optimization

### 1. Memoization
Already implemented with `useCallback` in hooks.

### 2. Lazy Loading
```jsx
import { lazy, Suspense } from 'react';

const AnalyticsPanel = lazy(() => import('./AnalyticsPanel'));

<Suspense fallback={<div>Loading...</div>}>
  <AnalyticsPanel />
</Suspense>
```

### 3. Code Splitting
Routes are automatically split by code bundler.

## Accessibility

Components include:
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance
- Loading state announcements

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Security Considerations

1. **Authentication**: Token stored in localStorage
2. **API Security**: Authorization headers on all requests
3. **Data Validation**: Form validation before submission
4. **CORS**: Configured on backend

## Known Limitations

1. Real-time analytics updates require WebSocket
2. Large datasets may need pagination
3. Export limited to CSV format
4. Quiz questions limited to 4 options each

## Troubleshooting

### Issue: Hooks not found
**Solution**: Ensure files are in correct directory:
```
frontend/src/hooks/useInstructorAPI.js
frontend/src/hooks/useAuth.js
```

### Issue: Components not rendering
**Solution**: Check imports are correct:
```jsx
import QuizForm from "../../components/instructor/QuizForm";
```

### Issue: API calls failing
**Solution**: Verify:
1. Backend server is running
2. Environment variables are set
3. API endpoints exist
4. Token is valid

### Issue: Styles not applied
**Solution**: 
1. Ensure Tailwind is configured
2. Check class names are correct
3. Clear browser cache

## Support

For issues or questions:
1. Check browser console for errors
2. Review backend API responses
3. Verify data structure matches expectations
4. Check network tab in DevTools

## Next Steps

After implementation:
1. Test all features thoroughly
2. Deploy to staging environment
3. Gather instructor feedback
4. Optimize based on usage patterns
5. Plan additional features
