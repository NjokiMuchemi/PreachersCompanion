import { useEffect, useState } from "react";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

import {
  Save,
  Download,
  Trash2,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  Heading1,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Palette,
  ImagePlus,
  BookOpen,
  Search,
  ArrowLeft,
} from "lucide-react";

import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Image from "@tiptap/extension-image";
import { Extension } from "@tiptap/core";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;


const FontSize = Extension.create({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize?.replace(/['"]+/g, ""),
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }

              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});

function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [existingCategories, setExistingCategories] = useState([]);
  const [scripture, setScripture] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [aiAction, setAiAction] = useState("outline");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");

  const [bibleReference, setBibleReference] = useState("");
  const [bibleResult, setBibleResult] = useState("");
  const [bibleLoading, setBibleLoading] = useState(false);
  const [bibleTranslation, setBibleTranslation] = useState("kjv");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Image,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: "",
    onUpdate: () => markUnsaved(),
  });

  useEffect(() => {
    fetchExistingCategories();
  }, []);

  useEffect(() => {
    if (id && editor) fetchSermon();
  }, [id, editor]);

  useEffect(() => {
    if (!id || !editor) return;

    const timer = setTimeout(() => {
      autoSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, category, scripture, tagsInput, editor?.getHTML()]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  function markUnsaved() {
    markUnsaved();
    setHasUnsavedChanges(true);
  }

  function getTagsArray() {
    return tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  async function fetchExistingCategories() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("sermons")
      .select("category")
      .eq("user_id", user.id)
      .neq("category", "");

    if (error) return;

    const uniqueCategories = [
      ...new Set((data || []).map((item) => item.category).filter(Boolean)),
    ];

    setExistingCategories(uniqueCategories);
  }

  async function fetchSermon() {
    const { data, error } = await supabase
      .from("sermons")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    setTitle(data.title || "");
    setCategory(data.category || "");
    setScripture(data.scripture || "");
    setTagsInput((data.tags || []).join(", "));
    editor.commands.setContent(data.content || "");
    setSaveStatus("Saved");
    setHasUnsavedChanges(false);
  }

  async function autoSave() {
    if (!id || !title.trim()) return;

    setSaveStatus("Auto-saving...");

    const content = editor?.getHTML() || "";

    const { error } = await supabase
      .from("sermons")
      .update({
        title,
        category,
        scripture,
        tags: getTagsArray(),
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      setSaveStatus("Auto-save failed");
      return;
    }

    setSaveStatus("Auto-saved");
    setHasUnsavedChanges(false);
  }

  async function lookupBibleVerse() {
    if (!bibleReference.trim()) {
      alert("Enter a Bible reference, e.g. John 3:16");
      return;
    }

    setBibleLoading(true);
    setBibleResult("");

    try {
      const response = await fetch(
        `https://bible-api.com/${encodeURIComponent(
          bibleReference
        )}?translation=${bibleTranslation}`
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        alert(data.error || "Verse not found.");
        setBibleLoading(false);
        return;
      }

      setBibleResult(
        `${data.reference} (${bibleTranslation.toUpperCase()})\n${data.text.trim()}`
      );
    } catch {
      alert("Could not fetch Bible verse. Check your internet connection.");
    }

    setBibleLoading(false);
  }

  async function runAiAssistant() {
    if (!editor) return;

    setAiLoading(true);
    setAiResult("");

    try {
      const response = await fetch("/api/sermon-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: aiAction,
          prompt: aiPrompt,
          sermonText: editor.getText(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "AI assistant failed.");
        setAiLoading(false);
        return;
      }

      setAiResult(data.result || "");
    } catch {
      alert("Could not reach AI assistant.");
    }

    setAiLoading(false);
  }

  function insertAiResult() {
    if (!aiResult || !editor) return;

    const formatted = aiResult
      .split("\n")
      .map((line) => `<p>${line || "&nbsp;"}</p>`)
      .join("");

    editor.chain().focus().insertContent(formatted).run();

    markUnsaved();
  }

  function insertBibleVerse() {
    if (!bibleResult || !editor) return;

    const safeVerse = bibleResult.replace(/\n/g, "<br />");

    editor
      .chain()
      .focus()
      .insertContent(`<blockquote>${safeVerse}</blockquote>`)
      .run();

    markUnsaved();
  }

  async function handlePdfImport(event) {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.name.endsWith(".pdf")) {
      alert("Please upload a PDF document.");
      return;
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();

      const pageText = textContent.items.map((item) => item.str).join(" ");

      fullText += `<p>${pageText}</p>`;
    }

    editor.chain().focus().insertContent(fullText).run();

    if (!title.trim()) {
      setTitle(file.name.replace(".pdf", ""));
    }

    markUnsaved();
  }

  async function handleWordImport(event) {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.name.endsWith(".docx")) {
      alert("Please upload a Word document ending with .docx");
      return;
    }

    const arrayBuffer = await file.arrayBuffer();

    const result = await mammoth.convertToHtml({
      arrayBuffer,
    });

    const html = result.value;

    editor.chain().focus().insertContent(html).run();

    if (!title.trim()) {
      const cleanFileName = file.name.replace(".docx", "");
      setTitle(cleanFileName);
    }

    markUnsaved();
  }

  async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in to upload images.");
      return;
    }

    const fileName = `${user.id}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("sermon-images")
      .upload(fileName, file);

    if (error) {
      alert(error.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("sermon-images")
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    editor
      .chain()
      .focus()
      .insertContent(`<img src="${imageUrl}" alt="sermon image" />`)
      .run();

    markUnsaved();
  }

  async function handleSave() {
    const content = editor?.getHTML() || "";

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in.");
      return;
    }

    if (!title.trim()) {
      alert("Please enter sermon title.");
      return;
    }

    if (id) {
      const { error } = await supabase
        .from("sermons")
        .update({
          title,
          category,
          scripture,
          tags: getTagsArray(),
          content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        alert(error.message);
        return;
      }

      setSaveStatus("Saved");
      setHasUnsavedChanges(false);
      alert("Sermon saved successfully!");
      navigate("/dashboard");
      return;
    }

    const { error } = await supabase.from("sermons").insert([
      {
        user_id: user.id,
        title,
        category,
        scripture,
        tags: getTagsArray(),
        content,
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    setSaveStatus("Saved");
    setHasUnsavedChanges(false);
    alert("Sermon saved successfully!");
    navigate("/dashboard");
  }

  async function handleDelete() {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this sermon?"
    );

    if (!confirmDelete) return;

    const secondConfirm = prompt("Type DELETE to permanently remove this sermon.");

    if (secondConfirm !== "DELETE") {
      alert("Deletion cancelled.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("sermons")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Sermon deleted successfully.");
    navigate("/dashboard");
  }

  function exportPDF() {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const margin = 20;
    const pageWidth = 170;
    const pageHeight = 270;
    let y = 25;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);

    const titleLines = doc.splitTextToSize(title || "Untitled Sermon", pageWidth);
    doc.text(titleLines, margin, y);

    y += titleLines.length * 9 + 6;

    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(1);
    doc.line(margin, y, 190, y);

    y += 12;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`Category: ${category || "-"}`, margin, y);

    y += 8;
    doc.text(`Scripture: ${scripture || "-"}`, margin, y);

    y += 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);

    const textContent = editor?.getText() || "";
    const paragraphs = textContent.split("\n");

    paragraphs.forEach((paragraph) => {
      const lines = doc.splitTextToSize(paragraph, pageWidth);

      lines.forEach((line) => {
        if (y > pageHeight) {
          doc.addPage();
          y = 25;
        }

        doc.text(line, margin, y);
        y += 7;
      });

      y += 4;
    });

    doc.save(`${title || "sermon"}.pdf`);
  }

  async function exportWord() {
    const textContent = editor?.getText() || "";

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: title || "Untitled Sermon",
                  bold: true,
                  size: 40,
                }),
              ],
              spacing: { after: 300 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Category: ${category || "-"}`,
                  bold: true,
                }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Scripture: ${scripture || "-"}`,
                  italics: true,
                }),
              ],
              spacing: { after: 400 },
            }),
            ...textContent.split("\n").map(
              (line) =>
                new Paragraph({
                  children: [new TextRun({ text: line, size: 26 })],
                  spacing: { after: 180 },
                })
            ),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${title || "sermon"}.docx`);
  }

  return (
    <div style={pageStyle}>
      <div style={topBarStyle}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            style={dashboardButton}
            onClick={async () => {
              if (hasUnsavedChanges) {
                const shouldSave = window.confirm(
                  "You have unsaved changes. Click OK to save before leaving, or Cancel to leave without saving."
                );

                if (shouldSave) {
                  await handleSave();
                  return;
                }
              }

              navigate("/dashboard");
            }}
          >
            <ArrowLeft size={18} />
            Dashboard
          </button>

          <div>
            <h1 style={headingStyle}>{id ? "Edit Sermon" : "Sermon Editor"}</h1>

            <p style={subtitleStyle}>
              Prepare and organize your ministry messages.
            </p>

            <p style={saveStatusStyle}>{saveStatus}</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button style={secondaryButton} onClick={exportPDF}>
            <Download size={18} /> PDF
          </button>

          <button style={secondaryButton} onClick={exportWord}>
            <Download size={18} /> Word
          </button>

          {id && (
            <button style={deleteButton} onClick={handleDelete}>
              <Trash2 size={18} /> Delete
            </button>
          )}

          <button style={primaryButton} onClick={handleSave}>
            <Save size={18} />
            "Save Sermon"
          </button>
        </div>
      </div>

      <div style={cardStyle}>
        <input
          type="text"
          placeholder="Sermon Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            markUnsaved();
          }}
          style={titleInput}
        />

        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            markUnsaved();
          }}
          style={inputStyle}
        >
          <option value="">Select existing category or type new below</option>
          {existingCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Or type a new category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            markUnsaved();
          }}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Scripture References"
          value={scripture}
          onChange={(e) => {
            setScripture(e.target.value);
            markUnsaved();
          }}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Tags e.g. faith, prayer, leadership, youth"
          value={tagsInput}
          onChange={(e) => {
            setTagsInput(e.target.value);
            markUnsaved();
          }}
          style={inputStyle}
        />
      </div>

      {false && (
        <div style={aiCard}>
          <div style={aiHeader}>
            <strong>AI Sermon Assistant</strong>
          </div>

          <div style={aiRow}>
            <select
              value={aiAction}
              onChange={(e) => setAiAction(e.target.value)}
              style={aiSelect}
            >
              <option value="outline">Generate Sermon Outline</option>
              <option value="expand">Expand Sermon Point</option>
              <option value="prayer">Create Prayer Points</option>
              <option value="altar">Create Altar Call</option>
              <option value="summary">Summarize Sermon</option>
              <option value="cleanup">Clean Up Notes</option>
            </select>

            <button style={aiButton} onClick={runAiAssistant}>
              {aiLoading ? "Working..." : "Generate"}
            </button>
          </div>

          <textarea
            placeholder="Optional instruction e.g. make it suitable for youth, Sunday service, leadership class..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            style={aiPromptBox}
          />

          {aiResult && (
            <div style={aiResultBox}>
              <pre style={aiResultText}>{aiResult}</pre>

              <button style={insertAiButton} onClick={insertAiResult}>
                Insert Into Sermon
              </button>
            </div>
          )}
        </div>
      )}

      <div style={bibleCard}>
        <div style={bibleHeader}>
          <BookOpen size={20} />
          <strong>Bible Lookup</strong>
        </div>

        <div style={bibleSearchRow}>
          <input
            type="text"
            placeholder="Enter verse e.g. John 3:16"
            value={bibleReference}
            onChange={(e) => setBibleReference(e.target.value)}
            style={bibleInput}
          />

          <select
            value={bibleTranslation}
            onChange={(e) => setBibleTranslation(e.target.value)}
            style={translationSelect}
          >
            <option value="kjv">KJV</option>
            <option value="web">WEB</option>
            <option value="bbe">BBE</option>
            <option value="asv">ASV</option>
          </select>

          <button style={bibleButton} onClick={lookupBibleVerse}>
            <Search size={18} />
            {bibleLoading ? "Searching..." : "Search"}
          </button>

          <button style={insertVerseButton} onClick={insertBibleVerse}>
            Insert Verse
          </button>
        </div>

        {bibleResult && <pre style={bibleResultBox}>{bibleResult}</pre>}
      </div>

      <div style={editorCard}>
        <div style={toolbarStyle}>
          <button style={toolButton} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold size={18} />
          </button>

          <button style={toolButton} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic size={18} />
          </button>

          <button style={toolButton} onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <UnderlineIcon size={18} />
          </button>

          <button style={toolButton} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
            <Heading1 size={18} />
          </button>

          <button style={toolButton} onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <List size={18} />
          </button>

          <button style={toolButton} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
            <AlignLeft size={18} />
          </button>

          <button style={toolButton} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
            <AlignCenter size={18} />
          </button>

          <button style={toolButton} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
            <AlignRight size={18} />
          </button>

          <button style={toolButton} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
            <AlignJustify size={18} />
          </button>

          <label style={colorLabel}>
            <Palette size={18} />
            Text
            <input
              type="color"
              defaultValue="#ffffff"
              onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
              style={colorInput}
            />
          </label>

          <button style={toolButton} onClick={() => editor.chain().focus().unsetColor().run()}>
            Clear Color
          </button>

          <label style={colorLabel}>
            <Highlighter size={18} />
            Highlight
            <input
              type="color"
              defaultValue="#fef08a"
              onChange={(e) =>
                editor
                  .chain()
                  .focus()
                  .toggleHighlight({ color: e.target.value })
                  .run()
              }
              style={colorInput}
            />
          </label>

          <button style={toolButton} onClick={() => editor.chain().focus().unsetHighlight().run()}>
            Clear Highlight
          </button>

          <label style={imageUploadLabel}>
            <ImagePlus size={18} />
            Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </label>

          <label style={importWordLabel}>
            Import Word
            <input
              type="file"
              accept=".docx"
              onChange={handleWordImport}
              style={{ display: "none" }}
            />
          </label>

          <label style={importPdfLabel}>
            Import PDF
            <input
              type="file"
              accept=".pdf"
              onChange={handlePdfImport}
              style={{ display: "none" }}
            />
          </label>

          <select
            style={selectStyle}
            onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
            defaultValue=""
          >
            <option value="" disabled>
              Font
            </option>
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Verdana">Verdana</option>
            <option value="Courier New">Courier New</option>
