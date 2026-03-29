import "./globals.css";

export const metadata = {
  title: "VisualIntel — AI Object Detection",
  description:
    "Upload an image and let AI detect every object in it. Powered by DETR (facebook/detr-resnet-50) with real-time bounding box visualization.",
  keywords: ["object detection", "AI", "DETR", "computer vision", "image analysis"],
  authors: [{ name: "VisualIntel" }],
  openGraph: {
    title: "VisualIntel — AI Object Detection",
    description: "AI-powered object detection with real-time bounding box visualization.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-obsidian text-ghost-white relative overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
