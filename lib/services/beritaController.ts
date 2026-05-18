import type { NextFunction, Request, Response } from "express";

const prisma = require("../utils/prisma") as any;
const fs = require("fs");
const path = require("path");

type UploadRequest = Request & {
    files?: Array<{ filename: string }>;
    file?: { filename: string };
};

const uploadDir = path.join(process.cwd(), "public", "uploads", "berita");
console.log(`[beritaController] Upload directory: ${uploadDir}`);

const parseImageNames = (contentImages: unknown): string[] => {
    if (!contentImages) return [];

    return String(contentImages)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => path.basename(item));
};

    const extractImageNamesFromHtml = (html: unknown): string[] => {
        if (!html) return [];

        const text = String(html);
        // Match /uploads/berita/filename patterns, handling query params and fragments
        const matches = text.match(/\/uploads\/berita\/([^"'\s>]+?)(?:[?#]|>|$)/gi) || [];

        return matches
            .map((item) => {
                // Extract the path part before any query params or fragments
                const pathPart = item.split(/[?#]|>/)[0];
                return pathPart.split("/uploads/berita/").pop() || "";
            })
            .map((item) => path.basename(decodeURIComponent(item)))
            .filter(Boolean);
    };

const deleteFile = (fileName: string) => {
    if (!fileName) return;

    const safeName = path.basename(fileName);
    const realPath = path.join(uploadDir, safeName);
    
    console.log(`[deleteFile] Attempting to delete: ${realPath}`);
    
    if (fs.existsSync(realPath)) {
        try {
            fs.unlinkSync(realPath);
            console.log(`[deleteFile] ✓ Successfully deleted: ${realPath}`);
        } catch (error) {
            console.error(`[deleteFile] ✗ Failed to delete ${realPath}:`, error);
            // Don't re-throw - just log the error, deletion is non-critical
        }
    } else {
        console.warn(`[deleteFile] File not found: ${realPath}`);
    }
};

const createBerita = async (req: UploadRequest, res: Response, next: NextFunction) => {
    try {
        const { title, content, categoryId, tanggal, lokasi, isPublished } = req.body as Record<string, any>;

        let imageString = "";
        if (req.files && req.files.length > 0) {
            imageString = req.files.map((file) => file.filename).join(",");
        } else if (req.file) {
            imageString = req.file.filename;
        }

        const categoryIdNum = categoryId ? Number(categoryId) : null;
        if (categoryId && Number.isNaN(categoryIdNum)) {
            return res.status(400).json({ message: "categoryId tidak valid" });
        }

        if (categoryIdNum) {
            const category = await prisma.beritaCategory.findUnique({
                where: { id: categoryIdNum },
            });
            if (!category) {
                return res.status(400).json({ message: "Kategori tidak ditemukan" });
            }
        }

        const newBerita = await prisma.berita.create({
            data: {
                title,
                content_images: imageString,
                content,
                categoryId: categoryIdNum,
                tanggal: tanggal ? new Date(tanggal) : null,
                lokasi: lokasi || null,
                isPublished: isPublished === "true" || isPublished === true,
            },
            include: {
                category: true,
            },
        });

        res.status(201).json({
            status: "success",
            message: "Berita berhasil dibuat",
            data: newBerita,
        });
    } catch (error) {
        next(error as Error);
    }
};

const getBeritaAdmin = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const berita = await prisma.berita.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                category: true,
            },
        });

        res.json({ total: berita.length, data: berita });
    } catch (err) {
        next(err as Error);
    }
};

const publishBerita = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const berita = await prisma.berita.update({
            where: { id: Number(id) },
            data: { isPublished: true },
            include: { category: true },
        });
        res.json({ message: "Berita berhasil dipublikasikan", data: berita });
    } catch (err) {
        next(err as Error);
    }
};

const unpublishBerita = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const berita = await prisma.berita.update({
            where: { id: Number(id) },
            data: { isPublished: false },
            include: { category: true },
        });
        res.json({ message: "Berita berhasil disembunyikan", data: berita });
    } catch (err) {
        next(err as Error);
    }
};

const getBeritaPublic = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const berita = await prisma.berita.findMany({
            where: { isPublished: true },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                title: true,
                content: true,
                content_images: true,
                categoryId: true,
                category: {
                    select: { id: true, name: true },
                },
                tanggal: true,
                lokasi: true,
                createdAt: true,
            },
        });

        res.json({ total: berita.length, data: berita });
    } catch (err) {
        next(err as Error);
    }
};

const getBeritaByIdAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const berita = await prisma.berita.findUnique({
            where: { id: Number(id) },
            include: { category: true },
        });

        if (!berita) {
            // Idempotent delete: if record already gone, return success
            return res.status(200).json({ message: "Berita tidak ditemukan (sudah terhapus)" });
        }

        res.json(berita);
    } catch (err) {
        next(err as Error);
    }
};