</select>

          <select
            style={selectStyle}
            onChange={(e) =>
              editor.chain().focus().setFontSize(e.target.value).run()
            }
            defaultValue=""
          >
            <option value="" disabled>Size</option>
            <option value="8px">8</option>
            <option value="9px">9</option>
            <option value="10px">10</option>
            <option value="11px">11</option>
            <option value="12px">12</option>
            <option value="14px">14</option>
            <option value="16px">16</option>
            <option value="18px">18</option>
            <option value="20px">20</option>
            <option value="24px">24</option>
            <option value="28px">28</option>
            <option value="32px">32</option>
            <option value="36px">36</option>
            <option value="48px">48</option>
            <option value="60px">60</option>
            <option value="72px">72</option>
          </select>

        </div>

        <EditorContent
          editor={editor}
          className="sermon-editor"
          style={editorContentStyle}
        />
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#020617",
  color: "white",
  padding: "40px",
  fontFamily: "Arial, sans-serif",
};

const topBarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "30px",
  gap: "20px",
};

const headingStyle = { margin: 0, fontSize: "48px", lineHeight: "1.1" };
const subtitleStyle = { color: "#94a3b8", marginTop: "10px" };
const saveStatusStyle = { color: "#f59e0b", fontSize: "14px", marginTop: "5px" };

