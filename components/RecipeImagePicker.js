"use client";

import { ImagePlus, Pencil, Trash2 } from "lucide-react";
import NextImage from "next/image";
import { useRef } from "react";

export default function RecipeImagePicker({
  image,
  onChange,
  compact = false,
}) {
  const inputRef = useRef(null);

  function handleFile(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      window.alert("Choisis une image.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const img = document.createElement("img");

      img.onload = () => {
        const maxWidth = 1200;
        const maxHeight = 900;

        let width = img.width;
        let height = img.height;

        const ratio = Math.min(maxWidth / width, maxHeight / height, 1);

        width = Math.round(width * ratio);
        height = Math.round(height * ratio);

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext("2d");

        context.drawImage(img, 0, 0, width, height);

        const compressedImage = canvas.toDataURL("image/jpeg", 0.78);

        onChange(compressedImage);
      };

      img.src = reader.result;
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  }

  if (compact) {
    return (
      <div className="relative h-40 w-full sm:w-55">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
        />

        {image ? (
          <div className="group relative h-full w-full overflow-hidden rounded-xl border border-white/8 bg-surface-dark">
            <NextImage
              src={image}
              alt="Aperçu de la recette"
              fill
              unoptimized
              className="object-cover"
            />

            <div className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent" />

            <div className="absolute bottom-2 right-2 flex gap-1.5">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-black/55 text-muted backdrop-blur-md transition-colors hover:text-app-text"
                aria-label="Changer la photo"
              >
                <Pencil size={14} />
              </button>

              <button
                type="button"
                onClick={() => onChange("")}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/15 bg-black/55 text-red-300 backdrop-blur-md transition-colors hover:bg-red-500/15"
                aria-label="Supprimer la photo"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="group flex h-full w-full flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-surface-dark transition-colors hover:border-accent/30 hover:bg-accent/2.5 cursor-pointer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent-light">
              <ImagePlus size={17} />
            </div>

            <p className="mt-2 text-[11px] font-medium text-app-text">
              Ajouter une photo
            </p>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="h-full">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      {image ? (
        <div className="group relative h-42 overflow-hidden rounded-xl border border-white/8 bg-surface-dark">
          <NextImage
            src={image}
            alt="Aperçu de la recette"
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group flex h-42 w-full flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-surface-dark transition-colors hover:border-accent/30 hover:bg-accent/2.5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent-light">
            <ImagePlus size={18} />
          </div>

          <p className="mt-3 text-sm font-medium text-app-text">
            Ajouter une photo
          </p>

          <p className="mt-1 text-[11px] text-subtle">JPG, PNG, HEIC…</p>
        </button>
      )}
    </div>
  );
}
