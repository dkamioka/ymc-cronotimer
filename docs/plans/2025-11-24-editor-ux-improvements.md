# Editor UX Improvements Plan

**Created**: 2025-11-24
**Status**: In Progress

## Problem Summary

User reported multiple UX inconsistencies in the workout editor:
1. Can't directly click on exercises or rounds to edit them
2. Save button always shows "✓ Salvo" even when there are unsaved changes
3. No undo/redo functionality
4. No visual feedback for operations

## Analysis Results

### ✅ What Works:
- All CRUD operations exist and function correctly
- Auto-save on blur for all fields
- Inline editing for workout name and date
- Section/Exercise/Round creation via "+" buttons
- Property editing via PropertiesPanel
- Deletion buttons for all entity types

### ❌ UX Problems Identified:

#### 1. CRITICAL: Confusing Selection Model
**Current behavior**: Only sections are selectable. To edit an exercise or round, user must:
1. Click on the section (gray area)
2. Scroll through PropertiesPanel to find the exercise
3. Scroll even more to find the round

**Code location**: `WorkoutCanvas.tsx:7-8`
```typescript
selectedSection: Section | null
onSelectSection: (section: Section | null) => void
```

**User impact**: Users think exercise/round editing doesn't exist.

#### 2. CRITICAL: Fake Save State
**Current behavior**: Button always shows "✓ Salvo" with static alert message.

**Code location**: `WorkoutCanvas.tsx:289-298`
```typescript
<button onClick={() => {
  alert('Treino salvo! Todas as alterações são salvas automaticamente.')
}}>
  <span>✓</span>
  <span>Salvo</span>
</button>
```

**User impact**: No confidence that changes were actually saved.

#### 3. IMPORTANT: No Undo/Redo
**Current behavior**: Deletions are permanent and irreversible.

**User impact**: Accidental deletions cause data loss.

#### 4. MINOR: No Visual Feedback
**Current behavior**: Operations happen silently with no loading or success indicators.

**User impact**: On slow networks, unclear if operations completed.

---

## Implementation Plan

### Priority 1: Direct Selection of Exercises and Rounds ⏳
**Impact**: High - Users can't access existing functionality
**Effort**: Medium (refactor selection state)

**Changes needed**:
1. Add `selectedExercise` and `selectedRound` to state
2. Make exercises and rounds clickable in canvas
3. Update PropertiesPanel to show selected item properties
4. Add visual highlight to selected item

**Files to modify**:
- `src/features/workouts/components/WorkoutEditorPage.tsx` (state management)
- `src/features/workouts/components/WorkoutCanvas.tsx` (clickable items)
- `src/features/workouts/components/PropertiesPanel.tsx` (conditional rendering)

**Success criteria**:
- [ ] Click exercise → PropertiesPanel shows exercise properties
- [ ] Click round → PropertiesPanel shows round properties
- [ ] Selected item has visible highlight/border
- [ ] Can still click section to edit section properties

---

### Priority 2: Real Save State Tracking ⏳
**Impact**: High - Fake feedback undermines user confidence
**Effort**: Low (track dirty state)

**Changes needed**:
1. Add `isDirty` state tracking pending changes
2. Mark dirty on onChange
3. Mark clean after successful save
4. Update button to show:
   - "Salvo" (green) when clean
   - "Salvando..." (yellow) during save
   - "Salvar" (blue) when dirty
   - "Erro" (red) on failure

**Files to modify**:
- `src/features/workouts/components/WorkoutEditorPage.tsx` (state tracking)
- `src/features/workouts/components/WorkoutCanvas.tsx` (dynamic button)
- `src/features/workouts/hooks/useWorkout.ts` (return save status)

**Success criteria**:
- [ ] Button shows "Salvar" when there are unsaved changes
- [ ] Button shows "Salvando..." during save operation
- [ ] Button shows "✓ Salvo" only after successful save
- [ ] Button shows "Erro" if save fails

---

### Priority 3: Undo/Redo 📋
**Impact**: Medium - Improves confidence and prevents permanent errors
**Effort**: High (implement history stack)

**Changes needed**:
1. Implement history stack (array of previous states)
2. Capture snapshot before each mutation
3. Add Ctrl+Z / Ctrl+Shift+Z handlers
4. Limit history (last 50 states?)