const cardStyle = {
  background: "#0f172a",
  padding: "25px",
  borderRadius: "16px",
  border: "1px solid #1e293b",
  marginBottom: "25px",
};

const aiCard = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  padding: "20px",
  borderRadius: "16px",
  marginBottom: "25px",
};

const aiHeader = {
  color: "#f59e0b",
  marginBottom: "15px",
  fontSize: "18px",
};

const aiRow = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginBottom: "12px",
};

const aiSelect = {
  flex: 1,
  minWidth: "240px",
  background: "#1e293b",
  color: "white",
  border: "1px solid #334155",
  padding: "12px",
  borderRadius: "10px",
  fontSize: "16px",
};

const aiButton = {
  background: "#f59e0b",
  color: "#000",
  border: "none",
  padding: "12px 16px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
};

const aiPromptBox = {
  width: "100%",
  minHeight: "80px",
  background: "#020617",
  color: "white",
  border: "1px solid #334155",
  borderRadius: "10px",
  padding: "12px",
  fontSize: "15px",
  boxSizing: "border-box",
  marginBottom: "12px",
};

const aiResultBox = {
  background: "#020617",
  border: "1px solid #334155",
  borderRadius: "10px",
  padding: "15px",
  marginTop: "12px",
};

const aiResultText = {
  whiteSpace: "pre-wrap",
  color: "#e5e7eb",
  lineHeight: "1.6",
  margin: 0,
};

