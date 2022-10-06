import express from "express";
import CtNoteType from "./noteType/ctNoteType";
import CtNote from "./note/ctNote";

const notesRouter = express.Router();

notesRouter.get("/note-types", CtNoteType.getAllNoteTypes);
notesRouter.post("/note-types", CtNoteType.addNoteSubType);
notesRouter.put("/note-types", CtNoteType.updateNoteSubType);
notesRouter.delete("/note-types/:ntId", CtNoteType.deleteNoteSubtype);

notesRouter.post("/notes", CtNote.createNote);
notesRouter.put("/notes/:nId", CtNote.updateNote);
notesRouter.get("/notes/:nRecordId/:nScope", CtNote.getNotes);
notesRouter.get("/notes/:nRecordId", CtNote.getNtSubTypes);
notesRouter.delete("/notes/:nId", CtNote.deleteNote);
export default notesRouter;
