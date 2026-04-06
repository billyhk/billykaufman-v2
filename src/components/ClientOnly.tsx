"use client";

import dynamic from "next/dynamic";

export const OceanCanvas = dynamic(() => import("@/components/ocean/OceanCanvas"), { ssr: false });
export const ProjectsGallery = dynamic(() => import("@/components/ProjectsGallery"), { ssr: false });