const insertAiButton = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  marginTop: "12px",
};

const bibleCard = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  padding: "20px",
  borderRadius: "16px",
  marginBottom: "25px",
};

const bibleHeader = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "15px",
  color: "#f59e0b",
};

const bibleSearchRow = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
};

const bibleInput = {
  flex: 1,
  minWidth: "240px",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "#1e293b",
  color: "white",
  fontSize: "16px",
};

const translationSelect = {
  background: "#1e293b",
  color: "white",
  border: "1px solid #334155",
  padding: "12px",
  borderRadius: "10px",
  fontSize: "16px",
};

const bibleButton = {
  background: "#f59e0b",
  color: "#000",
  border: "none",
  padding: "12px 16px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const insertVerseButton = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "12px 16px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
};

const bibleResultBox = {
  background: "#020617",
  border: "1px solid #334155",
  padding: "15px",
  borderRadius: "10px",
  marginTop: "15px",
  color: "#e5e7eb",
  whiteSpace: "pre-wrap",
  lineHeight: "1.6",
};

const editorCard = {
  background: "#0f172a",
  borderRadius: "16px",
  border: "1px solid #1e293b",
  overflow: "hidden",
};

const toolbarStyle = {
  display: "flex",
  gap: "10px",
  padding: "15px",
  borderBottom: "1px solid #1e293b",
  background: "#111827",
  flexWrap: "wrap",
};

