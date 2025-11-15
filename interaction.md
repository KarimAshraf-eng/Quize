# Quiz Website Interaction Design

## Core Functionality Overview
The website provides an interactive quiz experience for lecture-based questions with bilingual support (English/Arabic) and comprehensive tracking features.

## Main Components

### 1. Lecture Selection (Landing Page)
- **Dynamic Lecture Detection**: Automatically detects available JSON files (Lecture_1.json through Lecture_20.json)
- **Lecture Cards**: Display lecture number and total question count
- **Visual Feedback**: Hover effects and smooth transitions
- **Error Handling**: Graceful handling of missing files

### 2. Quiz Interface
- **Single Question View**: One question displayed at a time
- **Language Toggle**: Switch between English and Arabic for questions and choices
- **Answer Selection**: Click to select answer with visual feedback
- **OK Button**: Appears after selection, triggers answer evaluation
- **Progress Tracking**: Visual progress indicator

### 3. Answer Evaluation System
- **Correct Answer**: Green highlight, show correct explanation
- **Wrong Answer**: Red highlight for selected, green for correct, show all explanations
- **Explanation Toggle**: Switch between Arabic and English explanations
- **Navigation**: Next/Back buttons with state preservation

### 4. Dashboard & Results
- **Performance Summary**: Correct/incorrect count and percentage
- **Question Review**: Detailed list of all questions with status
- **Favorite Questions**: Star system to mark important questions
- **Error Review Mode**: Option to retry only incorrect answers
- **Favorite Review**: Access starred questions separately

## Interactive Elements

### Navigation Flow
1. **Landing → Quiz**: Click lecture card
2. **Quiz → Dashboard**: Complete all questions or click "Finish"
3. **Dashboard → Quiz**: Review errors or favorites
4. **Any → Home**: Return to lecture selection

### User Interactions
- **Lecture Selection**: Click card to start quiz
- **Question Navigation**: Next/Back buttons
- **Answer Selection**: Click choice, then OK button
- **Language Toggle**: Switch between EN/AR
- **Star Toggle**: Click star to favorite/unfavorite question
- **Explanation Toggle**: Switch explanation language
- **Reset Session**: Clear current progress
- **Review Modes**: Error review, favorite review

### State Management
- **LocalStorage**: Save favorites, session progress
- **Session State**: Current question, answers, navigation history
- **Progress Tracking**: Answered questions, correct/incorrect status
- **Language Preference**: Remember user's language choice

## Visual Feedback
- **Animations**: Smooth transitions, fade-ins, bounce effects
- **Color Coding**: Green (correct), Red (incorrect), Yellow (favorite)
- **Progress Indicators**: Question counter, progress bar
- **Loading States**: Smooth loading for JSON files
- **Responsive Design**: Mobile-optimized interactions

## Error Handling
- **Missing JSON Files**: Skip unavailable lectures
- **Network Issues**: Retry mechanisms with user feedback
- **Invalid Data**: Graceful degradation for malformed JSON
- **Storage Issues**: Fallback for localStorage limitations