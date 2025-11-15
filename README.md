# QuizMaster - Interactive Learning Platform

A comprehensive, bilingual (English/Arabic) interactive quiz platform designed for educational lectures. Built with modern web technologies and optimized for GitHub Pages deployment.

## Features

### 🎯 Core Functionality
- **Dynamic Lecture Detection**: Automatically loads available lecture JSON files
- **Bilingual Support**: Toggle between English and Arabic for questions and explanations
- **Interactive Quiz Flow**: Single-question view with immediate feedback
- **Comprehensive Explanations**: Detailed explanations for correct and incorrect answers
- **Progress Tracking**: Visual progress indicators and session management

### ⭐ Advanced Features
- **Favorite Questions**: Mark important questions with star system
- **Performance Dashboard**: Detailed results with statistics and review options
- **Error Review Mode**: Re-attempt only incorrectly answered questions
- **Favorites Review**: Practice marked questions separately
- **Local Storage**: Persistent session data and preferences

### 🎨 Design & UX
- **Modern UI**: Clean, responsive design with smooth animations
- **Interactive Elements**: Hover effects, transitions, and visual feedback
- **Mobile Optimized**: Fully responsive across all device sizes
- **Accessibility**: WCAG compliant with proper contrast and navigation

## File Structure

```
├── index.html              # Main application with all views
├── styles.css              # Complete styling with animations
├── app.js                  # Core JavaScript functionality
├── Lecture_1.json          # Sample lecture questions (5 questions)
├── Lecture_2.json          # Sample lecture questions (5 questions)
├── Lecture_3.json          # Sample lecture questions (5 questions)
├── design.md              # Design system documentation
├── interaction.md         # Interaction design specifications
├── outline.md             # Project structure outline
└── README.md              # This file
```

## JSON Format

Each lecture file should follow this structure:

```json
[
  {
    "question_number": 1,
    "lecture_number": 1,
    "question_en": "Question in English",
    "question_ar": "السؤال بالعربية",
    "choices": {
      "A_en": "Choice A English",
      "A_ar": "الاختيار أ عربي",
      "B_en": "Choice B English",
      "B_ar": "الاختيار ب عربي",
      "C_en": "Choice C English",
      "C_ar": "الاختيار ج عربي",
      "D_en": "Choice D English",
      "D_ar": "الاختيار د عربي"
    },
    "correct_choice": "B",
    "explanation_correct_en": "Correct explanation in English",
    "explanation_correct_ar": "الشرح الصحيح بالعربية",
    "explanation_wrong_en": {
      "A": "Why A is wrong",
      "B": "This is correct",
      "C": "Why C is wrong",
      "D": "Why D is wrong"
    },
    "explanation_wrong_ar": {
      "A": "لماذا أ خاطئ",
      "B": "هذا صحيح",
      "C": "لماذا ج خاطئ",
      "D": "لماذا د خاطئ"
    }
  }
]
```

## Deployment on GitHub Pages

### Method 1: Direct Upload
1. Create a new GitHub repository
2. Upload all files to the repository
3. Go to Settings → Pages
4. Select source branch (main/master)
5. Your site will be available at `https://username.github.io/repository-name`

### Method 2: Git CLI
```bash
# Initialize git repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial QuizMaster deployment"

# Add remote repository
git remote add origin https://github.com/username/repository-name.git

# Push to main branch
git push -u origin main
```

### Method 3: GitHub Desktop
1. Download and install GitHub Desktop
2. Create new repository
3. Add files to repository
4. Commit and publish to GitHub
5. Enable Pages in repository settings

## Usage Instructions

### For Students
1. **Getting Started**: Select a lecture from the landing page
2. **Taking Quiz**: Answer questions one by one with immediate feedback
3. **Language Toggle**: Click the translate button to switch between English/Arabic
4. **Mark Favorites**: Click the star icon to mark important questions
5. **Review Results**: View detailed performance statistics and explanations

### For Instructors
1. **Adding Lectures**: Create new JSON files following the naming convention `Lecture_X.json`
2. **Question Format**: Ensure all required fields are included in JSON structure
3. **Content Guidelines**: Provide clear explanations for both correct and incorrect answers
4. **Testing**: Verify all questions load correctly and display properly

## Browser Compatibility

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+

## Performance Features

- **Lazy Loading**: Progressive enhancement for optimal performance
- **Local Storage**: Client-side data persistence
- **Optimized Animations**: GPU-accelerated transforms
- **Responsive Images**: Adaptive image loading
- **Minimal Dependencies**: No external libraries required

## Accessibility Features

- **WCAG AA Compliance**: 4.5:1 color contrast ratio
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Focus Indicators**: Clear visual focus states
- **Text Scaling**: Browser zoom compatibility

## Troubleshooting

### Common Issues
1. **Lectures not loading**: Ensure JSON files are in the same directory
2. **Language not switching**: Check that both EN/AR fields exist in JSON
3. **Progress not saving**: Verify localStorage is enabled in browser
4. **Mobile display issues**: Clear browser cache and reload

### Browser Support
- Enable JavaScript for full functionality
- Allow localStorage for progress saving
- Use modern browsers for best experience

## Development

### Local Testing
```bash
# Start local server
python -m http.server 8000

# Open browser to http://localhost:8000
```

### Customization
- Modify colors in CSS custom properties
- Add new animations in styles.css
- Extend functionality in app.js
- Create custom lecture content following JSON format

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or contributions:
1. Check the troubleshooting section
2. Review the documentation files
3. Create an issue in the repository
4. Submit a pull request for improvements

---

**Built with ❤️ for education**