const toolButton = {
  background: "#1e293b",
  border: "1px solid #334155",
  color: "white",
  padding: "10px",
  borderRadius: "8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
};

const selectStyle = {
  background: "#1e293b",
  color: "white",
  border: "1px solid #334155",
  padding: "10px",
  borderRadius: "8px",
  cursor: "pointer",
};

const colorLabel = {
  background: "#1e293b",
  border: "1px solid #334155",
  color: "white",
  padding: "8px 10px",
  borderRadius: "8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "14px",
};

const imageUploadLabel = {
  background: "#2563eb",
  color: "white",
  padding: "10px 14px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "bold",
  border: "1px solid #1d4ed8",
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

const importWordLabel = {
  background: "#7c3aed",
  color: "white",
  padding: "10px 14px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "bold",
  border: "1px solid #6d28d9",
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

const importPdfLabel = {
  background: "#be123c",
  color: "white",
  padding: "10px 14px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "bold",
  border: "1px solid #9f1239",
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

const colorInput = {
  width: "28px",
  height: "28px",
  border: "none",
  padding: 0,
  background: "transparent",
  cursor: "pointer",
};

const editorContentStyle = {
  minHeight: "500px",
  background: "#020617",
  color: "white",
  fontSize: "17px",
  lineHeight: "1.7",
};

const titleInput = {
  width: "100%",
  padding: "18px",
  marginBottom: "20px",
  borderRadius: "12px",
  border: "1px solid #334155",
  background: "#1e293b",
  color: "white",
  fontSize: "28px",
  fontWeight: "bold",
  boxSizing: "border-box",
};

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginBottom: "16px",
  borderRadius: "10px",
  border: "1px solid #334155",
  background: "#1e293b",
  color: "white",
  fontSize: "16px",
  boxSizing: "border-box",
};

const primaryButton = {
  background: "#f59e0b",
  color: "#000",
  border: "none",
  padding: "12px 18px",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const secondaryButton = {
  background: "#1e293b",
  color: "white",
  border: "1px solid #334155",
  padding: "12px 18px",
  borderRadius: "10px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const deleteButton = {
  background: "#dc2626",
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: "10px",
  fontWeight: "bold",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const dashboardButton = {
  background: "#1e293b",
  color: "white",
  border: "1px solid #334155",
  padding: "12px 16px",
  borderRadius: "10px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontWeight: "bold",
};

export default Editor;