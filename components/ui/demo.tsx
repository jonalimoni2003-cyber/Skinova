"use client";

import { useCharacterLimit } from "@/components/hooks/use-character-limit";
import { useImageUpload } from "@/components/hooks/use-image-upload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, ImagePlus, X, Sparkles, Sidebar } from "lucide-react";
import { useId, useState } from "react";
import Frame760 from "@/components/ui/sidebar-component";

function Component() {
  const id = useId();

  const maxLength = 180;
  const {
    value,
    characterCount,
    handleChange,
    maxLength: limit,
  } = useCharacterLimit({
    maxLength,
    initialValue:
      "Hey, I am Margaret, a web developer who loves turning ideas into amazing websites!",
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto h-11 px-6 rounded-full border-neutral-300 hover:border-neutral-500 font-sans text-xs uppercase tracking-wider transition-all">Edit Profile Settings</Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 overflow-y-visible p-0 sm:max-w-lg [&>button:last-child]:top-3.5 bg-white rounded-xl shadow-2xl border border-neutral-200">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b border-neutral-150 px-6 py-4 text-base font-sans font-semibold text-neutral-900">
            Edit profile
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="sr-only">
          Make changes to your profile here. You can change your photo and set a username.
        </DialogDescription>
        <div className="overflow-y-auto max-h-[500px]">
          <ProfileBg defaultImage="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=512&auto=format&fit=crop&q=80" />
          <Avatar defaultImage="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80" />
          <div className="px-6 pb-6 pt-4">
            <div className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`${id}-first-name`}>First name</Label>
                  <Input
                    id={`${id}-first-name`}
                    placeholder="Matt"
                    defaultValue="Margaret"
                    type="text"
                    required
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`${id}-last-name`}>Last name</Label>
                  <Input
                    id={`${id}-last-name`}
                    placeholder="Welsh"
                    defaultValue="Villard"
                    type="text"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-username`}>Username</Label>
                <div className="relative">
                  <Input
                    id={`${id}-username`}
                    className="peer pe-9"
                    placeholder="Username"
                    defaultValue="margaret-villard-69"
                    type="text"
                    required
                  />
                  <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-muted-foreground/80 peer-disabled:opacity-50">
                    <Check
                      size={16}
                      strokeWidth={2}
                      className="text-emerald-500"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-website`}>Website</Label>
                <div className="flex rounded-lg shadow-sm shadow-black/5">
                  <span className="-z-10 inline-flex items-center rounded-s-lg border border-input bg-neutral-100 px-3 text-sm text-neutral-500">
                    https://
                  </span>
                  <Input
                    id={`${id}-website`}
                    className="-ms-px rounded-s-none shadow-none"
                    placeholder="yourwebsite.com"
                    defaultValue="www.margaret.com"
                    type="text"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${id}-bio`}>Biography</Label>
                <Textarea
                  id={`${id}-bio`}
                  placeholder="Write a few sentences about yourself"
                  defaultValue={value}
                  maxLength={maxLength}
                  onChange={handleChange}
                  aria-describedby={`${id}-description`}
                />
                <p
                  id={`${id}-description`}
                  className="mt-2 text-right text-xs text-neutral-400"
                  role="status"
                  aria-live="polite"
                >
                  <span className="tabular-nums font-mono">{limit - characterCount}</span> characters left
                </p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="border-t border-neutral-150 px-6 py-4 bg-neutral-50">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button">Save changes</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProfileBg({ defaultImage }: { defaultImage?: string }) {
  const [hideDefault, setHideDefault] = useState(false);
  const { previewUrl, fileInputRef, handleThumbnailClick, handleFileChange, handleRemove } =
    useImageUpload();

  const currentImage = previewUrl || (!hideDefault ? defaultImage : null);

  const handleImageRemove = () => {
    handleRemove();
    setHideDefault(true);
  };

  return (
    <div className="h-32">
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-neutral-150 bg-neutral-100">
        {currentImage && (
          <img
            className="h-full w-full object-cover"
            src={currentImage}
            alt={previewUrl ? "Preview of uploaded image" : "Default profile background"}
            width={512}
            height={96}
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <button
            type="button"
            className="z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
            onClick={handleThumbnailClick}
            aria-label={currentImage ? "Change image" : "Upload image"}
          >
            <ImagePlus size={16} strokeWidth={2} aria-hidden="true" />
          </button>
          {currentImage && (
            <button
              type="button"
              className="z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
              onClick={handleImageRemove}
              aria-label="Remove image"
            >
              <X size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        aria-label="Upload image file"
      />
    </div>
  );
}

function Avatar({ defaultImage }: { defaultImage?: string }) {
  const { previewUrl, fileInputRef, handleThumbnailClick, handleFileChange } = useImageUpload();

  const currentImage = previewUrl || defaultImage;

  return (
    <div className="-mt-10 px-6">
      <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-neutral-100 shadow-sm shadow-black/10">
        {currentImage && (
          <img
            src={currentImage}
            className="h-full w-full object-cover"
            width={80}
            height={80}
            alt="Profile image"
          />
        )}
        <button
          type="button"
          className="absolute flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-offset-2 transition-colors hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70"
          onClick={handleThumbnailClick}
          aria-label="Change profile picture"
        >
          <ImagePlus size={16} strokeWidth={2} aria-hidden="true" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
          aria-label="Upload profile picture"
        />
      </div>
    </div>
  );
}

// Sidebar Wrapper Demo
export default function DemoOne() {
  const [activeTab, setActiveTab] = useState<"sidebar" | "profile">("sidebar");

  return (
    <div className="bg-[#111111] min-h-screen relative text-neutral-200 font-sans">
      {/* Playground Selector */}
      <div className="max-w-7xl mx-auto px-6 py-6 border-b border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-serif font-light text-white tracking-widest uppercase flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E6C79C]" />
            Component Playground
          </h2>
          <p className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider mt-1">OriginUI & Carbon Sidebar Live Integration</p>
        </div>
        <div className="flex bg-neutral-900 border border-neutral-800 p-1 rounded-full gap-1">
          <button
            onClick={() => setActiveTab("sidebar")}
            className={`px-4 py-1.5 text-xs font-medium uppercase tracking-wider rounded-full transition-all cursor-pointer flex items-center gap-2 ${activeTab === "sidebar" ? "bg-white text-black" : "text-neutral-400 hover:text-white"}`}
          >
            <Sidebar className="w-3.5 h-3.5" />
            Carbon Sidebar
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-1.5 text-xs font-medium uppercase tracking-wider rounded-full transition-all cursor-pointer flex items-center gap-2 ${activeTab === "profile" ? "bg-white text-black" : "text-neutral-400 hover:text-white"}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Profile Dialog
          </button>
        </div>
      </div>

      {/* Main Display Frame */}
      <div className="max-w-7xl mx-auto px-6 py-12 flex items-center justify-center">
        {activeTab === "sidebar" ? (
          <div className="w-full flex justify-center">
            <Frame760 />
          </div>
        ) : (
          <div className="bg-neutral-900/40 p-12 rounded-3xl border border-neutral-800 text-center space-y-6 max-w-xl w-full">
            <div className="w-12 h-12 rounded-full bg-[#E6C79C]/10 flex items-center justify-center text-[#E6C79C] mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-serif text-white font-light">Interactive Profile Overlay</h3>
              <p className="text-xs text-neutral-400 font-light leading-relaxed">
                Click below to launch the modal dialog. Includes rich state handlers, custom character limitation checks, and secure mock uploads with background assets.
              </p>
            </div>
            <div className="pt-2">
              <Component />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { Component };