const getBeritaByIdPublic = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const berita = await prisma.berita.findFirst({
            where: {
                id: Number(id),
                isPublished: true,
            },
            select: {
                id: true,
                title: true,
                content: true,
                content_images: true,
                categoryId: true,
                category: {
                    select: { id: true, name: true },
                },
                tanggal: true,
                lokasi: true,
                createdAt: true,
            },
        });

        if (!berita) {
            return res.status(404).json({ message: "Berita tidak ditemukan" });
        }

        res.json({ total: 1, data: berita });
    } catch (err) {
        next(err as Error);
    }
};

const updateBerita = async (req: UploadRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { title, content, categoryId, tanggal, lokasi, isPublished, keep_existing_images } = req.body as Record<string, any>;

        const berita = await prisma.berita.findUnique({ where: { id: Number(id) } });
        if (!berita) return res.status(404).json({ message: "Berita tidak ditemukan" });

        const existing = (berita.content_images || "")
            .split(",")
            .map((item: string) => item.trim())
            .filter(Boolean);

        let keepList: string[] = [];
        if (typeof keep_existing_images === "string" && keep_existing_images.length > 0) {
            try {
                if (keep_existing_images.trim().startsWith("[")) {
                    keepList = JSON.parse(keep_existing_images).map((item: string) => String(item).trim()).filter(Boolean);
                } else {
                    keepList = keep_existing_images.split(",").map((item: string) => item.trim()).filter(Boolean);
                }
            } catch {
                keepList = keep_existing_images.split(",").map((item: string) => item.trim()).filter(Boolean);
            }
        }

        const newImages = Array.isArray(req.files) && req.files.length > 0
            ? req.files.map((file) => file.filename)
            : (req.file ? [req.file.filename] : []);

        const finalImages = Array.from(
            new Set([
                ...keepList,
                ...newImages,
            ].map((item) => path.basename(item)).filter(Boolean))
        );

        const previousContentImages = [
            ...existing,
            ...extractImageNamesFromHtml(berita.content),
        ];
        const nextContentImages = [
            ...finalImages,
            ...extractImageNamesFromHtml(content),
        ];
        const staleFiles = Array.from(new Set(previousContentImages.filter((item) => !nextContentImages.includes(item))));

        staleFiles.forEach((file: string) => {
            const oldPath = path.join(uploadDir, file);
            if (fs.existsSync(oldPath)) {
                try {
                    fs.unlinkSync(oldPath);
                } catch {}
            }
        });

        const categoryIdNum = categoryId ? Number(categoryId) : null;
        if (categoryId && Number.isNaN(categoryIdNum)) {
            return res.status(400).json({ message: "categoryId tidak valid" });
        }

        if (categoryIdNum) {
            const category = await prisma.beritaCategory.findUnique({
                where: { id: categoryIdNum },
            });
            if (!category) {
                return res.status(400).json({ message: "Kategori tidak ditemukan" });
            }
        }

        const updated = await prisma.berita.update({
            where: { id: Number(id) },
            data: {
                title: title ?? berita.title,
                content: content ?? berita.content,
                categoryId: categoryId !== undefined ? categoryIdNum : berita.categoryId,
                tanggal: tanggal !== undefined ? (tanggal ? new Date(tanggal) : null) : berita.tanggal,
                lokasi: lokasi !== undefined ? (lokasi || null) : berita.lokasi,
                isPublished: isPublished !== undefined ? (isPublished === "true" || isPublished === true) : berita.isPublished,
                content_images: finalImages.length > 0 ? finalImages.join(",") : "",
            },
            include: { category: true },
        });

        res.json({ message: "Berita berhasil diupdate", data: updated });
    } catch (err) {
        next(err as Error);
    }
};

