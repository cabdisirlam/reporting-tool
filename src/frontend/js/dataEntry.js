/**
 * dataEntry.js - Data entry handlers
 */

const DataEntry = {
    autoSaveTimer: null,
    currentNote: null,

    init() {
        this.setupAutoSave();
    },

    setupAutoSave() {
        // Auto-save every 30 seconds
        this.autoSaveTimer = setInterval(() => {
            this.saveCurrentNote();
        }, 30000);
    },

    saveCurrentNote() {
        if (!this.currentNote) return;
        
        const data = this.collectFormData();
        
        google.script.run
            .withSuccessHandler(() => {
                console.log('Auto-saved');
            })
            .saveNoteData({
                entityId: this.currentEntityId,
                periodId: this.currentPeriodId,
                noteId: this.currentNote,
                noteData: data
            });
    },

    collectFormData() {
        // Collect form data
        return {};
    }
};