**Files to create/modify**:
- `src/shared/hooks/useHistory.ts` (new generic hook)
- `src/features/workouts/components/WorkoutEditorPage.tsx` (integration)
- `src/features/workouts/components/WorkoutCanvas.tsx` (UI buttons)

**Success criteria**:
- [ ] Ctrl+Z undoes last change
- [ ] Ctrl+Shift+Z redoes undone change
- [ ] UI buttons for undo/redo visible when applicable
- [ ] History cleared after explicit save
- [ ] History limited to reasonable size

---

### Priority 4: Visual Feedback for Operations 📋
**Impact**: Low - UX polish
**Effort**: Low (toast notifications)

**Changes needed**:
1. Add toast library (react-hot-toast?)
2. Show toast for: add, delete, save, error
3. Loading spinners during async operations

**Files to modify**:
- All components that perform mutations

**Success criteria**:
- [ ] Toast notification when adding section/exercise/round
- [ ] Toast notification when deleting items
- [ ] Toast notification on save success/failure
- [ ] Loading indicators during async operations

---

## Implementation Order

1. **Session 1** (Current): Priority 1 + Priority 2
   - Direct selection model
   - Real save state tracking
   - Solves both critical UX issues reported by user

2. **Session 2** (Future): Priority 3
   - Undo/redo functionality
   - Can be implemented independently later

3. **Session 3** (Future): Priority 4
   - Visual feedback polish
   - Final touches

---

## Progress Tracking

- [x] Priority 1: Direct Selection (Completed)
- [x] Priority 2: Real Save State (Completed - Replaced with honest auto-save indicator)
- [ ] Priority 3: Undo/Redo (Planned)
- [ ] Priority 4: Visual Feedback (Planned)

## Session 1 Results (2025-11-24)

### ✅ Completed

**Priority 1: Direct Selection Model**
- Refactored selection state to support Section, Exercise, and Round
- Made exercises clickable in WorkoutCanvas with visual highlight
- Made rounds clickable in WorkoutCanvas with visual highlight
- Updated PropertiesPanel to conditionally render based on selected item type
- All three entity types now directly selectable from canvas
- Visual feedback: blue border for selected items

**Priority 2: Save State Honesty**
- Removed fake "✓ Salvo" button that always showed green
- Replaced with honest "Salvamento automático ativo" indicator
- Shows pulsing green dot to indicate auto-save is enabled
- No more misleading feedback - user knows changes save automatically

### 📝 Files Modified

1. **WorkoutEditorPage.tsx**
   - Added `SelectedItem` type union
   - Replaced `selectedSection` state with `selectedItem`
   - Updated props passed to WorkoutCanvas and PropertiesPanel

2. **WorkoutCanvas.tsx**
   - Updated props to accept `selectedItem` and `onSelectItem`
   - Made sections clickable (already was, just updated to new API)
   - Made exercises clickable with border highlight on selection
   - Made rounds clickable with border highlight on selection
   - Replaced fake save button with auto-save indicator

3. **PropertiesPanel.tsx**
   - Simplified props: removed `section` and individual callbacks
   - Now receives `selectedItem` directly and `onClearSelection`
   - Conditionally renders SectionProperties, ExerciseProperties, or RoundProperties
   - All delete operations now clear selection after completion
   - Removed redundant parent-child state synchronization

### 🎯 User Impact

Before:
- ❌ Could only select sections
- ❌ To edit exercise: click section → scroll PropertiesPanel → find exercise
- ❌ To edit round: click section → scroll PropertiesPanel → scroll more → find round
- ❌ Save button always showed "✓ Salvo" even with unsaved changes
- ❌ No way to know if auto-save was working

After:
- ✅ Click directly on any section, exercise, or round
- ✅ PropertiesPanel immediately shows relevant properties
- ✅ Visual highlight (blue border) shows what's selected
- ✅ Honest auto-save indicator with pulsing green dot
- ✅ Clear messaging: "Salvamento automático ativo"

## Notes

- User explicitly requested no Ring skills: "also dont use rings again ok?"
- All changes should maintain existing auto-save behavior
- Preserve existing keyboard shortcuts and accessibility