const deleteBerita = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        console.log(`[deleteBerita] Starting delete for berita ID: ${id}`);

        const berita = await prisma.berita.findUnique({
            where: { id: Number(id) },
        });

        if (!berita) {
            console.warn(`[deleteBerita] Berita not found: ${id}`);
            return res.status(404).json({ message: "Berita tidak ditemukan" });
        }

        // Extract image names from both sources
        const fromContentImages = parseImageNames(berita.content_images);
        const fromHtmlContent = extractImageNamesFromHtml(berita.content);
        
        console.log(`[deleteBerita] Images from content_images: ${fromContentImages.join(", ") || "none"}`);
        console.log(`[deleteBerita] Images from HTML content: ${fromHtmlContent.join(", ") || "none"}`);

        const imageNames = Array.from(
            new Set([...fromContentImages, ...fromHtmlContent])
        );
        
        console.log(`[deleteBerita] Total unique images to delete: ${imageNames.length}`);

        // Delete each image file (non-critical - failures are logged but don't stop deletion)
        imageNames.forEach((fileName) => {
            try {
                deleteFile(fileName);
            } catch (err) {
                // Should not happen since deleteFile doesn't re-throw, but catch just in case
                console.error(`[deleteBerita] Unexpected error deleting ${fileName}:`, err);
            }
        });

        // Delete database record
        console.log(`[deleteBerita] Deleting berita record from database...`);
        await prisma.berita.delete({ where: { id: Number(id) } });
        console.log(`[deleteBerita] ✓ Successfully deleted berita ID: ${id}`);

        return res.status(200).json({ message: "Berita berhasil dihapus" });
    } catch (err) {
        console.error(`[deleteBerita] Error occurred:`, err);
        next(err as Error);
    }
};

const deleteImageFromBerita = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { filename } = req.body as { filename?: string };
        if (!filename || typeof filename !== 'string') {
            return res.status(400).json({ message: 'Filename wajib diberikan' });
        }

        const safeName = path.basename(filename);
        const berita = await prisma.berita.findUnique({ where: { id: Number(id) } });
        if (!berita) return res.status(404).json({ message: 'Berita tidak ditemukan' });

        const existing = (berita.content_images || '')
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean);

        const nextImages = existing.filter((img: string) => path.basename(img) !== safeName);

        // delete file from disk if exists
        const filePath = path.join(uploadDir, safeName);
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (err) {
            console.error(`[deleteImageFromBerita] gagal menghapus file ${filePath}:`, err);
        }

        const updated = await prisma.berita.update({
            where: { id: Number(id) },
            data: { content_images: nextImages.length > 0 ? nextImages.join(',') : "" },
        });

        return res.json({ message: 'Gambar berhasil dihapus', data: updated });
    } catch (err) {
        next(err as Error);
    }
};

const getBeritaCategories = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await prisma.beritaCategory.findMany({ orderBy: { name: "asc" } });
        res.json(categories);
    } catch (err) {
        next(err as Error);
    }
};

const createBeritaCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.body as Record<string, any>;
        if (!name) return res.status(400).json({ message: "Nama kategori wajib diisi" });

        const exists = await prisma.beritaCategory.findFirst({ where: { name } });
        if (exists) return res.status(400).json({ message: "Kategori sudah ada" });

        const category = await prisma.beritaCategory.create({ data: { name } });
        res.status(201).json(category);
    } catch (err) {
        next(err as Error);
    }
};

const updateBeritaCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const { name } = req.body as Record<string, any>;

        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ message: "ID kategori tidak valid" });
        }
        if (!name || !String(name).trim()) {
            return res.status(400).json({ message: "Nama kategori wajib diisi" });
        }

        const existing = await prisma.beritaCategory.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: "Kategori tidak ditemukan" });
        }

        const duplicate = await prisma.beritaCategory.findFirst({
            where: {
                name: String(name).trim(),
                NOT: { id },
            },
        });
        if (duplicate) {
            return res.status(409).json({ message: "Nama kategori sudah digunakan" });
        }

        const updated = await prisma.beritaCategory.update({
            where: { id },
            data: { name: String(name).trim() },
        });

        res.json({ message: "Kategori berita berhasil diperbarui", category: updated });
    } catch (err) {
        next(err as Error);
    }
};

const deleteBeritaCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ message: "ID kategori tidak valid" });
        }

        const existing = await prisma.beritaCategory.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ message: "Kategori tidak ditemukan" });
        }

        const usedCount = await prisma.berita.count({ where: { categoryId: id } });
        if (usedCount > 0) {
            return res.status(409).json({
                message: "Kategori sedang digunakan oleh berita dan tidak bisa dihapus",
                usedCount,
            });
        }

        await prisma.beritaCategory.delete({ where: { id } });

        res.json({ message: "Kategori berita berhasil dihapus" });
    } catch (err) {
        next(err as Error);
    }
};

export {
    createBerita, createBeritaCategory, deleteBerita, deleteBeritaCategory, getBeritaAdmin, getBeritaByIdAdmin,
    getBeritaByIdPublic, getBeritaCategories, getBeritaPublic, publishBerita,
    unpublishBerita, updateBerita, updateBeritaCategory
};

    export { deleteImageFromBerita };

export default {
    createBerita,
    getBeritaAdmin,
    getBeritaPublic,
    getBeritaByIdAdmin,
    getBeritaByIdPublic,
    updateBerita,
    deleteBerita,
    publishBerita,
    unpublishBerita,
    getBeritaCategories,
    createBeritaCategory,
    updateBeritaCategory,
    deleteBeritaCategory,
};
