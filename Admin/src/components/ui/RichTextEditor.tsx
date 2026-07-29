"use client";

import React, { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";
import { storage } from "@/lib/appwrite/client";
import { ID } from "appwrite";
import { Loader2 } from "lucide-react";

// Use react-quill-new since react-quill is unmaintained and causes issues with React 19
const ReactQuill = dynamic(() => import("react-quill-new"), { 
  ssr: false,
  loading: () => <div className="h-[300px] flex items-center justify-center bg-slate-50 border border-slate-200 rounded-md"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
});

const BUCKET_ID = "6a3e398000280b2b3d20";
const PROJECT_ID = "6a3bce6900381359c3ce";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const quillRef = useRef<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (!file) return;

      setIsUploading(true);
      try {
        const uploadedFile = await storage.createFile(BUCKET_ID, ID.unique(), file);
        const url = `https://sgp.cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${uploadedFile.$id}/view?project=${PROJECT_ID}`;

        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection(true);
          const position = range ? range.index : quill.getLength();
          quill.insertEmbed(position, "image", url);
        }
      } catch (error) {
        console.error("Image upload failed", error);
        alert("Failed to upload image. Please try again.");
      } finally {
        setIsUploading(false);
      }
    };
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ align: [] }],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link", "image"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler,
        },
      },
    }),
    []
  );

  return (
    <div className="relative">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder || "Write something amazing..."}
        className="bg-white min-h-[300px]"
      />
      
      <style dangerouslySetInnerHTML={{__html: `
        .ql-editor {
          min-height: 300px;
          font-size: 16px;
          line-height: 1.6;
          word-break: break-word;
          overflow-wrap: break-word;
        }
        .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin-top: 1rem;
          margin-bottom: 1rem;
        }
      `}} />

      {isUploading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="bg-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-[#F07B75]" />
            <span className="text-sm font-semibold text-slate-700">Uploading image...</span>
          </div>
        </div>
      )}
    </div>
  );
}
