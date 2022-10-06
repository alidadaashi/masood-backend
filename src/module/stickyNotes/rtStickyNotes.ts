import express from "express";
import CtStickyNotes from "./ctStickyNotes";

const stickyNotesRouter = express.Router();

stickyNotesRouter.get("/all-sticky-notes", CtStickyNotes.getAllStickyNotes);
stickyNotesRouter.post("/sticky-notes", CtStickyNotes.getStickyNotes);
stickyNotesRouter.post("/send-sticky-note", CtStickyNotes.createStickyNote);
stickyNotesRouter.delete("/delete-sticky-note/:snId", CtStickyNotes.deleteStickyNote);
stickyNotesRouter.post("/update-sticky-note-status", CtStickyNotes.updateStickyNoteStatus);
export default stickyNotesRouter;
